import { Module } from '@nestjs/common';
import { LicensesService } from './licenses.service';
import { LicensesController } from './licenses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { License, LicenseSchema } from './schemas/license.schemas';
import { Product, ProductSchema } from 'src/products/schemas/product.schemas';
import { User, UserSchema } from 'src/users/schemas/user.schemas';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { Role, RoleSchema } from 'src/roles/schemas/role.schemas';
import { MailService } from 'src/mail/mail.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [MongooseModule.forFeature([
      { name: License.name, schema: LicenseSchema },
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ])],
  controllers: [LicensesController],
  providers: [LicensesService, ProductsService, UsersService, MailService],
  exports: [LicensesService]
})
export class LicensesModule { }
