import { validateOrReject } from 'class-validator';

export const validateOrRejectModel = async (
  model: any,
  classConstructor: { new (): any },
  errorPlace: string,
) => {
  // так можно сделать дополнительную проверку, если тип не дто (созданный с помощью класса),
  // то валидация не пройдет classValidator`ом
  if (model instanceof classConstructor === false) {
    throw new Error(`${errorPlace}: inputModel not instanceof ${classConstructor.name}`);
  }
  try {
    await validateOrReject(model);
  } catch (error: unknown) {
    // регенерация ошибки, чтобы она попала в exception filter внутренних ошибок сервера
    throw error instanceof Error ? error : new Error(String(error));
  }
};
