export interface User {
    id: number,
    username: string;
    balance: number
};

export interface TranferResult {
    message: string,
    sender: User,
    receiver: User;
}