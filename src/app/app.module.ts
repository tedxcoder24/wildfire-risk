import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from 'src/config/database.config';
import appConfig from 'src/config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from 'src/database/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';

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
    CacheModule.register({ isGlobal: true })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
