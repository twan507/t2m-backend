import { IsEmail, IsMongoId, IsNotEmpty} from "class-validator"
import { Types } from "mongoose"

export class CreateUserDto {

    @IsEmail({}, { message: "Email không đúng định dạng" })
    @IsNotEmpty({ message: "Email không được để trống" })
    email: string

    @IsNotEmpty({ message: "Pasword không được để trống" })
    password: string

    @IsNotEmpty({ message: "Name không được để trống" })
    name: string

    @IsNotEmpty({ message: "Số điện thoại không được để trống" })
    phoneNumber: string

    @IsNotEmpty({ message: "Role không được để trống" })
    @IsMongoId({ message: "Role phải có định dạng là MongoId" })
    role: Types.ObjectId

    affiliateCode: string
    sponsorCode: string

}