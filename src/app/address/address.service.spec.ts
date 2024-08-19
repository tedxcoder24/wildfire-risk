import { Test, TestingModule } from '@nestjs/testing';
import { AddressService } from './address.service';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Address } from './entities/address.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AddressService', () => {
  let service: AddressService;
  let addressRepository: Repository<Address>;
  let cacheManager: Cache;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: getRepositoryToken(Address),
          useClass: Repository
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'GOOGLE_MAPS_API_KEY':
                  return 'test-google-maps-api-key';
                case 'NASA_API_KEY':
                  return 'test-nasa-api-key';
                case 'NASA_RADIUS':
                  return 0.1;
                case 'NASA_DATE_RANGE':
                  return 7;
                default:
                  return null;
              }
            })
          }
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<AddressService>(AddressService);
    addressRepository = module.get<Repository<Address>>(
      getRepositoryToken(Address)
    );
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw an error if geocoding fails', async () => {
      const createAddressDto: CreateAddressDto = { address: '123 Test St' };
      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(null);
      mockedAxios.get.mockRejectedValueOnce(new Error('Geocoding error'));

      await expect(service.create(createAddressDto)).rejects.toThrow(
        new HttpException(
          'Geocoding service unavailable',
          HttpStatus.SERVICE_UNAVAILABLE
        )
      );
    });

    it('should throw an error if saving to the database fails', async () => {
      const createAddressDto: CreateAddressDto = { address: '123 Test St' };
      const location = { lat: 1.0, lng: 2.0 };

      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(null);
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'OK',
          results: [{ geometry: { location } }]
        }
      });
      mockedAxios.get.mockResolvedValueOnce({
        data: 'test,wildfire,data'
      });
      jest.spyOn(cacheManager, 'set').mockResolvedValueOnce(null);
      jest
        .spyOn(addressRepository, 'save')
        .mockRejectedValueOnce(new Error('DB save error'));

      await expect(service.create(createAddressDto)).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    it('should return an array of addresses and total count', async () => {
      const paginationDto = { page: 1, limit: 10 };
      const addressArray = [{ id: 1, address: '123 Test St' }] as Address[];

      jest
        .spyOn(addressRepository, 'findAndCount')
        .mockResolvedValueOnce([addressArray, 1]);

      const result = await service.getAll(paginationDto);
      expect(result).toEqual([addressArray, 1]);
    });
  });

  describe('getById', () => {
    it('should return an address by ID', async () => {
      const address = { id: 1, address: '123 Test St' } as Address;
      jest.spyOn(addressRepository, 'findOneBy').mockResolvedValueOnce(address);

      const result = await service.getById(1);
      expect(result).toEqual(address);
    });

    it('should throw an error if address not found', async () => {
      jest.spyOn(addressRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.getById(1)).rejects.toThrow(
        new HttpException('Address not exist', HttpStatus.NOT_FOUND)
      );
    });
  });
});
