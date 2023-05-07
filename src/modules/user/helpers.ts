import {
  GetMappedUserOutputModel,
  GetUserOutputModelFromMongoDB,
} from './models/GetUserOutputModel';

export const getMappedUserViewModel = ({
  id,
  accountData,
}: GetUserOutputModelFromMongoDB): GetMappedUserOutputModel => ({
  id,
  login: accountData.login,
  email: accountData.email,
  createdAt: accountData.createdAt,
});
