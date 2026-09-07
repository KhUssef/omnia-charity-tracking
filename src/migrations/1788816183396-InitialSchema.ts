import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788816183396 implements MigrationInterface {
    name = 'InitialSchema1788816183396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`location\` (\`id\` varchar(36) NOT NULL, \`latitude\` double NOT NULL, \`longitude\` double NOT NULL, \`city\` varchar(255) NULL, \`region\` varchar(255) NULL, \`description\` varchar(255) NULL, \`familyId\` varchar(36) NULL, UNIQUE INDEX \`REL_7d77a7bb73d2b79bd3c9ac27aa\` (\`familyId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`family\` (\`id\` varchar(36) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`address\` varchar(255) NOT NULL, \`numberOfMembers\` int NOT NULL DEFAULT '1', \`containsDisabledMember\` tinyint NOT NULL DEFAULT 0, \`containsElderlyMember\` tinyint NOT NULL DEFAULT 0, \`containspupilMember\` tinyint NOT NULL DEFAULT 0, \`notes\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`aid\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`type\` enum ('FOOD', 'MEDICINE', 'FINANCIAL', 'SOCIAL', 'OTHER') NOT NULL, \`description\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`aid_distribution\` (\`id\` varchar(36) NOT NULL, \`quantity\` int NOT NULL, \`unit\` varchar(255) NULL, \`notes\` text NULL, \`date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`visitId\` varchar(36) NULL, \`aidId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`visit\` (\`id\` varchar(36) NOT NULL, \`startDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`endDate\` datetime NULL, \`isActive\` tinyint NOT NULL DEFAULT 0, \`isCompleted\` tinyint NOT NULL DEFAULT 0, \`notes\` text NULL, \`familyId\` varchar(36) NULL, \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`salt\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL DEFAULT 'USER', \`phone\` varchar(255) NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`news\` (\`id\` varchar(36) NOT NULL, \`content\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`task\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`completed\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD CONSTRAINT \`FK_7d77a7bb73d2b79bd3c9ac27aab\` FOREIGN KEY (\`familyId\`) REFERENCES \`family\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`aid_distribution\` ADD CONSTRAINT \`FK_cc325c24aeead393b4cc10bff8d\` FOREIGN KEY (\`visitId\`) REFERENCES \`visit\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`aid_distribution\` ADD CONSTRAINT \`FK_47536bec09b135e23b304933c5d\` FOREIGN KEY (\`aidId\`) REFERENCES \`aid\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`visit\` ADD CONSTRAINT \`FK_1232b7528f7fa68e145d09d5dfa\` FOREIGN KEY (\`familyId\`) REFERENCES \`family\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`visit\` ADD CONSTRAINT \`FK_27531e380326b478dacdd7b86d9\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`visit\` DROP FOREIGN KEY \`FK_27531e380326b478dacdd7b86d9\``);
        await queryRunner.query(`ALTER TABLE \`visit\` DROP FOREIGN KEY \`FK_1232b7528f7fa68e145d09d5dfa\``);
        await queryRunner.query(`ALTER TABLE \`aid_distribution\` DROP FOREIGN KEY \`FK_47536bec09b135e23b304933c5d\``);
        await queryRunner.query(`ALTER TABLE \`aid_distribution\` DROP FOREIGN KEY \`FK_cc325c24aeead393b4cc10bff8d\``);
        await queryRunner.query(`ALTER TABLE \`location\` DROP FOREIGN KEY \`FK_7d77a7bb73d2b79bd3c9ac27aab\``);
        await queryRunner.query(`DROP TABLE \`task\``);
        await queryRunner.query(`DROP TABLE \`news\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`visit\``);
        await queryRunner.query(`DROP TABLE \`aid_distribution\``);
        await queryRunner.query(`DROP TABLE \`aid\``);
        await queryRunner.query(`DROP TABLE \`family\``);
        await queryRunner.query(`DROP INDEX \`REL_7d77a7bb73d2b79bd3c9ac27aa\` ON \`location\``);
        await queryRunner.query(`DROP TABLE \`location\``);
    }

}
