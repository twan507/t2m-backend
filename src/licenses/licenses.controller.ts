import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CreateLicenseDto } from './dto/create-License.dto';
import { UpdateLicenseDto } from './dto/update-License.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { LicensesService } from './licenses.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('licenses')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) { }

  @Post("update-licenses-days-left")
  @Public()
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  updateLincesesDaysLeft(){
    console.log("check cron")
    return this.licensesService.updateLincesesDaysLeft()
  }

  @Post()
  create(@Body() createLicenseDto: CreateLicenseDto, @User() user: IUser) {
    return this.licensesService.create(createLicenseDto, user);
  }

  @Get()
  @ResponseMessage("Fetch list License with paginate")
  findAll(
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
    @Query() qs: string
  ) {
    return this.licensesService.findAll(+current, +pageSize, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.licensesService.findOne(id);
  }


  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateLicenseDto: UpdateLicenseDto, @User() user: IUser) {
  //   return this.licensesService.update(id, updateLicenseDto, user);
  // }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.licensesService.remove(id, user);
  }
}
