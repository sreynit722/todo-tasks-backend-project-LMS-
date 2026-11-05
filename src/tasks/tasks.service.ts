import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskCreatedEvent } from './task-created.event.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskUpdatedEvent } from './task-updated.event.js';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  findAll() {
    return this.tasksRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) {
      this.logger.warn(`Task ${id} requested but not found`);
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  async update(id: number, changes: UpdateTaskDto) {
    const task = await this.findOne(id); // throws 404 if missing
    Object.assign(task, changes);
    const saved = await this.tasksRepository.save(task);
    this.logger.log(`Updated task ${id}: ${JSON.stringify(changes)}`);

    this.eventEmitter.emit(
      'task.updated',
      new TaskUpdatedEvent(saved.id, saved.title, saved.done),
    );

    return saved;
  }

  async remove(id: number) {
    const result = await this.tasksRepository.delete(id);
    if (!result.affected) {
      this.logger.warn(`Delete requested for task ${id} but not found`);
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    this.logger.log(`Deleted task ${id}`);
    return { message: `Task ${id} deleted` };
  }

  // create
  async create(title: string) {
    this.logger.debug(`Creating task with title: "${title}"`);
    const task = this.tasksRepository.create({ title });
    const saved = await this.tasksRepository.save(task);
    this.logger.log(`Created task ${saved.id}: "${saved.title}"`);

    this.eventEmitter.emit(
      'task.created',
      new TaskCreatedEvent(saved.id, saved.title),
    );

    return saved;
  }
}
