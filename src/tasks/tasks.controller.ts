import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Delete,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserAgent } from '../common/user-agent.decorator.js';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { AuthGuard } from '../auth/auth.gard.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}
  
  @Get()
  async findAll() {
    return await this.tasksService.findAll();
  }

  @Get('todo')
  async findTodo() {
    return (await this.tasksService.findAll()).filter(
      (task) => task.done === false,
    );
  }

  @Get('done')
  async findDone() {
    return (await this.tasksService.findAll()).filter(
      (task) => task.done === true,
    );
  }

  @Get('agent')
  whoIsAsking(@UserAgent() agent: string) {
    return { userAgent: agent };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const task = await this.tasksService.findOne(id);
    console.log(task);
    return task;
  }

  // Post for add records
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    return await this.tasksService.create(createTaskDto.title);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return await this.tasksService.update(id, updateTaskDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.tasksService.remove(id);
  }
}
