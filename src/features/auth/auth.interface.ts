export interface AuthPayload {
  sub: string; // userId
  email: string;
  iat?: number;
  exp?: number;
}
