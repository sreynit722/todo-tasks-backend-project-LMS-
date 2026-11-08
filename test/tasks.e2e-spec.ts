import { config } from 'dotenv';
// Load the test settings BEFORE the app module is imported
config({ path: '.env.test', override: true });

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    // Imported here so it reads the test database settings
    const { AppModule } = await import('../src/app.module.js');

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Create a user and log in to get a token for the protected test
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password });
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    token = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /tasks is public and returns an array', async () => {
    const res = await request(app.getHttpServer()).get('/tasks').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /tasks without a token returns 401', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'No token' })
      .expect(401);
  });

  it('POST /tasks with a token creates a task', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'E2E task' })
      .expect(201);

    expect(res.body).toMatchObject({ title: 'E2E task', done: false });
  });
});
