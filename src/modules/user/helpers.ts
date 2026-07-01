import { GetUserOutputModelFromMongoDB } from './models/GetUserOutputModel';
import { UserViewModel } from './types/view-models';

export const getMappedUserViewModel = ({
  id,
  accountData,
}: GetUserOutputModelFromMongoDB): UserViewModel => ({
  id,
  login: accountData.login,
  email: accountData.email,
  createdAt: accountData.createdAt,
});
