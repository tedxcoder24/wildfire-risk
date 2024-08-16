import { IsOptional } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Address {
  @IsOptional()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  latitude: number;

  @Column()
  longitude: number;

  @Column('json', { nullable: true })
  wildfireData: any;
}
