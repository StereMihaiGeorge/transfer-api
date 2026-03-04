export interface User {
    id: number,
    username: string;
    password: string;
    balance: number
};

export interface UserPublic {
    id: number, 
    username: string,
    password: string
}

export interface TranferResult {
    message: string,
    sender: User,
    receiver: User;
}