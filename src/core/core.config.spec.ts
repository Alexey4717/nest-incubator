import { CoreConfig, Environments } from './core.config';

describe('CoreConfig', () => {
  const original = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    INCLUDE_TESTING_MODULE: process.env.INCLUDE_TESTING_MODULE,
    IP_RESTRICTION_ENABLED: process.env.IP_RESTRICTION_ENABLED,
  };

  afterEach(() => {
    process.env.PORT = original.PORT;
    process.env.NODE_ENV = original.NODE_ENV;
    process.env.INCLUDE_TESTING_MODULE = original.INCLUDE_TESTING_MODULE;
    process.env.IP_RESTRICTION_ENABLED = original.IP_RESTRICTION_ENABLED;
  });

  it('reads env values and exposes environment getters', () => {
    process.env.PORT = '5555';
    process.env.NODE_ENV = Environments.Testing;
    process.env.INCLUDE_TESTING_MODULE = 'true';
    process.env.IP_RESTRICTION_ENABLED = '1';

    const config = new CoreConfig();

    expect(config.PORT).toBe(5555);
    expect(config.env).toBe(Environments.Testing);
    expect(config.includeTestingModule).toBe(true);
    expect(config.ipRestrictionEnabled).toBe(true);
    expect(config.isTesting).toBe(true);
    expect(config.isDevelopment).toBe(false);
    expect(config.isProduction).toBe(false);
  });

  it('detects production environment', () => {
    process.env.NODE_ENV = Environments.Production;
    process.env.PORT = '4000';
    delete process.env.INCLUDE_TESTING_MODULE;
    process.env.IP_RESTRICTION_ENABLED = 'false';

    const config = new CoreConfig();

    expect(config.isProduction).toBe(true);
    expect(config.includeTestingModule).toBe(false);
  });
});
