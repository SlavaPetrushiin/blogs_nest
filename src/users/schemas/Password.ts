import * as bcryptjs from 'bcryptjs';

class Password {
  async hashPassword(password: string): Promise<string | null> {
    try {
      const salt = await bcryptjs.genSalt(10);
      return await bcryptjs.hash(password, salt);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return bcryptjs.compare(password, hash);
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

export const PasswordService = new Password();
