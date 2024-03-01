import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CreateLicenseDto } from './dto/create-License.dto';
import { UpdateLicenseDto } from './dto/update-License.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { LicensesService } from './licenses.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('licenses')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) { }

  @Post("update-licenses-days-left")
  @Public()
  @ResponseMessage("Update license date")
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  updateLincesesDaysLeft() {
    return this.licensesService.updateLincesesDaysLeft()
  }

  @Post()
  @UseInterceptors(FileInterceptor('imageConfirm'))
  create(
    @Body() createLicenseDto: CreateLicenseDto,
    @User() user: IUser,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.licensesService.create(createLicenseDto, user, file);
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

  @Patch(':id')
  changeActivation(@Param('id') id: string, @User() user: IUser, @Body() body: { status: boolean }) {
    return this.licensesService.changeActivation(id, user, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.licensesService.remove(id, user);
  }
}
