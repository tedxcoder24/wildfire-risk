import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { writeFileSync } from 'fs';

import { AppModule } from './app/app.module';
import { AllConfigType } from './config/config.type';
import validationOptions from './shared/utils/validation-option';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/']
    }
  );
  app.enableVersioning({
    type: VersioningType.URI
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const options = new DocumentBuilder()
    .setTitle('Address-based Wildfire API')
    .setDescription('Delos Technical assessment API docs')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`docs`, app, document);

  if (process.argv.includes('--generateSwagger')) {
    writeFileSync(
      './wildfire-risk-api-swagger-spec.json',
      JSON.stringify(document, null, 2)
    );
    process.exit();
  } else {
    await app.listen(configService.getOrThrow('app.port', { infer: true }));
  }
}

void bootstrap();
