// file.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);

@Injectable()
export class FilesService {
  async findFile(module: string, fileName: string): Promise<string> {
    const directoryPath = path.join(__dirname, '..', `files/images/${module}`);

    try {
      const files = await readdir(directoryPath);
      const foundFile = files.find(file => path.basename(file, path.extname(file)) === fileName);

      if (!foundFile) {
        throw new NotFoundException('File not found');
      }

      return path.join(directoryPath, foundFile);
    } catch (err) {
      throw new NotFoundException('Directory not found');
    }
  }
}
