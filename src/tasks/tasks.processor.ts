import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('tasks')
export class TasksProcessor extends WorkerHost {
  private readonly logger = new Logger(TasksProcessor.name);

  async process(job: Job<{ taskId: number; title: string }>): Promise<void> {
    switch (job.name) {
      case 'send-reminder':
        this.logger.log(
          `Reminder: task #${job.data.taskId} "${job.data.title}" is waiting for you ` +
            `(attempt ${job.attemptsMade + 1})`,
        );
        break;
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }
}
