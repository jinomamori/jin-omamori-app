import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPartnerStoresAndEvents1715000000000 implements MigrationInterface {
  name = 'AddPartnerStoresAndEvents1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // usersテーブルにis_adminカラム追加
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "is_admin" BOOLEAN NOT NULL DEFAULT false
    `);

    // partner_storesテーブル作成
    await queryRunner.query(`
      CREATE TABLE "partner_stores" (
        "id"                   UUID NOT NULL DEFAULT gen_random_uuid(),
        "name"                 VARCHAR(255) NOT NULL,
        "genre"                VARCHAR(100) NOT NULL,
        "address"              VARCHAR(500) NOT NULL,
        "latitude"             DECIMAL(10, 8),
        "longitude"            DECIMAL(11, 8),
        "benefit_description"  TEXT NOT NULL,
        "image_url"            VARCHAR,
        "is_active"            BOOLEAN NOT NULL DEFAULT true,
        "created_at"           TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"           TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_partner_stores" PRIMARY KEY ("id")
      )
    `);

    // benefit_usageにpartner_store_idカラム追加
    await queryRunner.query(`
      ALTER TABLE "benefit_usage" ADD COLUMN "partner_store_id" UUID
    `);
    await queryRunner.query(`
      ALTER TABLE "benefit_usage" 
      ADD CONSTRAINT "FK_benefit_usage_partner_store" 
      FOREIGN KEY ("partner_store_id") REFERENCES "partner_stores"("id") ON DELETE SET NULL
    `);

    // benefit_type_enumにpartner_storeを追加
    await queryRunner.query(`
      ALTER TYPE "benefit_type_enum" ADD VALUE 'partner_store'
    `);

    // dining_eventsテーブル作成
    await queryRunner.query(`
      CREATE TYPE "plan_type_enum" AS ENUM ('gold', 'vip')
    `);
    await queryRunner.query(`
      CREATE TABLE "dining_events" (
        "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
        "title"            VARCHAR(255) NOT NULL,
        "plan_type"        "plan_type_enum" NOT NULL,
        "event_date"       TIMESTAMP NOT NULL,
        "location"         VARCHAR(255) NOT NULL,
        "address"          VARCHAR(500) NOT NULL,
        "description"      TEXT NOT NULL,
        "max_participants" INTEGER,
        "created_at"       TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dining_events" PRIMARY KEY ("id")
      )
    `);

    // event_rsvpsテーブル作成
    await queryRunner.query(`
      CREATE TYPE "rsvp_status_enum" AS ENUM ('attending', 'not_attending')
    `);
    await queryRunner.query(`
      CREATE TABLE "event_rsvps" (
        "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
        "event_id"     UUID NOT NULL,
        "user_id"      UUID NOT NULL,
        "status"       "rsvp_status_enum" NOT NULL,
        "responded_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_event_rsvps" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_event_rsvps_event_user" UNIQUE ("event_id", "user_id"),
        CONSTRAINT "FK_event_rsvps_event" FOREIGN KEY ("event_id")
          REFERENCES "dining_events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_event_rsvps_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // インデックス作成
    await queryRunner.query(`CREATE INDEX "IDX_partner_stores_is_active" ON "partner_stores"("is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_dining_events_plan_type" ON "dining_events"("plan_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_dining_events_event_date" ON "dining_events"("event_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_event_rsvps_event_id" ON "event_rsvps"("event_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_event_rsvps_user_id" ON "event_rsvps"("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_benefit_usage_partner_store" ON "benefit_usage"("partner_store_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_benefit_usage_partner_store"`);
    await queryRunner.query(`DROP INDEX "IDX_event_rsvps_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_event_rsvps_event_id"`);
    await queryRunner.query(`DROP INDEX "IDX_dining_events_event_date"`);
    await queryRunner.query(`DROP INDEX "IDX_dining_events_plan_type"`);
    await queryRunner.query(`DROP INDEX "IDX_partner_stores_is_active"`);

    await queryRunner.query(`DROP TABLE "event_rsvps"`);
    await queryRunner.query(`DROP TYPE "rsvp_status_enum"`);
    await queryRunner.query(`DROP TABLE "dining_events"`);
    await queryRunner.query(`DROP TYPE "plan_type_enum"`);

    await queryRunner.query(`
      ALTER TABLE "benefit_usage" DROP CONSTRAINT "FK_benefit_usage_partner_store"
    `);
    await queryRunner.query(`
      ALTER TABLE "benefit_usage" DROP COLUMN "partner_store_id"
    `);

    await queryRunner.query(`DROP TABLE "partner_stores"`);

    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "is_admin"
    `);
  }
}
