import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DiscountcodesService } from './discountcodes.service';
import { CreateDiscountcodeDto } from './dto/create-discountcode.dto';
import { UpdateDiscountcodeDto } from './dto/update-discountcode.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('discountcodes')
export class DiscountcodesController {
  constructor(private readonly discountcodesService: DiscountcodesService) { }

  @Post()
  create(
    @User() user: IUser,
    @Body() createDiscountcodeDto: CreateDiscountcodeDto
  ) {
    return this.discountcodesService.create(createDiscountcodeDto, user, 'Discount');
  }

  @Get()
  @ResponseMessage("Fetch list discount codes with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.discountcodesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discountcodesService.findOne(id);
  }

  @Patch(':id')
  changeActivation(@Param('id') id: string, @User() user: IUser, @Body() body: { status: boolean }) {
    return this.discountcodesService.changeActivation(id, user, body.status);
  }


  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.discountcodesService.remove(id, user);
  }
}
