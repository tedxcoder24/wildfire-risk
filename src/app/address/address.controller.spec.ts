import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { paginationDto } from './dto/pagination.dto';
import { buildSuccessResponse } from 'src/shared/utils/functions/general-responses';

describe('AddressController', () => {
  let controller: AddressController;
  let service: AddressService;
  let responseMock: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [
        {
          provide: AddressService,
          useValue: {
            create: jest.fn(),
            getAll: jest.fn(),
            getById: jest.fn()
          }
        }
      ]
    }).compile();

    controller = module.get<AddressController>(AddressController);
    service = module.get<AddressService>(AddressService);

    responseMock = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    } as any as Response;
  });

  describe('createAddress', () => {
    it('should call AddressService.create and return the created address', async () => {
      const dto: CreateAddressDto = { address: '123 Main St' };
      const result = {
        id: 1,
        latitude: 1,
        longitude: 2,
        address: 'test address',
        wildfireData: 'wildfire, test'
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      await controller.createAddress(responseMock, dto);

      const expectedResponse = buildSuccessResponse(result, 1);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseMock.send).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe('getAddresses', () => {
    it('should return a list of addresses with total count', async () => {
      const pagination: paginationDto = { page: 1, limit: 10 };
      const result = [
        {
          id: 1,
          latitude: 1,
          longitude: 2,
          address: 'test address',
          wildfireData: 'wildfire, test'
        }
      ];

      jest.spyOn(service, 'getAll').mockResolvedValue([result, 1]);

      await controller.getAddresses(responseMock, pagination);

      const expectedResponse = buildSuccessResponse(result, 1);

      expect(service.getAll).toHaveBeenCalledWith(pagination);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseMock.send).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe('getAddressById', () => {
    it('should return a single address by id', async () => {
      const result = {
        id: 1,
        address: '123 Main St',
        latitude: 1,
        longitude: 2,
        wildfireData: 'wildfire, test'
      };

      jest.spyOn(service, 'getById').mockResolvedValue(result);

      await controller.getAddressById(responseMock, 1);

      const expectedResponse = buildSuccessResponse(result, 1);

      expect(service.getById).toHaveBeenCalledWith(1);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseMock.send).toHaveBeenCalledWith(expectedResponse);
    });
  });
});
