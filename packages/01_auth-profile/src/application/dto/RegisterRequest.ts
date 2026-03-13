/**
 * DTO: Register Request
 * Input data for register use case
 */
export class RegisterRequest {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name: string
  ) {
    if (email.length === 0 || password.length === 0 || name.length === 0) {
      throw new Error('Email, password, and name are required');
    }
  }
}
