import { BcryptService } from './bcrypt.service';

describe('BcryptService', () => {
  const service = new BcryptService();

  it('generateHash returns a hash different from plaintext that compares successfully', async () => {
    const password = 'plain-password-123';

    const hash = await service.generateHash(password);

    expect(hash).not.toBe(password);
    await expect(service.compare(password, hash)).resolves.toBe(true);
  });

  it('compare returns true for matching password and hash', async () => {
    const password = 'correct-password';
    const hash = await service.generateHash(password);

    await expect(service.compare(password, hash)).resolves.toBe(true);
  });

  it('compare returns false for mismatched password and hash', async () => {
    const hash = await service.generateHash('correct-password');

    await expect(service.compare('wrong-password', hash)).resolves.toBe(false);
  });
});
