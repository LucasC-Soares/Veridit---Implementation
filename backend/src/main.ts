import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  });

  const config = new DocumentBuilder()
    .setTitle('Veridit API')
    .setDescription('API de acesso e créditos do Veridit')
    .setVersion('1.0')
    .addTag('Acesso', 'Cadastro, autenticação e recuperação de senha')
    .addTag('Créditos', 'Pacotes e pedidos de créditos')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/docs',
    apiReference({
      content: document,
      theme: 'purple',
      layout: 'modern',
      showSidebar: true,
      documentDownloadType: 'none',
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Veridit API rodando em http://localhost:${port}`);
}
void bootstrap();
