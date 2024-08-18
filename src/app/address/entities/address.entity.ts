import { IsOptional } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Address {
  @IsOptional()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column('jsonb', { nullable: true })
  wildfireData: any;
}
