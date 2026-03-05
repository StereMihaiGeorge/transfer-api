import brycpt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { ENV } from '../config/env';
import { UserPublic } from '../models/user';

const SALT_ROUNDS = 10;

export const registerUser = async (
    username: string,
    password: string,
    balance: number = 0
): Promise<UserPublic> => {
    // check if username exists
    const existing = await pool.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
    );

    if (existing.rows.length > 0) {
        throw new Error("Username already exists");
    }

    // Hash the password

    const hashedPassword = await brycpt.hash(password, SALT_ROUNDS);

    // save user in db

    const result = await pool.query<UserPublic>(
        `INSERT INTO users (username, password, balance)
        VALUES ($1, $2, $3)
        RETURNING id, username, balance`,
        [username, hashedPassword, balance]
    )

    return result.rows[0];
};

export const loginUser = async (
    username: string,
    password: string
): Promise<{ accessToken: string; refreshToken: string }> => {

    //find user by username
    const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );

    if (result.rows.length === 0) {
        throw new Error("Invalid username or password");
    };

    const user = result.rows[0];

    // compare password with hashed password
    const isValid = await brycpt.compare(password, user.password);

    if (!isValid) {
        throw new Error("Invalid username or password");
    }

    const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        ENV.JWT_SECRET,
        { expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    const refreshToken = jwt.sign(
        { id: user.id, username: user.username },
        ENV.REFRESH_TOKEN_SECRET,
        { expiresIn: ENV.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    const decoded = jwt.decode(refreshToken) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);

    await pool.query(
        "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, refreshToken, expiresAt]
    );

    return { accessToken, refreshToken };
};

export const refreshAccessToken = async (
    refreshToken: string
): Promise<string> => {
    let payload: { id: number; username: string };

    try {
        payload = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET) as { id: number; username: string };
    } catch {
        throw new Error("Invalid or expired refresh token");
    }

    const result = await pool.query(
        "SELECT id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
        [refreshToken]
    );

    if (result.rows.length === 0) {
        throw new Error("Refresh token not found or revoked");
    }

    return jwt.sign(
        { id: payload.id, username: payload.username },
        ENV.JWT_SECRET,
        { expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
    await pool.query(
        "DELETE FROM refresh_tokens WHERE token = $1",
        [refreshToken]
    );
};
