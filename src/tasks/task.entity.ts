import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'varchar', length: 255})
  title: string;

  @Column({type: 'boolean', default: false})
  done: boolean;

  // add priority column with default value of 0
  @Column({type: 'varchar', length: 255, default: 'normal'})
  priority: string;
}
