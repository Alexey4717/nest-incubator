import { GetMeHandler, GetMeQuery } from './get-me.query';

describe('GetMeHandler', () => {
  it('delegates userId to GetMeUseCase', async () => {
    const getMeUseCase = {
      execute: jest.fn().mockResolvedValue({ userId: 'u1', login: 'l', email: 'e' }),
    };
    const handler = new GetMeHandler(getMeUseCase as never);

    await expect(handler.execute(new GetMeQuery('u1'))).resolves.toEqual({
      userId: 'u1',
      login: 'l',
      email: 'e',
    });
    expect(getMeUseCase.execute).toHaveBeenCalledWith('u1');
  });
});
