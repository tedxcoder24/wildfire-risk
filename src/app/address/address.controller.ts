import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res
} from '@nestjs/common';
import { AddressService } from './address.service';
import { Response } from 'express';
import { buildSuccessResponse } from 'src/shared/utils/functions/general-responses';
import { CreateAddressDto } from './dto/create-address.dto';
import { paginationDto } from './dto/pagination.dto';

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  async createAddress(
    @Res() response: Response,
    @Body() createAddressDto: CreateAddressDto
  ) {
    const address = await this.addressService.create(createAddressDto);

    response.status(HttpStatus.OK).send(buildSuccessResponse(address, 1));
  }

  @Get()
  async getAddresses(
    @Res() response: Response,
    @Query() paginationDto: paginationDto
  ): Promise<void> {
    const [addresses, total] = await this.addressService.getAll(paginationDto);

    response.status(HttpStatus.OK).send(buildSuccessResponse(addresses, total));
  }

  @Get(':id')
  async getAddressById(
    @Res() response: Response,
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    const address = await this.addressService.getById(id);

    response.status(HttpStatus.OK).send(buildSuccessResponse(address, 1));
  }
}
