export type BadRequestErrorItem = {
  message: string;
  field: string;
};

export type BadRequestErrorBody = {
  message: BadRequestErrorItem[];
  error: 'Bad Request';
};

export const createBadRequestErrors = (
  errors: BadRequestErrorItem | BadRequestErrorItem[],
): BadRequestErrorBody => ({
  message: Array.isArray(errors) ? errors : [errors],
  error: 'Bad Request',
});
