import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TaskCreatedEvent } from './task-created.event.js';
import { TaskUpdatedEvent } from './task-updated.event.js';

@Injectable()
export class TaskStatsListener {
  private readonly logger = new Logger(TaskStatsListener.name);
  private createdCount = 0;

  @OnEvent('task.created')
  handleTaskCreated(event: TaskCreatedEvent) {
    this.createdCount++;
    this.logger.log(
      `Tasks created since server start: ${this.createdCount} (latest: #${event.taskId})`,
    );
  }

  getCreatedCount(): number {
    return this.createdCount;
  }

  // update
  private doneCount = 0;

  @OnEvent('task.updated')
  handleTaskUpdated(event: TaskUpdatedEvent) {
    if (event.done) {
      this.doneCount++;
      this.logger.log(
        `Tasks marked done since server start: ${this.doneCount}`,
      );
    }
  }
}
