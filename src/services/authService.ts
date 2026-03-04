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
): Promise<string> => {
    
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

    // generate JWT token

    const token = jwt.sign(
        {id: user.id, username: user.username},
        ENV.JWT_SECRET,
        { expiresIn: "1h"}
    );

    return token;
}