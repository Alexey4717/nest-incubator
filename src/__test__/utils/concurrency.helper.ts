export async function runParallelRequests<T>(
  count: number,
  factory: (index: number) => Promise<T>,
): Promise<T[]> {
  return Promise.all(Array.from({ length: count }, (_, index) => factory(index)));
}

export function countStatuses(results: { status: number }[], status: number): number {
  return results.filter((result) => result.status === status).length;
}
