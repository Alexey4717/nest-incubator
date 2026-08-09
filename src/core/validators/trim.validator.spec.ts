import { ValidationArguments } from 'class-validator';

import { TrimValidator } from './trim.validator';

describe('TrimValidator', () => {
  const validator = new TrimValidator();

  it('returns true for non-string values', () => {
    expect(validator.validate(null)).toBe(true);
    expect(validator.validate(undefined)).toBe(true);
    expect(validator.validate(123)).toBe(true);
    expect(validator.validate({})).toBe(true);
  });

  it('returns true for strings with non-whitespace content', () => {
    expect(validator.validate('a')).toBe(true);
    expect(validator.validate('  hello  ')).toBe(true);
  });

  it('returns false for empty or whitespace-only strings', () => {
    expect(validator.validate('')).toBe(false);
    expect(validator.validate('   ')).toBe(false);
    expect(validator.validate('\t\n')).toBe(false);
  });

  it('returns default empty-field message', () => {
    expect(validator.defaultMessage({} as ValidationArguments)).toBe("This field can't be empty");
  });
});
