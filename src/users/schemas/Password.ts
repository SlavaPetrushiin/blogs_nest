import * as bcrypt from 'bcrypt';

class Password {
  async hashPassword(password: string): Promise<string | null> {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return bcrypt.compare(password, hash);
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

export const PasswordService = new Password();
