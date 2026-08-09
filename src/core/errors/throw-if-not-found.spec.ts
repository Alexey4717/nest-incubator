import { DomainExceptionCode } from './domain-exception-code.enum';
import { DomainException } from './domain.exception';
import { throwIfNotFound } from './throw-if-not-found';

describe('throwIfNotFound', () => {
  it('returns value when present', () => {
    expect(throwIfNotFound({ id: '1' })).toEqual({ id: '1' });
    expect(throwIfNotFound(0)).toBe(0);
    expect(throwIfNotFound('')).toBe('');
  });

  it('throws NotFound when value is null or undefined', () => {
    expect(() => throwIfNotFound(null)).toThrow(DomainException);
    expect(() => throwIfNotFound(undefined)).toThrow(
      expect.objectContaining({ code: DomainExceptionCode.NotFound }),
    );
  });
});
