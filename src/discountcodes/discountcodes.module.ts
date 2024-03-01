import { Global, Module } from '@nestjs/common';
import { DiscountcodesService } from './discountcodes.service';
import { DiscountcodesController } from './discountcodes.controller';
import { Discountcode, DiscountcodeSchema } from './schemas/discountcode.schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from 'src/roles/schemas/role.schemas';

@Global()
@Module({
  imports: [MongooseModule.forFeature([
    { name: Discountcode.name, schema: DiscountcodeSchema },
    { name: Role.name, schema: RoleSchema },
  ])],
  controllers: [DiscountcodesController],
  providers: [DiscountcodesService],
  exports: [DiscountcodesService]
})
export class DiscountcodesModule {}
