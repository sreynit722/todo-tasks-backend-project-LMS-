import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TaskCreatedEvent } from './task-created.event.js';
import { TaskUpdatedEvent } from './task-updated.event.js';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TaskNotificationsListener {
  private readonly logger = new Logger(TaskNotificationsListener.name);

  constructor(@InjectQueue('tasks') private readonly tasksQueue: Queue) {}

  @OnEvent('task.created')
  async handleTaskCreated(event: TaskCreatedEvent) {
    this.logger.log(`New task created: #${event.taskId} "${event.title}"`);

    // ADD Reminder job to the queue with a delay of 5 seconds
    await this.tasksQueue.add(
      'send-reminder',
      { taskId: event.taskId, title: event.title },
      { delay: 5000 , // 5 seconds while testing
      attempts: 3, // retry up to 3 times if the job fails
      backoff: { type:'fixed', delay: 2000 } // wait 2 seconds before retrying
      }
    );
  }

  @OnEvent('task.updated')
  handleTaskUpdated(event: TaskUpdatedEvent) {
    this.logger.log(
      `Task ${event.id} updated: "${event.title}", done: ${event.done}`,
    );
  }
}
