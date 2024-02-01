import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';
import ms from 'ms';
import { RolesService } from 'src/roles/roles.service';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private rolesService: RolesService,
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

                const userRole = user.role as unknown as {_id: string, name: string}
                console.log(">>>check _id:", user)
                const temp = await this.rolesService.findOne(userRole._id)

                const objUser = {
                    ...user.toObject(),
                    permissions: temp?.permissions ?? []
                }

                return objUser
            }
        }
        return null;
    }

    async login(user: IUser, response: Response) {

        const { _id, name, email, role, tokens, permissions } = user;
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
        };

        const refresh_token = this.createRefreshToken(payload)

        //update refresh token vào trong DB
        await this.usersService.updateUserToken(refresh_token, _id)

        //set refresh token vào cookies
        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: ms(process.env.JWT_REFRESH_EXPIRE)
        })

        //logic check số lượng đăng nhập
        const MAX_DEVICES = 2;
        if (tokens.length >= MAX_DEVICES) {
            this.usersService.updateTokensArray(_id);
        }

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                name,
                email,
                role,
                permissions
            }
        };
    }

    async register(createUserDto: CreateUserDto) {
        let newUser = await this.usersService.register(createUserDto)
        return {
            _id: newUser?._id,
            createdAt: newUser?.createdAt
        }
    }

    processNewToken = async (refreshToken: string, response: Response) => {
        try {
            this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET
            })
            let user = await this.usersService.findUserByToken(refreshToken)

            if (user) {

                const { _id, name, email, role } = user;

                //festch user role vì hàm findUserByToken sẽ không trả về permission đính kèm
                const userRole = role as unknown as {_id: string, name: string}
                const temp = await this.rolesService.findOne(userRole._id) as any

                const payload = {
                    sub: "token refresh",
                    iss: "from server",
                    _id,
                    name,
                    email,
                    role
                };

                const newRefreshToken = this.createRefreshToken(payload)

                //update refresh token vào trong DB
                await this.usersService.refreshTokensArray(_id.toString(), refreshToken, newRefreshToken);

                //xoá refresh token cũ và set refresh token mới vào cookies
                response.clearCookie("refresh_token")
                response.cookie('refresh_token', newRefreshToken, {
                    httpOnly: true,
                    maxAge: ms(process.env.JWT_REFRESH_EXPIRE)
                })

                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id,
                        name,
                        email,
                        role,
                        permissions: temp?.permissions ?? []
                    }
                };
            }

        } catch (error) {
            throw new UnauthorizedException("Refresh token không hợp lệ. Vui lòng login");
        }
    }

    async logout(response: Response, user: IUser, refreshToken: string) {
        await this.usersService.logoutUser(user._id, refreshToken);
        response.clearCookie('refresh_roken')
        return "ok"
    }
}
