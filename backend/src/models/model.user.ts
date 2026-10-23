export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
  name: string;
}
