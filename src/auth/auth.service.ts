import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';
import { RolesService } from 'src/roles/roles.service';
import { LicensesService } from 'src/licenses/licenses.service';
import ms from 'ms';
import jwt from 'jsonwebtoken';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private rolesService: RolesService,
        private licensesService: LicensesService
    ) { }

    createRefreshToken = (payload) => {
        const referesh_token = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: ms(process.env.JWT_ACCESS_EXPIRE) / 1000
        })
        return referesh_token
    }

    //username và password là 2 tham số mà thư viện passport ném về
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password)
            if (isValid === true) {
                const userRole = user.role
                const tempRole = userRole ? await this.rolesService.findRoleByName(userRole) : { permissions: [] }

                const userLicense = user.license as any
                const tempLicense = userLicense ? await this.licensesService.findOne(userLicense) : { permissions: [] }

                const licensePermissions = tempLicense.permissions
                const rolePermissions = tempRole.permissions
                const userPermissions = [...new Set([...licensePermissions, ...rolePermissions])]

                const objUser = {
                    ...user.toObject(),
                    permissions: userPermissions,
                    licenseInfo: {
                        //@ts-ignore
                        daysLeft: tempLicense.daysLeft,
                        //@ts-ignore
                        product: tempLicense.product,
                        //@ts-ignore
                        accessLevel: tempLicense.accessLevel,
                    }
                }

                return objUser
            }
        }
        return null;
    }

    async login(user: IUser) {
        const { _id, name, email, phoneNumber, role, affiliateCode, sponsorCode, tokens, permissions, licenseInfo } = user;

        const payload = {
            sub: "token login", iss: "from server",
            _id, name, email, role, affiliateCode, sponsorCode
        };

        const refresh_token = this.createRefreshToken(payload)

        //update refresh token vào trong DB
        await this.usersService.updateUserToken(refresh_token, _id)

        //logic check số lượng đăng nhập
        const devices_number = process.env.MAX_DEVICES as unknown as number
        if (tokens.length >= devices_number) {
            this.usersService.updateTokensArray(_id);
        }

        return {
            access_token: this.jwtService.sign(payload),
            user: { _id, name, email, phoneNumber, role, affiliateCode, sponsorCode, licenseInfo, permissions }
        };
    }

    async register(registerUserDto: RegisterUserDto) {
        let newUser = await this.usersService.register(registerUserDto)
        return {
            _id: newUser?._id,
            createdAt: newUser?.createdAt
        }
    }

    async sessionLimit(body: any) {

        const { email, token } = body

        const user = await this.usersService.findOneByUsername(email)

        if (user?.tokens.includes(token)) {
            return true
        } else {
            return false
        }

    }
}
