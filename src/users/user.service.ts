import { Injectable } from '@nestjs/common';

type UserType = {
  id: number;
  name: string;
};

const usersDB = [{ id: 1, name: 'Alex' }];

@Injectable()
export class UserService {
  getUsers(term?: string): UserType[] {
    return usersDB.filter((user) => !term || user.name.indexOf(term) > -1);
  }

  findUserById(id: number): UserType {
    return usersDB.find((user: UserType) => user.id === id);
  }

  createUser(name: string): UserType {
    const newUser = { id: 2, name };
    usersDB.push(newUser);
    return newUser;
  }

  updateUser(id: number, name: string) {
    usersDB.find((user: UserType) => user.id === id).name = name;
    return true;
  }

  deleteUser(id: number): boolean {
    const usersIndex = usersDB.findIndex((user: UserType) => user.id !== id);
    usersDB.splice(usersIndex, 1);
    return true;
  }
}
