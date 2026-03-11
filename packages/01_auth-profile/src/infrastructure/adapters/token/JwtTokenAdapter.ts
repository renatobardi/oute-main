import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

/**
 * JwtTokenAdapter
 * - Generates and validates JWT tokens using jsonwebtoken
 */
export class JwtTokenAdapter {
  private readonly secret: string;
  private readonly expiresIn: string = '24h';

  constructor(secret: string) {
    if (secret.length === 0 || secret.trim().length === 0) {
      throw new Error('JWT secret cannot be empty');
    }
    this.secret = secret;
  }

  generate(payload: TokenPayload): Promise<string> {
    const token = jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    return Promise.resolve(token);
  }

  verify(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return Promise.resolve({
        userId: decoded.userId,
        email: decoded.email,
        roles: decoded.roles,
      });
    } catch {
      return Promise.resolve(null);
    }
  }

  decode(token: string): Partial<TokenPayload & { exp: number }> | null {
    try {
      return jwt.decode(token) as Partial<TokenPayload & { exp: number }>;
    } catch {
      return null;
    }
  }

  isExpired(token: string): boolean {
    const decoded = this.decode(token);
    if (decoded === null || decoded.exp === null || decoded.exp === undefined) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  }
}
