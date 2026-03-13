/**
 * DTO: Login Request
 * Input data for login use case
 */
export class LoginRequest {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {
    if (email.length === 0 || password.length === 0) {
      throw new Error('Email and password are required');
    }
  }
}
