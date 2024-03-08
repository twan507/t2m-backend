import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { DiscountcodesService } from './discountcodes.service';
import { CreateDiscountcodeDto } from './dto/create-discountcode.dto';
import { UpdateDiscountcodeDto } from './dto/update-discountcode.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('discountcodes')
export class DiscountcodesController {
  constructor(private readonly discountcodesService: DiscountcodesService) { }

  @Post()
  create(
    @User() user: IUser,
    @Body() createDiscountcodeDto: CreateDiscountcodeDto
  ) {
    return this.discountcodesService.create(createDiscountcodeDto, user);
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

  @Get('sponsorcode')
  @Public()
  @ResponseMessage("Get list sponsor code")
  findAllSponsorCode() {
    return this.discountcodesService.findAllSponsorCode();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discountcodesService.findOne(id);
  }

  @Post('find-by-code')
  findByCode(@Body() body: { code: string }) {
    return this.discountcodesService.findByCode(body.code);
  }

  @Patch(':id')
  changeActivation(@Param('id') id: string, @User() user: IUser, @Body() body: { status: boolean }) {
    return this.discountcodesService.changeActivation(id, user, body.status);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDiscountcodeDto: UpdateDiscountcodeDto, @User() user: IUser) {
    return this.discountcodesService.update(id, updateDiscountcodeDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.discountcodesService.remove(id, user);
  }
}
