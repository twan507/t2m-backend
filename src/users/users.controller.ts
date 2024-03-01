import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminChangePasswordDto, ChangePasswordDto, CreateUserDto, ForgetPasswordDto, SendPasswordTokenDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ResponseMessage("Create a new user")
  async create(
    @Body() createUserDto: CreateUserDto,
    @User() user: IUser
  ) {
    let newUser = await this.usersService.create(createUserDto, user)
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    }
  }

  @Post('change-password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @User() user: IUser
  ) {
    return this.usersService.changePassword(changePasswordDto, user)
  }

  @Post('forget-password')
  @Public()
  @ResponseMessage("Đổi mật khẩu thành công")
  forgetPassword(
    @Body() forgetPasswordDto: ForgetPasswordDto,
  ) {
    return this.usersService.forgetPassword(forgetPasswordDto)
  }

  @Post('send-password-token')
  @Public()
  @ResponseMessage("Gửi mã thành công")
  sendPasswordToken(@Body() sendPasswordTokenDto: SendPasswordTokenDto) {
    return this.usersService.sendPasswordToken(sendPasswordTokenDto)
  }

  @Post('admin-change-password')
  adminChangePassword(
    @Body() adminChangePasswordDto: AdminChangePasswordDto,
    @User() user: IUser
  ) {
    return this.usersService.adminChangePassword(adminChangePasswordDto, user)
  }

  @Post('manage-ctv')
  manageCTV(
    @Body() body: {email: string, ctvCode: string},
    @User() user: IUser,
  ) {
    return this.usersService.manageCTV(user, body.email, body.ctvCode)
  }

  @Get()
  @ResponseMessage("Fetch list user with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Get('dependent')
  @ResponseMessage("Fetch list dependent user with paginate")
  findAllDependent(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
    @User() user: IUser
  ) {
    return this.usersService.findAllDependent(+currentPage, +limit, qs, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Edit a user")
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser
  ) {
    return await this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a user")
  remove(
    @Param('id') id: string,
    @User() user: IUser
  ) {
    return this.usersService.remove(id, user);
  }
}
