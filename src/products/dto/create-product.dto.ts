import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsOptional} from "class-validator"
import { Types } from "mongoose"

export class CreateProductDto {

    @IsNotEmpty({ message: "name không được để trống" })
    name: string

    @IsNotEmpty({ message: "monthsDuration không được để trống" })
    monthsDuration: number

    @IsNotEmpty({ message: "accessLevel không được để trống" })
    accessLevel: number

    @IsNotEmpty({ message: "Giá tiền không được để trống" })
    price: number

    @IsOptional()
    @IsArray({ message: "permissions phải có định dạng là array" })
    @IsMongoId({ each: true, message: 'each permission phải là MongoId Object' })
    permissions: Types.ObjectId[]

}
