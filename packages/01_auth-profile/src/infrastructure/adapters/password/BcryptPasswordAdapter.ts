import bcrypt from 'bcrypt';
import { Password } from '../../../domain';

/**
 * BcryptPasswordAdapter
 * - Adapts bcrypt hashing to domain Password value object
 * - Uses real bcrypt for secure password hashing
 */
export class BcryptPasswordAdapter {
  private readonly saltRounds = 10;

  async hash(plainPassword: string): Promise<Password> {
    Password.validateStrength(plainPassword);
    const hash = await bcrypt.hash(plainPassword, this.saltRounds);
    return Password.fromPlaintext(hash);
  }

  async compare(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}
