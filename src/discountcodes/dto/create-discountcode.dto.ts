import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateDiscountcodeDto {

    @IsOptional()
    uesrEmail: string

    @IsNotEmpty({ message: "code không được để trống" })
    code: string

    @IsNotEmpty({ message: "maxDiscount không được để trống" })
    maxDiscount: number
}
