import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Task } from './task.entity.js';
import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  let service: TasksService;

  // Fake repository
  const repo = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };
  const events = { emit: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: repo },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();
    service = moduleRef.get(TasksService);
  });

  it('findOne returns the task when it exists', async () => {
    const task = { id: 1, title: 'Buy milk', done: false };
    repo.findOneBy.mockResolvedValue(task);

    await expect(service.findOne(1)).resolves.toEqual(task);
  });

  it('findOne throws NotFoundException when the task is missing', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('create saves the task and emits task.created', async () => {
    const entity = { title: 'Buy milk' };
    const saved = { id: 7, title: 'Buy milk', done: false };
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(saved);

    const result = await service.create('Buy milk');

    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(events.emit).toHaveBeenCalledWith(
      'task.created',
      expect.objectContaining({ taskId: 7 }),
    );
    expect(result).toEqual(saved);
  });

  // test 4
  it('update throws NotFoundException when the task is missing', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.update(999, { done: true })).rejects.toThrow(
      NotFoundException,
    );
  });
  // create task test
  it('create task', async () => {
    const entity = { title: 'Buy milk' };
    const saved = { id: 7, title: 'Buy milk', done: false };
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(saved);
  });
});
