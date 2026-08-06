import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
// describe é uma função que define um grupo de testes
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  // beforeEach é uma função que executa antes de cada teste
  beforeEach(async () => {
    // Cria um módulo de teste
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Cria uma aplicação NestJS
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // it é uma função que define um teste
  it('/ (GET)', () => {
    // Faz uma requisição GET para a raiz da aplicação
    // Espera que a resposta seja 200
    // Espera que a resposta seja 'Hello World!'
    return (
      request(app.getHttpServer())
        // Faz uma requisição GET para a raiz da aplicação
        .get('/')
        // Espera que a resposta seja 200
        .expect(200)
        // Espera que a resposta seja 'Hello World!'
        .expect('Hello World!')
    );
  });

  // afterEach é uma função que executa após cada teste
  afterEach(async () => {
    // Fecha a aplicação NestJS
    await app.close();
  });
});
