/** Соответствует [basic-auth.guard.ts](src/guards/basic-auth.guard.ts): `admin:qwerty` */

export const ADMIN_BASIC_AUTH_HEADER =
  'Basic ' + Buffer.from('admin:qwerty').toString('base64');
