type CalculateAndGetSkipValueArgs = {
  pageNumber: number;
  pageSize: number;
};

export const calculateAndGetSkipValue = ({
  pageNumber,
  pageSize,
}: CalculateAndGetSkipValueArgs) => {
  return (pageNumber - 1) * pageSize;
};
