const getConfig = () => {
  const PORT = parseInt(process.env.PORT, 10) || 4000;
  // const POSTGRES_URI = process.env.POSTGRES_URI;
  const MONGO_URI = process.env.MONGO_URI;
  const DB_NAME = process.env.DB_NAME || 'It-incubator-01-dev';
  const DB_TYPE = process.env.DB_TYPE;
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
  const ACCESS_TOKEN_LIFE_TIME = process.env.ACCESS_TOKEN_LIFE_TIME;
  const REFRESH_TOKEN_LIFE_TIME = process.env.REFRESH_TOKEN_LIFE_TIME;
  const NODEMAILER_USER_TRANSPORT = process.env.NODEMAILER_USER_TRANSPORT;
  const NODEMAILER_PASSWORD_TRANSPORT =
    process.env.NODEMAILER_PASSWORD_TRANSPORT;
  const MAIN_URL = process.env.MAIN_URL;

  const idPatternByDBType = {
    MONGO: '[0-9a-f]{24}',
    SQL: '[0-9a-f]{24}',
  };
  const ID_PATTERN_BY_DB_TYPE = idPatternByDBType[DB_TYPE];

  return {
    PORT,
    // POSTGRES_URI,
    MONGO_URI,
    DB_NAME,
    DB_TYPE,
    ID_PATTERN_BY_DB_TYPE,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_LIFE_TIME,
    REFRESH_TOKEN_LIFE_TIME,
    NODEMAILER_USER_TRANSPORT,
    NODEMAILER_PASSWORD_TRANSPORT,
    MAIN_URL,
  };
};

type ConfigType = ReturnType<typeof getConfig>;

// export AdditionalConfigType = ConfigType & { ...some variables }
export default getConfig;
