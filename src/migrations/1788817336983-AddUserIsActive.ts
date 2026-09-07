import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIsActive1788817336983 implements MigrationInterface {
    name = 'AddUserIsActive1788817336983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`isActive\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`aid_distribution\` ADD \`date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`aid_distribution\` DROP COLUMN \`date\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`isActive\``);
    }

}
