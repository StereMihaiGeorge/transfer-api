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
    JWT_SECRET: getEnvVar("JWT_SECRET"),
    JWT_ACCESS_EXPIRES: getEnvVar("JWT_ACCESS_EXPIRES"),
    JWT_REFRESH_SECRET: getEnvVar("JWT_REFRESH_SECRET"),
    JWT_REFRESH_EXPIRES: getEnvVar("JWT_REFRESH_EXPIRES"),
};
