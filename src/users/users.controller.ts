import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
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

  @Get()
  @ResponseMessage("Fetch list user with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Public()
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
