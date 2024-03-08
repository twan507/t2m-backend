import { IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString, Length, Matches, MinLength } from "class-validator"

export class CreateUserDto {

    @IsEmail({}, { message: "Email không đúng định dạng" })
    @IsNotEmpty({ message: "Email không được để trống" })
    email: string

    @IsString()
    @IsNotEmpty({ message: "Pasword không được để trống" })
    @MinLength(6, { message: 'Password quá ngắn, tối thiểu cần 6 kí tự' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password phải bao gồm một chữ cái in hoa' })
    @Matches(/(?=.*[0-9])/, { message: 'Password phải bao gồm một chữ số' })
    password: string

    @IsNotEmpty({ message: "Name không được để trống" })
    name: string

    @IsNotEmpty({ message: "Số điện thoại không được để trống" })
    @Length(10, 10, { message: "Số điện thoại không đúng định dạng" })
    phoneNumber: string

    @IsOptional()
    sponsorCode: string
}

export class RegisterUserDto {

    @IsEmail({}, { message: "Email không đúng định dạng" })
    @IsNotEmpty({ message: "Email không được để trống" })
    email: string

    @IsString()
    @IsNotEmpty({ message: "Pasword không được để trống" })
    @MinLength(6, { message: 'Password quá ngắn, tối thiểu cần 6 kí tự' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password phải bao gồm một chữ cái in hoa' })
    @Matches(/(?=.*[0-9])/, { message: 'Password phải bao gồm một chữ số' })
    password: string

    @IsString()
    @IsNotEmpty({ message: "Pasword không được để trống" })
    @MinLength(6, { message: 'Password quá ngắn, tối thiểu cần 6 kí tự' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password phải bao gồm một chữ cái in hoa' })
    @Matches(/(?=.*[0-9])/, { message: 'Password phải bao gồm một chữ số' })
    confirmPassword: string

    @IsNotEmpty({ message: "Name không được để trống" })
    name: string

    @IsNotEmpty({ message: "Số điện thoại không được để trống" })
    @Length(10, 10, { message: "Số điện thoại không đúng định dạng" })
    phoneNumber: string;

    @IsOptional()
    affiliateCode: string

    @IsOptional()
    sponsorCode: string
}

export class ChangePasswordDto {

    @IsString()
    @IsNotEmpty({ message: "Pasword không được để trống" })
    @MinLength(6, { message: 'Password quá ngắn, tối thiểu cần 6 kí tự' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password phải bao gồm một chữ cái in hoa' })
    @Matches(/(?=.*[0-9])/, { message: 'Password phải bao gồm một chữ số' })
    currentPassword: string;

    @IsString()
    @IsNotEmpty({ message: "Pasword không được để trống" })
    @MinLength(6, { message: 'Password quá ngắn, tối thiểu cần 6 kí tự' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password phải bao gồm một chữ cái in hoa' })
    @Matches(/(?=.*[0-9])/, { message: 'Password phải bao gồm một chữ số' })
    newPassword: string;

    @IsString()
    @IsNotEmpty({ message: "Pasword không được để trống" })
    @MinLength(6, { message: 'Password quá ngắn, tối thiểu cần 6 kí tự' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password phải bao gồm một chữ cái in hoa' })
    @Matches(/(?=.*[0-9])/, { message: 'Password phải bao gồm một chữ số' })
    confirmPassword: string;
}

export class AdminChangePasswordDto {

    @IsEmail({}, { message: "Email không đúng định dạng" })
    @IsNotEmpty({ message: "Email không được để trống" })
    email: string

    @IsString()
    @IsNotEmpty({ message: "Pasword không được để trống" })
    @MinLength(6, { message: 'Password quá ngắn, tối thiểu cần 6 kí tự' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password phải bao gồm một chữ cái in hoa' })
    @Matches(/(?=.*[0-9])/, { message: 'Password phải bao gồm một chữ số' })
    newPassword: string;

    @IsString()
    @IsNotEmpty({ message: "Pasword không được để trống" })
    @MinLength(6, { message: 'Password quá ngắn, tối thiểu cần 6 kí tự' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password phải bao gồm một chữ cái in hoa' })
    @Matches(/(?=.*[0-9])/, { message: 'Password phải bao gồm một chữ số' })
    confirmPassword: string;
}

export class ForgetPasswordDto {

    @IsEmail({}, { message: "Email không đúng định dạng" })
    @IsNotEmpty({ message: "Email không được để trống" })
    email: string

    @IsString()
    @IsNotEmpty({ message: "Pasword không được để trống" })
    @MinLength(6, { message: 'Password quá ngắn, tối thiểu cần 6 kí tự' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password phải bao gồm một chữ cái in hoa' })
    @Matches(/(?=.*[0-9])/, { message: 'Password phải bao gồm một chữ số' })
    newPassword: string;

    @IsString()
    @IsNotEmpty({ message: "Pasword không được để trống" })
    @MinLength(6, { message: 'Password quá ngắn, tối thiểu cần 6 kí tự' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password phải bao gồm một chữ cái in hoa' })
    @Matches(/(?=.*[0-9])/, { message: 'Password phải bao gồm một chữ số' })
    confirmPassword: string;

    @IsNotEmpty({ message: "Mã xác thực không được để trống" })
    token: string
}

export class SendPasswordTokenDto {

    @IsEmail({}, { message: "Email không đúng định dạng" })
    @IsNotEmpty({ message: "Email không được để trống" })
    email: string
}