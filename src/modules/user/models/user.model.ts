export type UserModel = {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  confirmationCode: string | null;
  confirmationExpiration: Date | null;
  isConfirmed: boolean;
  recoveryCode: string | null;
  recoveryExpiration: Date | null;
};
