import { IsBoolean, IsDate, IsEmail, IsNotEmpty, IsOptional } from "class-validator"

export class CreateLicenseDto {

    // @IsNotEmpty({ message: "startDate không được để trống" })
    // @IsDate({ message: "startDate phải có kiểu dữ liệu date" })
    // startDate: Date

    // @IsNotEmpty({ message: "endDate không được để trống" })
    // @IsDate({ message: "endDate phải có kiểu dữ liệu date" })
    // endDate: Date

    // @IsNotEmpty({ message: "monthsDuration không được để trống" })
    // daysLeft: number

    @IsNotEmpty({ message: "userEmail không được để trống" })
    @IsEmail({}, { message: "userEmail không đúng định dạng" })
    userEmail: string

    // @IsNotEmpty({ message: "isActive không được để trống" })
    // @IsBoolean({ message: "isActive phải có giá trị boolean" })
    // isActive: boolean

    @IsOptional({ message: "product không được để trống" })
    product: string

}
