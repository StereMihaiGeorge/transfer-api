import dotenv from 'dotenv';

dotenv.config();

const getEnvVar = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const ENV = {
  // Database
  DB_HOST: getEnvVar("DB_HOST"),
  DB_PORT: Number.parseInt(getEnvVar("DB_PORT")),
  DB_USER: getEnvVar("DB_USER"),
  DB_PASSWORD: getEnvVar("DB_PASSWORD"),
  DB_NAME: getEnvVar("DB_NAME"),

  // JWT
  JWT_SECRET: getEnvVar("JWT_SECRET"),
  JWT_REFRESH_SECRET: getEnvVar("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES: getEnvVar("JWT_ACCESS_EXPIRES"),
  JWT_REFRESH_EXPIRES: getEnvVar("JWT_REFRESH_EXPIRES"),

  // Frontend
  FRONTEND_URL: getEnvVar("FRONTEND_URL"),
};
