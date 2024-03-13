import { Controller, Get, Post, Param, UseInterceptors, UploadedFile, Res, Query, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseMessage, SkipCheckPermission } from 'src/decorator/customize';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post('upload')
  @SkipCheckPermission()
  @ResponseMessage("Upload single file")
  @UseInterceptors(FileInterceptor('fileUpload'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      fileName: file.filename
    }
  }

  @Get('')
  @SkipCheckPermission()
  getFile(
    @Query("fileName") fileName: string,
    @Query("module") module: string,
    @Res() res: Response
  ) {
    const directoryPath = path.join(__dirname, '..', `files/images/${module}`);

    // Đọc danh sách tất cả các file trong thư mục
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        throw new BadRequestException('Directory not found');
      }

      // Tìm file có tên khớp và không quan tâm đến phần mở rộng
      const foundFile = files.find(file => path.basename(file, path.extname(file)) === fileName);

      if (foundFile) {
        const filePath = path.join(directoryPath, foundFile);
        return res.sendFile(path.resolve(filePath));
      } else {
        throw new BadRequestException('File not found');
      }
    });
  }
}
