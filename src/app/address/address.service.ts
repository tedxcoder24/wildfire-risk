import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const { address } = createAddressDto;
    const addressEntity = new Address();

    addressEntity.address = address;
    addressEntity.latitude = 0;
    addressEntity.longitude = 0;
    addressEntity.wildfireData = '';

    await this.addressRepository.save(addressEntity);

    return addressEntity;
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
