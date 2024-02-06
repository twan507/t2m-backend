import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from 'src/permissions/schemas/permission.schemas';
import { Role, RoleSchema } from 'src/roles/schemas/role.schemas';
import { UsersService } from 'src/users/users.service';
import { User, UserSchema } from 'src/users/schemas/user.schemas';
import { MailService } from 'src/mail/mail.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Permission.name, schema: PermissionSchema },
    { name: Role.name, schema: RoleSchema }
  ])],
  controllers: [DatabasesController],
  providers: [DatabasesService, UsersService, MailService]
})
export class DatabasesModule { }
