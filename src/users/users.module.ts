import { Global, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schemas';
import { Role, RoleSchema } from 'src/roles/schemas/role.schemas';
import { MailService } from 'src/mail/mail.service';
import { MailModule } from 'src/mail/mail.module';
import { Discountcode, DiscountcodeSchema } from 'src/discountcodes/schemas/discountcode.schemas';
import { DiscountcodesService } from 'src/discountcodes/discountcodes.service';
import { License, LicenseSchema } from 'src/licenses/schemas/license.schemas';

@Module({
  imports: [MailModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Discountcode.name, schema: DiscountcodeSchema },
      { name: License.name, schema: LicenseSchema }
    ])
  ],
  controllers: [UsersController],
  providers: [UsersService, MailService, DiscountcodesService],
  exports: [UsersService]
})
export class UsersModule { }
