import { Controller, Post, UseGuards, Body, Res, Req, Get } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Response, Request } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';

@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService,
        private roleService: RolesService
    ) { }

    @Public()
    @ResponseMessage("User login")
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    handleLogin(
        @Req() req,
    ) {
        return this.authService.login(req.user);
    }

    @Public()
    @ResponseMessage("Check session limit")
    @Post('/session-limit')
    handleSessionLimit(
        @Body() body: any
    ) {
        return this.authService.sessionLimit(body);
    }

    @Public()
    @ResponseMessage("Register a new user")
    @Post('/register')
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }

    @ResponseMessage("Get user infomation")
    @Get('/account')
    async handleGetAccount(@User() user: IUser) {
        //Query xuống DB để lấy permissions từ user đã được đăng kí
        const temp = await this.roleService.findOne(user.role) as any
        user.permissions = temp.permissions
        return { user }
    }

    @ResponseMessage("Logout User")
    @Post('/logout')
    handleLogout(
        @Req() request: Request,
        @User() user: IUser,
        @Res({ passthrough: true }) response: Response
    ) {
        const refreshToken = request.cookies["refresh_token"]
        return this.authService.logout(response, user, refreshToken)
    }
}
