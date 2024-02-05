import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly mailerService: MailerService,
  ) { }

  @Get()
  @Public()
  // @Cron(CronExpression.EVERY_5_SECONDS)
  @ResponseMessage("Test email")

  async handleTestEmail() {
    await this.mailerService.sendMail({
      to: "tuan98.ab@gmail.com",
      from: '"T2M Invest" <mail.t2minvest@gmail.com>', // override default from
      subject: 'Đăng kí thành công tài khoản T2M Invest!',
      template: "registerUser", //Tên của file .hbs trong thư mục templates

      //truyền các biến này sang file handlebar
      context: {

      },
    });
  }
}

