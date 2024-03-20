import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from 'src/permissions/schemas/permission.schemas';
import { Role, RoleSchema } from 'src/roles/schemas/role.schemas';
import { UsersService } from 'src/users/users.service';
import { User, UserSchema } from 'src/users/schemas/user.schemas';
import { MailService } from 'src/mail/mail.service';
import { Product, ProductSchema } from 'src/products/schemas/product.schemas';
import { Discountcode, DiscountcodeSchema } from 'src/discountcodes/schemas/discountcode.schemas';
import { DiscountcodesModule } from 'src/discountcodes/discountcodes.module';

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Permission.name, schema: PermissionSchema },
    { name: Role.name, schema: RoleSchema },
    { name: Product.name, schema: ProductSchema },
    { name: Discountcode.name, schema: DiscountcodeSchema }
  ])],
  controllers: [DatabasesController],
  providers: [DatabasesService, UsersService, MailService]
})
export class DatabasesModule { }
