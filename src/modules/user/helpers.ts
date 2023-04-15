import {
  GetMappedUserOutputModel,
  GetUserOutputModelFromMongoDB,
} from './models/GetUserOutputModel';

export const getMappedUserViewModel = ({
  _id,
  accountData,
}: GetUserOutputModelFromMongoDB): GetMappedUserOutputModel => ({
  id: _id.toString(),
  login: accountData.login,
  email: accountData.email,
  createdAt: accountData.createdAt,
});
