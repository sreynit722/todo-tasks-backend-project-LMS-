import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskPriority1793267241392 implements MigrationInterface {
    name = 'AddTaskPriority1793267241392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ADD "priority" character varying(255) NOT NULL DEFAULT 'normal'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "priority"`);
    }

}
