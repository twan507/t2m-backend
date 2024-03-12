import { Controller, Get, Post, Param, UseInterceptors, UploadedFile, NotFoundException, Res, Query } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post('upload')
  @Public()
  @ResponseMessage("Upload single file")
  @UseInterceptors(FileInterceptor('fileUpload'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      fileName: file.filename
    }
  }

  @Get('')
  @Public()
  getFile(
    @Query("fileName") fileName: string,
    @Query("module") module: string,
    @Res() res: Response
  ) {
    const directoryPath = path.join(__dirname, '..', `files/images/${module}`); // Thay đổi đường dẫn tới thư mục 'private' của bạn
    const filePath = path.join(directoryPath, fileName);


    if (fs.existsSync(filePath)) {
      return res.sendFile(path.resolve(filePath));
    } else {
      throw new NotFoundException('File not found');
    }
  }
}
