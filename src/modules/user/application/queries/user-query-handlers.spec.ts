import { CheckCredentialsHandler, CheckCredentialsQuery } from './check-credentials.query';
import { FindUserByIdHandler, FindUserByIdQuery } from './find-user-by-id.query';
import { GetUsersHandler, GetUsersQuery } from './get-users.query';

describe('user query handlers', () => {
  it('CheckCredentialsHandler delegates input', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue({ id: 'u1' }) };
    const handler = new CheckCredentialsHandler(useCase as never);
    const input = { loginOrEmail: 'l', password: 'p' };

    await expect(handler.execute(new CheckCredentialsQuery(input))).resolves.toEqual({ id: 'u1' });
    expect(useCase.execute).toHaveBeenCalledWith(input);
  });

  it('FindUserByIdHandler delegates id', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue({ id: 'u1' }) };
    const handler = new FindUserByIdHandler(useCase as never);

    await handler.execute(new FindUserByIdQuery('u1'));
    expect(useCase.execute).toHaveBeenCalledWith('u1');
  });

  it('GetUsersHandler delegates query input', async () => {
    const useCase = { execute: jest.fn().mockResolvedValue({ items: [] }) };
    const handler = new GetUsersHandler(useCase as never);
    const input = { pageNumber: 1, pageSize: 10 } as never;

    await handler.execute(new GetUsersQuery(input));
    expect(useCase.execute).toHaveBeenCalledWith(input);
  });
});
