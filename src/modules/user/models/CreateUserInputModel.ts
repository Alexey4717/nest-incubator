export type CreateUserInputModel = {
  /**
   * Set user`s login. Required. MaxLength: 10, minLength: 3.
   */
  login: string;

  /**
   * Password of created user. Required. MaxLength: 20, minLength: 6.
   */
  password: string;

  /**
   * Set user`s email, required.
   */
  email: string;
};
