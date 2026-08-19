export class UserRegisteredEvent {
  constructor(
    public readonly email: string,
    public readonly login: string,
    public readonly code: string,
  ) {}
}
