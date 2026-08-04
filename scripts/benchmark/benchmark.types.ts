export type ScanType =
  | 'Index Scan'
  | 'Index Only Scan'
  | 'Bitmap Index Scan'
  | 'Bitmap Heap Scan'
  | 'Seq Scan'
  | string;

export interface ExplainBuffers {
  sharedHit: number;
  sharedRead: number;
  sharedWritten: number;
}

export interface ExplainMetrics {
  executionTimeMs: number;
  planningTimeMs: number;
  scanType: ScanType;
  indexName: string | null;
  buffers: ExplainBuffers;
}

export interface BenchmarkScenarioConfig {
  id: string;
  label: string;
  sqlTemplate: string;
  indexName: string;
  seedKind: 'users' | 'posts' | 'sessions';
}

export interface ScaleMeasurement {
  scale: number;
  withIndex: ExplainMetrics;
  withoutIndex: ExplainMetrics;
}

export interface ScalingRatio {
  fromScale: number;
  toScale: number;
  withIndexRatio: number;
  withoutIndexRatio: number;
}

export interface ScenarioReport {
  scenario: BenchmarkScenarioConfig;
  measurements: ScaleMeasurement[];
  scalingRatios: ScalingRatio[];
  maxScaleSpeedup: number;
  assertions: AssertionResult[];
}

export interface AssertionResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface BenchmarkReport {
  scales: number[];
  scenarios: ScenarioReport[];
  allPassed: boolean;
}
