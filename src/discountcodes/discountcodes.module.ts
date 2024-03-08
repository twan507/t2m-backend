import { Global, Module } from '@nestjs/common';
import { DiscountcodesService } from './discountcodes.service';
import { DiscountcodesController } from './discountcodes.controller';
import { Discountcode, DiscountcodeSchema } from './schemas/discountcode.schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { License, LicenseSchema } from 'src/licenses/schemas/license.schemas';

@Global()
@Module({
  imports: [MongooseModule.forFeature([
    { name: Discountcode.name, schema: DiscountcodeSchema },
    { name: License.name, schema: LicenseSchema }
  ])],
  controllers: [DiscountcodesController],
  providers: [DiscountcodesService],
  exports: [DiscountcodesService]
})
export class DiscountcodesModule { }
