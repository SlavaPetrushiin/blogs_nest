import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

type TypeUrlMessage = 'recoveryCode' | 'registration';
const URL_TEXT = {
  registration: {
    title: 'Thank for your registration',
    text: 'To finish registration please follow the link below:',
    textLink: 'complete registration',
  },
  recoveryCode: {
    title: 'Password recovery',
    text: 'To finish password recovery please follow the link below:',
    textLink: 'recovery password',
  },
};

@Injectable()
export class Email {
  constructor(private readonly mailerService: MailerService) { }

  async sendEmail(email: string, url: string) {
    try {
      await this.mailerService.sendMail({
        to: email, // list of receivers
        from: 'slava91petrushin@yandex.ru', // sender address
        html: url, // HTML body content
      });
    } catch (error) {
      console.log(error);
    } finally {
      return Promise.resolve()
    }
  }

  getMessageForSendingEmail(
    url: string,
    code: string,
    typeMessage: TypeUrlMessage,
  ): string {
    return `
        <h1>${URL_TEXT[typeMessage].title}</h1>
        <p>${URL_TEXT[typeMessage].text}
          <a href='https://somesite.com/${url}=${code}'>${URL_TEXT[typeMessage].textLink}</a>
      </p>
    `;
  }
}
