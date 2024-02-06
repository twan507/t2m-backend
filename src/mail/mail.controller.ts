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

  @Get('register')
  @Public()
  @ResponseMessage("Register Email")
  async registerEmail() {}

  @Get('license-expire')
  @Public()
  @ResponseMessage("License Expire Email")
  async licenseExpireEmail() {}

  @Get('forget-password')
  @Public()
  @ResponseMessage("Forget Password Email")
  async forgetPasswordEmail() {}
  
  @Get('change-password')
  @Public()
  @ResponseMessage("Change Password Email")
  async changePasswordEmail() {}

}

