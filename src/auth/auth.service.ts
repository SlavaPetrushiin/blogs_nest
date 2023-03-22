import { RefreshTokenJwtPayloadDto } from './dto/refresh-token-jwt-payload.dto';
import { Email } from './../email/email.service';
import { getArrayErrors } from './../utils/getArrayErrors';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './../users/schemas/Password';
import { FindUserByEmailOrLogin } from './../users/users.service';
import { UsersService } from './../users/users.service';
import { Injectable, BadRequestException, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { PasswordRecoveryRepository } from './password-recovery.repository';
import jwt from 'jsonwebtoken';

const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;

function isEmailValid(value) {
  return EMAIL_REGEXP.test(value);
}

const EXPIRES_ACCESS_TIME = '10h'; //'10s';
const EXPIRES_REFRESH_TIME = '20h'; //'20s';

export const convertJwtPayloadSecondsToIsoDate = (value: number): string => {
  return new Date(value * 1000).toISOString();
};

export interface IRefreshTokenPayload extends JwtService {
  userId: string;
  deviceId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: Email,
    private readonly passwordRecoveryRepository: PasswordRecoveryRepository,
  ) {}

  async findUserById(userId) {
    const user = await this.usersService.findUserById(userId);
    const { login, email, id, ...rest } = user;
    return { login, email, userId: id };
  }

  async confirmCode(code: string) {
    const user = await this.usersService.findUserByCode(code);
    if (!user) {
      throw new BadRequestException(getArrayErrors('code', 'Не валидный код'));
    }
    if (user.emailConfirmation.code != code) {
      throw new BadRequestException(getArrayErrors('code', 'Не валидный код'));
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException(getArrayErrors('code', 'Email подтвержден'));
    }
    if (new Date() > user.emailConfirmation.expirationData) {
      throw new BadRequestException(getArrayErrors('code', 'Не валидный код'));
    }

    const isUpdateConfirm = await this.usersService.updateConfirmationStatus(user.id);

    if (!isUpdateConfirm) {
      throw new BadRequestException(getArrayErrors('code', 'Не валидный код'));
    }

    return isUpdateConfirm;
  }

  async confirmResending(email: string) {
    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException(getArrayErrors('email', 'Пользователя с таким email не существует'));
    }

    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException(getArrayErrors('email', 'Email подтвержден'));
    }

    const newCode = uuidv4();
    const newExpirationData = add(new Date(), { hours: 1, minutes: 3 });
    const updatedClient = await this.usersService.updateConfirmationCode(user.id, newCode, newExpirationData);

    if (!updatedClient) {
      throw new BadRequestException(getArrayErrors('code', 'Не удалось обновить код'));
    }

    const url = this.emailService.getMessageForSendingEmail('confirm-registration?code', newCode, 'registration');
    await this.emailService.sendEmail(user.email, url);

    return updatedClient;
  }

  async passwordRecovery(email: string) {
    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException(getArrayErrors('email', 'Пользователя с таким email не существует'));
    }

    if (!user.emailConfirmation.isConfirmed) {
      throw new BadRequestException(getArrayErrors('email', 'Email не подтвержден'));
    }

    const recoveryCode = uuidv4();
    const dateExpired = add(new Date(), { hours: 1 });
    const isCreatedRecovery = await this.passwordRecoveryRepository.createOrUpdatePasswordRecovery(recoveryCode, email, dateExpired);

    if (!isCreatedRecovery) {
      throw new BadRequestException(getArrayErrors('email', 'Не удалось создать код на обновление пароля'));
    }

    const url = this.emailService.getMessageForSendingEmail('password-recovery?recoveryCode', recoveryCode, 'recoveryCode');
    await this.emailService.sendEmail(email, url);

    return isCreatedRecovery;
  }

  async updatePassword(newPassword: string, recoveryCode: string) {
    const foundedRecoveryObject = await this.passwordRecoveryRepository.getRecoveryPassword(recoveryCode);

    if (!foundedRecoveryObject) {
      getArrayErrors('email', 'Не удалось обновить пароль');
    }
    if (new Date() > foundedRecoveryObject.dateExpired) {
      getArrayErrors('email', 'Не удалось обновить пароль');
    }

    const user = await this.usersService.findUserByEmail(foundedRecoveryObject.email);

    if (!user) {
      getArrayErrors('email', 'Не удалось обновить пароль');
    }

    const passwordHash = await PasswordService.hashPassword(newPassword);

    if (!passwordHash) {
      getArrayErrors('email', 'Не удалось обновить пароль');
    }

    const isUpdatedPassword = await this.usersService.updatePassword(user.id, passwordHash);

    if (!isUpdatedPassword) {
      getArrayErrors('email', 'Не удалось обновить пароль');
    }

    return isUpdatedPassword;
  }

  async updateRefreshToken(user: { id: string; deviceId: string; iat: number; exp: number }) {
    const { id, iat, deviceId } = user;
    const foundedSession = await this.authRepository.getSession(convertJwtPayloadSecondsToIsoDate(iat), id, deviceId);

    if (!foundedSession) {
      throw new UnauthorizedException();
    }

    const accessToken = jwt.sign({ id, deviceId }, process.env.JWT_ACCESS_SECRET, { expiresIn: EXPIRES_ACCESS_TIME });
    const refreshToken = jwt.sign({ id, deviceId }, process.env.JWT_REFRESH_SECRET, { expiresIn: EXPIRES_REFRESH_TIME });
    const decodedRefreshToken: any = this.jwtService.decode(refreshToken);

    const result = await this.authRepository.updateSession({
      oldLastActiveDate: foundedSession.lastActiveDate,
      lastActiveDate: convertJwtPayloadSecondsToIsoDate(decodedRefreshToken.iat),
      exp: convertJwtPayloadSecondsToIsoDate(decodedRefreshToken.exp),
    });

    if (!result) {
      throw new UnauthorizedException();
    }

    return { accessToken, refreshToken };
  }

  async findAllSessions(userId: string) {
    return this.authRepository.findAllSessions(userId);
  }

  async removeAllSessionsUserNotCurrent(userId: string, deviceId: string) {
    return this.authRepository.removeAllSessionsUserNotCurrent(userId, deviceId);
  }

  async removeCurrentDevice(userId: string, deviceId: string): Promise<boolean> {
    const foundedDevice = await this.authRepository.getDevice(deviceId);
    if (!foundedDevice) {
      throw new NotFoundException();
    }

    if (userId != foundedDevice.userId) {
      throw new ForbiddenException();
    }

    const isDeletedSessions = await this.authRepository.removeSession(userId, deviceId);
    if (!isDeletedSessions) {
      throw new UnauthorizedException();
    }
    return isDeletedSessions;
  }

  async validateUser(emailOrLogin: string, pass: string): Promise<any> {
    const payload: FindUserByEmailOrLogin = {};
    const isEmail = isEmailValid(emailOrLogin);

    if (!emailOrLogin.trim().length || !pass.trim().length) {
      return null;
    }

    if (isEmail) {
      payload.email = emailOrLogin;
    } else {
      payload.login = emailOrLogin;
    }

    const foundedUser = await this.usersService.findUserByEmailOrLogin(payload);

    if (foundedUser.banInfo.banDate) {
      throw new UnauthorizedException();
    }

    if (!foundedUser) {
      return null;
    }

    const isValidPassword = await PasswordService.comparePassword(pass, foundedUser.password);

    if (!isValidPassword) {
      return null;
    }

    return {
      id: foundedUser.id,
      login: foundedUser.login,
      email: foundedUser.email,
      createdAt: foundedUser.createdAt,
    };
  }

  async login(user: any, ipAddress: string, title: string) {
    const { id, login } = user;

    const deviceId = uuidv4();
    const accessToken = jwt.sign({ id, login }, process.env.JWT_ACCESS_SECRET, { expiresIn: EXPIRES_ACCESS_TIME });
    const refreshToken = jwt.sign({ id, deviceId }, process.env.JWT_REFRESH_SECRET, { expiresIn: EXPIRES_REFRESH_TIME });
    const decodedRefreshToken: any = this.jwtService.decode(refreshToken);

    const authDeviceSession = await this.authRepository.createSession({
      ip: ipAddress,
      title,
      lastActiveDate: convertJwtPayloadSecondsToIsoDate(decodedRefreshToken.iat!),
      exp: convertJwtPayloadSecondsToIsoDate(decodedRefreshToken.exp!),
      deviceId: deviceId,
      userId: id,
    });

    await this.authRepository.save(authDeviceSession);

    return { accessToken, refreshToken };
  }

  async logout(refreshTokenJWTPayload: RefreshTokenJwtPayloadDto): Promise<boolean> {
    const { id, deviceId, iat } = refreshTokenJWTPayload;
    const lastActiveDate = new Date(iat * 1000).toISOString();

    return this.authRepository.logout(id, deviceId, lastActiveDate);
  }
}
