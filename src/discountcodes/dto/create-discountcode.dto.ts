import { IsNotEmpty } from "class-validator";

export class CreateDiscountcodeDto {

    @IsNotEmpty({message: "code không được để trống" })
    code: string

    @IsNotEmpty({message: "discountPercent không được để trống" })
    discountPercent: number[]
}
