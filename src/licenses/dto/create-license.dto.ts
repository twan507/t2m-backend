import { IsBoolean, IsEmail, IsNotEmpty, IsOptional } from "class-validator"

export class CreateLicenseDto {

    @IsNotEmpty({ message: "userEmail không được để trống" })
    @IsEmail({}, { message: "userEmail không đúng định dạng" })
    userEmail: string

    @IsNotEmpty({ message: "product không được để trống" })
    product: string

    @IsOptional()
    discountCode: string

}
