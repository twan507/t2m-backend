import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Response } from 'express';

const readdir = promisify(fs.readdir);

@Injectable()
export class FilesService {
  async getFile(fileName: string, module: string, res: Response): Promise<void> {
    const directoryPath = path.join(__dirname, '..', `files/images/${module}`);

    try {
      const files = await readdir(directoryPath);

      const foundFile = files.find(file => path.basename(file, path.extname(file)) === fileName);
      if (foundFile) {
        const filePath = path.join(directoryPath, foundFile);
        res.sendFile(path.resolve(filePath));
      } else {
        throw new BadRequestException('Không tìm thấy ảnh!');
      }
    } catch (err) {
      throw new BadRequestException('Không tìm thấy ảnh!');
    }
  }
}

