import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1713400000000 implements MigrationInterface {
  name = 'InitialSchema1713400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // usersテーブル
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
        "email"         VARCHAR UNIQUE,
        "apple_id"      VARCHAR UNIQUE,
        "password_hash" VARCHAR,
        "display_name"  VARCHAR,
        "avatar_url"    VARCHAR,
        "member_number" VARCHAR UNIQUE,
        "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // subscriptionsテーブル
    await queryRunner.query(`
      CREATE TYPE "subscription_plan_enum" AS ENUM ('standard', 'gold', 'vip')
    `);
    await queryRunner.query(`
      CREATE TYPE "subscription_status_enum" AS ENUM ('active', 'expired', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id"                    UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id"               UUID NOT NULL,
        "plan"                  "subscription_plan_enum" NOT NULL,
        "apple_transaction_id"  VARCHAR,
        "status"                "subscription_status_enum" NOT NULL DEFAULT 'active',
        "started_at"            TIMESTAMP NOT NULL DEFAULT now(),
        "expires_at"            TIMESTAMP,
        CONSTRAINT "PK_subscriptions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_subscriptions_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // benefit_usageテーブル
    await queryRunner.query(`
      CREATE TYPE "benefit_type_enum" AS ENUM ('izakaya', 'yakiniku')
    `);
    await queryRunner.query(`
      CREATE TABLE "benefit_usage" (
        "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id"      UUID NOT NULL,
        "benefit_type" "benefit_type_enum" NOT NULL,
        "used_at"      TIMESTAMP NOT NULL DEFAULT now(),
        "month"        VARCHAR(7) NOT NULL,
        CONSTRAINT "PK_benefit_usage" PRIMARY KEY ("id"),
        CONSTRAINT "FK_benefit_usage_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // productsテーブル
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
        "name"        VARCHAR NOT NULL,
        "description" TEXT,
        "price"       INTEGER NOT NULL,
        "image_url"   VARCHAR,
        "stock"       INTEGER NOT NULL DEFAULT 0,
        "created_at"  TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);

    // ordersテーブル
    await queryRunner.query(`
      CREATE TYPE "order_status_enum" AS ENUM ('pending', 'paid', 'shipped', 'delivered')
    `);
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id"                UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id"           UUID NOT NULL,
        "total_price"       INTEGER NOT NULL,
        "status"            "order_status_enum" NOT NULL DEFAULT 'pending',
        "shipping_address"  JSONB,
        "stripe_payment_id" VARCHAR,
        "created_at"        TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orders_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // order_itemsテーブル
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
        "order_id"   UUID NOT NULL,
        "product_id" UUID NOT NULL,
        "quantity"   INTEGER NOT NULL,
        "unit_price" INTEGER NOT NULL,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id")
          REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_product" FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE RESTRICT
      )
    `);

    // インデックス
    await queryRunner.query(`CREATE INDEX "IDX_subscriptions_user_id" ON "subscriptions"("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_benefit_usage_user_month" ON "benefit_usage"("user_id", "month")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_user_id" ON "orders"("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "order_status_enum"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "benefit_usage"`);
    await queryRunner.query(`DROP TYPE "benefit_type_enum"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TYPE "subscription_status_enum"`);
    await queryRunner.query(`DROP TYPE "subscription_plan_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
