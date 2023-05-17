import { validateOrReject } from 'class-validator';

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

export const validateOrRejectModel = async (
  model: any,
  classConstructor: { new (): any },
  errorPlace: string,
) => {
  // так можно сделать дополнительную проверку, если тип не дто (созданный с помощью класса),
  // то валидация не пройдет classValidator`ом
  if (model instanceof classConstructor === false) {
    throw new Error(
      `${errorPlace}: inputModel not instanceof ${classConstructor.name}`,
    );
  }
  try {
    await validateOrReject(model);
  } catch (error) {
    // регенерация ошибки, чтобы она попала в exception filter внутренних ошибок сервера
    throw new Error(error);
  }
};
