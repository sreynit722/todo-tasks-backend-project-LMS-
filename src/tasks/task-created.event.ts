export class TaskCreatedEvent {
  constructor(
    public readonly taskId: number,
    public readonly title: string,
  ) {}
}
