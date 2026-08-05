import { ExplainBuffers, ExplainMetrics, ScanType } from './benchmark.types';

interface ExplainJsonPlan {
  Plan: ExplainPlanNode;
  'Planning Time'?: number;
  'Execution Time'?: number;
}

interface ExplainPlanNode {
  'Node Type': string;
  'Index Name'?: string;
  'Relation Name'?: string;
  Plans?: ExplainPlanNode[];
  'Shared Hit Blocks'?: number;
  'Shared Read Blocks'?: number;
  'Shared Written Blocks'?: number;
}

function collectScanNodes(node: ExplainPlanNode): ExplainPlanNode[] {
  const nodes = [node];
  for (const child of node.Plans ?? []) {
    nodes.push(...collectScanNodes(child));
  }
  return nodes;
}

function pickPrimaryScanNode(nodes: ExplainPlanNode[]): ExplainPlanNode {
  const tableScans = nodes.filter((node) =>
    ['Seq Scan', 'Index Scan', 'Index Only Scan', 'Bitmap Heap Scan'].includes(node['Node Type']),
  );
  return tableScans[0] ?? nodes[0];
}

function sumBuffers(nodes: ExplainPlanNode[]): ExplainBuffers {
  return nodes.reduce(
    (acc, node) => ({
      sharedHit: acc.sharedHit + (node['Shared Hit Blocks'] ?? 0),
      sharedRead: acc.sharedRead + (node['Shared Read Blocks'] ?? 0),
      sharedWritten: acc.sharedWritten + (node['Shared Written Blocks'] ?? 0),
    }),
    { sharedHit: 0, sharedRead: 0, sharedWritten: 0 },
  );
}


function unwrapExplainRows(raw: unknown): ExplainJsonPlan[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [];
  }

  const first = raw[0] as Record<string, unknown>;
  if (first && typeof first === 'object' && 'QUERY PLAN' in first) {
    const queryPlan = first['QUERY PLAN'];
    if (typeof queryPlan === 'string') {
      return JSON.parse(queryPlan) as ExplainJsonPlan[];
    }
    if (Array.isArray(queryPlan)) {
      return queryPlan as ExplainJsonPlan[];
    }
  }

  return raw as ExplainJsonPlan[];
}

function planUsesIndexScan(node: ExplainPlanNode): boolean {
  const nodes = collectScanNodes(node);
  return nodes.some((scanNode) =>
    ['Index Scan', 'Index Only Scan', 'Bitmap Index Scan', 'Bitmap Heap Scan'].includes(
      scanNode['Node Type'],
    ),
  );
}

export function parseExplainJson(raw: unknown): ExplainMetrics {
  const rows = unwrapExplainRows(raw);
  const root = rows[0];

  if (!root?.Plan) {
    throw new Error('Invalid EXPLAIN JSON: missing Plan root');
  }

  const allNodes = collectScanNodes(root.Plan);
  const primary = pickPrimaryScanNode(allNodes);

  return {
    executionTimeMs: root['Execution Time'] ?? 0,
    planningTimeMs: root['Planning Time'] ?? 0,
    scanType: primary['Node Type'] as ScanType,
    indexName: primary['Index Name'] ?? null,
    buffers: sumBuffers(allNodes),
    usesIndexScan: planUsesIndexScan(root.Plan),
  };
}

export function isIndexScan(scanType: ScanType, usesIndexScan?: boolean): boolean {
  if (usesIndexScan === true) {
    return true;
  }

  return ['Index Scan', 'Index Only Scan', 'Bitmap Index Scan', 'Bitmap Heap Scan'].includes(
    scanType,
  );
}
