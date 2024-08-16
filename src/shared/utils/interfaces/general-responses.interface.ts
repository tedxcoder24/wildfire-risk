import { HttpStatus } from '@nestjs/common';

export interface GenericSuccessResponse<T> {
  success: boolean;
  total: number;
  data: T;
}

export interface GenericErrorResponse {
  success: boolean;
  error: ErrorData;
}

interface ErrorData {
  code: HttpStatus;
  message: string | object;
}
