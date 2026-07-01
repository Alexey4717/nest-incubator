export type LoginSuccessViewModel = {
  accessToken: string;
};

export type AuthTokensViewModel = LoginSuccessViewModel & {
  refreshToken: string;
};

export type MeViewModel = {
  email: string;
  login: string;
  userId: string;
};
