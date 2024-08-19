import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { default as axios, AxiosResponse } from 'axios';
import { Cache } from 'cache-manager';

import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { getDate } from 'src/shared/utils/functions/get-date';
import { handleDBError } from 'src/shared/utils/functions/general-responses';
import { parseCsv } from 'src/shared/utils/functions/parse-csv';
import { GeocodeResponse } from 'src/shared/interfaces/api-responses.interface';
import { LatLongPoint } from 'src/shared/interfaces/lat-long.interface';
import { paginationDto } from './dto/pagination.dto';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const { address } = createAddressDto;

    const googleMapsApiKey = this.configService.get<string>(
      'GOOGLE_MAPS_API_KEY'
    );
    const nasaApiKey = this.configService.get<string>('NASA_API_KEY');
    const nasaRadius = this.configService.get<number>('NASA_RADIUS');
    const nasaDateRange = this.configService.get<number>('NASA_DATE_RANGE');

    const cacheKey = `geocode_${address}`;
    let location: LatLongPoint = await this.cacheManager.get(cacheKey);

    if (!location) {
      try {
        const geoUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
        const geoResponse: AxiosResponse<GeocodeResponse> = await axios.get(
          geoUrl,
          {
            params: {
              address,
              key: googleMapsApiKey
            },
            timeout: 5000
          }
        );

        if (
          geoResponse.data.status !== 'OK' ||
          !geoResponse.data.results.length
        ) {
          throw new HttpException(
            'Failed to geocode address',
            HttpStatus.BAD_REQUEST
          );
        }

        location = geoResponse.data.results[0].geometry.location;
        await this.cacheManager.set(cacheKey, location, 3600);
      } catch (error) {
        this.logger.error(
          `Error fetching geocoding data: ${error.message}`,
          error.stack
        );
        throw new HttpException(
          'Geocoding service unavailable',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
    }

    let wildfireData: string;
    try {
      const area = `${location.lng - nasaRadius},${location.lat - nasaRadius},${location.lng + nasaRadius},${location.lat + nasaRadius}`;
      const wildfireUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${nasaApiKey}/VIIRS_SNPP_NRT/${area}/${nasaDateRange}/${getDate()}`;
      const wildfireResponse: AxiosResponse<string> = await axios.get(
        wildfireUrl,
        { timeout: 5000 }
      );
      wildfireData = await parseCsv(wildfireResponse.data);
    } catch (error) {
      this.logger.error(
        `Error fetching wildfire data: ${error.message}`,
        error.stack
      );
      throw new HttpException(
        'Wildfire service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    try {
      const addressEntity = new Address();
      addressEntity.address = address;
      addressEntity.latitude = location.lat;
      addressEntity.longitude = location.lng;
      addressEntity.wildfireData = wildfireData;

      await this.addressRepository.save(addressEntity);
      return addressEntity;
    } catch (error) {
      handleDBError(error);
    }
  }

  async getAll(paginationDto: paginationDto): Promise<[Address[], number]> {
    const { page, limit } = paginationDto;

    const [addresses, total] = await this.addressRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit
    });

    return [addresses, total];
  }

  async getById(id: number): Promise<Address> {
    const address = await this.addressRepository.findOneBy({ id });

    if (!address) {
      throw new HttpException('Address not exist', HttpStatus.NOT_FOUND);
    }

    return address;
  }

  async updateWildfireDataForAllAddresses(): Promise<void> {
    const addresses = await this.addressRepository.find();
    const nasaApiKey = this.configService.get<string>('NASA_API_KEY');
    const nasaRadius = this.configService.get<number>('NASA_RADIUS');
    const nasaDateRange = this.configService.get<number>('NASA_DATE_RANGE');

    for (const address of addresses) {
      try {
        const area = `${address.longitude - nasaRadius},${address.latitude - nasaRadius},${address.longitude + nasaRadius},${address.latitude + nasaRadius}`;
        const wildfireUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${nasaApiKey}/VIIRS_SNPP_NRT/${area}/${nasaDateRange}/${getDate()}`;
        const wildfireResponse: AxiosResponse<string> = await axios.get(
          wildfireUrl,
          { timeout: 5000 }
        );
        const wildfireData = await parseCsv(wildfireResponse.data);

        address.wildfireData = wildfireData;
        await this.addressRepository.save(address);
      } catch (error) {
        this.logger.error(
          `Error updating wildfire data for address ${address.id}: ${error.message}`,
          error.stack
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.debug('Running scheduled task to update wildfire data');
    await this.updateWildfireDataForAllAddresses();
  }
}
