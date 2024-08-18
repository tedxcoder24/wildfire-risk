import { HttpException, HttpStatus } from '@nestjs/common';
import { parse } from 'csv-parse';

export async function parseCsv(data: string): Promise<string> {
  return new Promise((resolve, reject) => {
    parse(data, { columns: true, skip_empty_lines: true }, (err, records) => {
      if (err) {
        reject(
          new HttpException(
            'Error parsing csv',
            HttpStatus.INTERNAL_SERVER_ERROR
          )
        );
      } else {
        resolve(JSON.stringify(records));
      }
    });
  });
}
