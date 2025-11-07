import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContactsService } from './contacts.service';
import { parse as csvParseSync } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file?.originalname) {
      return { message: 'No file uploaded or file has no name' };
    }
  
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!ext) {
      return { message: 'Invalid file name' };
    }
  
    let contacts: any[] = [];
  
    try {
      if (ext === 'csv') {
        const fileContent = fs.readFileSync(file.path, 'utf8');
        contacts = csvParseSync(fileContent, { columns: true, skip_empty_lines: true });
      } else if (ext === 'xlsx' || ext === 'xls') {
        const workbook = XLSX.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        contacts = XLSX.utils.sheet_to_json(sheet);
      } else {
        return { message: 'Unsupported file type' };
      }
  
      for (const contact of contacts) {
        await this.contactsService.create({
          firstName: contact.firstName,
          lastName: contact.lastName,
          phoneNumber: contact.phoneNumber,
          email: contact.email,
        });
      }
  
      return { message: 'Contacts uploaded successfully', total: contacts.length };
    } finally {
      await unlinkAsync(file.path);
    }
  }
  
}
