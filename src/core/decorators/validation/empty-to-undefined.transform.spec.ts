import {
  emptyToUndefined,
  queryParamToIntWithDefault,
  queryParamToStringWithDefault,
} from './empty-to-undefined.transform';

const params = (value: unknown) => ({ value, key: 'test', obj: {}, type: 0, options: {} });

describe('empty-to-undefined transforms', () => {
  it('emptyToUndefined handles empty, null-like and array values', () => {
    expect(emptyToUndefined(params(''))).toBeUndefined();
    expect(emptyToUndefined(params('   '))).toBeUndefined();
    expect(emptyToUndefined(params('null'))).toBeUndefined();
    expect(emptyToUndefined(params('undefined'))).toBeUndefined();
    expect(emptyToUndefined(params(['France']))).toBe('France');
    expect(emptyToUndefined(params(' capital '))).toBe('capital');
  });

  it('queryParamToIntWithDefault handles empty, invalid and array values', () => {
    const toInt = queryParamToIntWithDefault(10);

    expect(toInt(params(''))).toBe(10);
    expect(toInt(params(['2']))).toBe(2);
    expect(toInt(params('null'))).toBe(10);
    expect(toInt(params('abc'))).toBe(10);
    expect(toInt(params(' 3 '))).toBe(3);
  });

  it('queryParamToStringWithDefault handles empty, invalid and array values', () => {
    const toString = queryParamToStringWithDefault('all');

    expect(toString(params(''))).toBe('all');
    expect(toString(params(['published']))).toBe('published');
    expect(toString(params('null'))).toBe('all');
    expect(toString(params(' notPublished '))).toBe('notPublished');
  });
});
