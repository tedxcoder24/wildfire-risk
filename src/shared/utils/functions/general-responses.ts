import { HttpException, HttpStatus } from '@nestjs/common';
import { GenericSuccessResponse } from '../interfaces/general-responses.interface';

export function buildSuccessResponse<T>(
  data: T,
  count: number
): GenericSuccessResponse<T> {
  return {
    success: true,
    total: count,
    data
  };
}

export function handleDBError(error: any): void {
  switch (error.code) {
    case '23502':
      throw new HttpException(
        `NOT NULL Violation: ${error.detail}`,
        HttpStatus.CONFLICT
      );
    case '23503':
      throw new HttpException(
        `FOREIGN KEY Violation: ${error.detail}`,
        HttpStatus.CONFLICT
      );
    case '23505':
      throw new HttpException(
        `UNIQUE Violation: ${error.detail}`,
        HttpStatus.CONFLICT
      );
    default:
      throw new HttpException(error.detail, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
