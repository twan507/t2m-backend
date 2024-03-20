import { Controller, Post, UseGuards, Body, Res, Req, Get, Headers } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Response, Request } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';

@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService,
        private rolesService: RolesService,
        private usersService: UsersService,
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

    @ResponseMessage("Get login status")
    @SkipCheckPermission()
    @Get('/account')
    handleGetAccount() {
        return true
    }

    @ResponseMessage("Logout User")
    @Post('/logout')
    async handleLogout(
        @User() user: IUser,
        @Headers('authorization') access_token: string
    ) {
        await this.usersService.logoutUser(user._id, access_token)
        return 'Logout User'
    }
}
