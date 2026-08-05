export type InsertPkStrategy = 'uuidv4-pk' | 'uuidv7-pk' | 'bigint-v7-public';

export interface InsertPkScaleMeasurement {
  scale: number;
  insertMs: number;
  pkIndexMb: number;
  uqIndexMb: number | null;
}

export interface InsertPkScalingRatio {
  fromScale: number;
  toScale: number;
  ratio: number;
}

export interface InsertPkStrategyReport {
  strategy: InsertPkStrategy;
  measurements: InsertPkScaleMeasurement[];
  scalingRatios: InsertPkScalingRatio[];
}

export interface InsertPkAssertionResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface InsertPkBenchmarkReport {
  scales: number[];
  strategies: InsertPkStrategyReport[];
  assertions: InsertPkAssertionResult[];
  allPassed: boolean;
}
