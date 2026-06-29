export const jwtConstants = {
  accessSecret: process.env.ACCESS_TOKEN_SECRET || 'staging-access-secret',
  refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'staging-refresh-secret',
};
export const basicConstants = {
  userName: process.env.SA_LOGIN || 'admin',
  password: process.env.SA_PASSWORD || 'qwerty',
};
