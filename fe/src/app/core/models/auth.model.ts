export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthenticatedUser;
}

export interface LoginResponse {
  success: boolean;
  data: AuthSession;
}
