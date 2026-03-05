import dotenv from 'dotenv';

dotenv.config();

const getEnvVar = (key: string) : string => {
    const value = process.env[key];
    if (!value) {
        throw new Error (`Missing environment variable: ${key}`);
    };
    return value;
}

export const ENV = {
    JWT_SECRET: getEnvVar("JWT_SECRET"),
    JWT_EXPIRES_IN: getEnvVar("JWT_EXPIRES_IN"),
    REFRESH_TOKEN_SECRET: getEnvVar("REFRESH_TOKEN_SECRET"),
    REFRESH_TOKEN_EXPIRES_IN: getEnvVar("REFRESH_TOKEN_EXPIRES_IN"),
}