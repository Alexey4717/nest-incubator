import { UserModel } from '../models/user.model';
import { UserViewModel } from '../types/view-models';

export function toUserViewModel(model: UserModel): UserViewModel {
  return {
    id: model.id,
    login: model.login,
    email: model.email,
    createdAt: model.createdAt,
  };
}
