import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscountcodeDto } from './create-discountcode.dto';

export class UpdateDiscountcodeDto extends PartialType(CreateDiscountcodeDto) {}
