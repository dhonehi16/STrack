export interface ILoginCredentials {
  username: string;
  password: string;
}

export interface IAuthResponse {
  access_token: string;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: 'username' | 'password' | 'general';
}

