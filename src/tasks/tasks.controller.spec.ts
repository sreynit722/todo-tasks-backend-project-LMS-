import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { AuthGuard } from '../auth/auth.gard.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { NotFoundException } from '@nestjs/common';

describe('TasksController', () => {
  it('should be defined', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: {} }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    expect(moduleRef.get(TasksController)).toBeDefined();
  });
});
