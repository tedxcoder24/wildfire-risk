import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { default as axios } from 'axios';

import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { getDate } from 'src/shared/utils/functions/get-date';
import { handleDBError } from 'src/shared/utils/functions/general-responses';
import { parseCsv } from 'src/shared/utils/functions/parse-csv';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly configService: ConfigService
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const { address } = createAddressDto;

    const googleMapsApiKey = this.configService.get<string>(
      'GOOGLE_MAPS_API_KEY'
    );
    const nasaApiKey = this.configService.get<string>('NASA_API_KEY');

    const geoUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    const geoResponse = await axios.get(geoUrl, {
      params: {
        address,
        key: googleMapsApiKey
      }
    });
    const location = geoResponse.data.results[0].geometry.location;

    const wildfireUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${nasaApiKey}/VIIRS_SNPP_NRT`;
    const wildfireResponse = await axios.get(wildfireUrl, {
      params: {
        lat: location.lat,
        lon: location.lng,
        date: getDate(),
        range: 1
      }
    });

    const wildfireData = await parseCsv(wildfireResponse.data);

    const addressEntity = new Address();
    addressEntity.address = address;
    addressEntity.latitude = location.lat;
    addressEntity.longitude = location.lng;
    addressEntity.wildfireData = wildfireData;

    try {
      await this.addressRepository.save(addressEntity);
      return addressEntity;
    } catch (error) {
      handleDBError(error);
    }
  }

  async getAll(): Promise<[Address[], number]> {
    return this.addressRepository.findAndCount();
  }

  async getById(id: number): Promise<Address> {
    const address = await this.addressRepository.findOneBy({ id });

    if (!address) {
      throw new HttpException('Address not exist', HttpStatus.NOT_FOUND);
    }

    return address;
  }
}
