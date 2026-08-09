import { IsNumber, IsString } from 'class-validator';
import 'reflect-metadata';

import {
  applyValidatedConfig,
  convertToBoolean,
  getEnumValues,
  validateConfig,
} from './config-validation.utility';

class SampleConfig {
  @IsString()
  name!: string;

  @IsNumber()
  port!: number;
}

enum SampleEnum {
  A = 'a',
  B = 'b',
}

describe('config-validation.utility', () => {
  describe('validateConfig', () => {
    it('returns validated instance', () => {
      const result = validateConfig({ name: 'app', port: '3000' }, SampleConfig);
      expect(result).toBeInstanceOf(SampleConfig);
      expect(result).toMatchObject({ name: 'app', port: 3000 });
    });

    it('throws when config is invalid', () => {
      expect(() => validateConfig({ name: 1, port: 'x' }, SampleConfig)).toThrow(Error);
    });
  });

  describe('convertToBoolean', () => {
    it('handles boolean, undefined and string values', () => {
      expect(convertToBoolean(true)).toBe(true);
      expect(convertToBoolean(false)).toBe(false);
      expect(convertToBoolean(undefined)).toBe(false);
      expect(convertToBoolean('true')).toBe(true);
      expect(convertToBoolean('1')).toBe(true);
      expect(convertToBoolean('false')).toBe(false);
    });
  });

  describe('getEnumValues', () => {
    it('returns enum values', () => {
      expect(getEnumValues(SampleEnum)).toEqual(['a', 'b']);
    });
  });

  describe('applyValidatedConfig', () => {
    it('assigns validated fields onto target', () => {
      const target = { name: '', port: 0 };
      applyValidatedConfig(target, { name: 'svc', port: 4000 }, SampleConfig);
      expect(target).toEqual({ name: 'svc', port: 4000 });
    });
  });
});
