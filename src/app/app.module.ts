import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { DataSource, DataSourceOptions } from 'typeorm';

import appConfig from 'src/config/app.config';
import databaseConfig from 'src/config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmConfigService } from 'src/database/typeorm-config.service';
import { AddressModule } from './address/address.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env']
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      }
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({ isGlobal: true }),
    AddressModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
