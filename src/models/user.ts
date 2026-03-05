export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  plan: "free" | "basic" | "premium";
  created_at: Date;
}

export interface UserPublic {
  id: number;
  username: string;
  email: string;
  plan: "free" | "basic" | "premium";
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}
