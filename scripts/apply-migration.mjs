#!/usr/bin/env node
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require', debug: process.env.DEBUG ? console.log : undefined });

async function applyMigration() {
  try {
    console.log('🔄 Applying database migration...\n');

    // Create web_users table
    console.log('  Creating web_users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "web_users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" text NOT NULL,
        "name" text NOT NULL,
        "password_hash" text NOT NULL,
        "phone" text,
        "company" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "web_users_email_unique" UNIQUE("email")
      )
    `;
    console.log('  ✓ web_users table ready');

    // Add columns to policies table
    console.log('  Adding columns to policies table...');

    // Check if user_id column exists
    const userIdColumn = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='policies' AND column_name='user_id'
    `;

    if (userIdColumn.length === 0) {
      await sql`ALTER TABLE "policies" ADD COLUMN "user_id" uuid`;
      console.log('  ✓ Added user_id column');
    } else {
      console.log('  ℹ user_id column already exists');
    }

    // Check if products column exists
    const productsColumn = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='policies' AND column_name='products'
    `;

    if (productsColumn.length === 0) {
      await sql`ALTER TABLE "policies" ADD COLUMN "products" jsonb DEFAULT '[]'::jsonb NOT NULL`;
      console.log('  ✓ Added products column');
    } else {
      console.log('  ℹ products column already exists');
    }

    // Add foreign key constraint
    console.log('  Adding foreign key constraint...');
    const constraint = await sql`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE constraint_name = 'policies_user_id_web_users_id_fk'
    `;

    if (constraint.length === 0) {
      await sql`
        ALTER TABLE "policies" ADD CONSTRAINT "policies_user_id_web_users_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "public"."web_users"("id")
        ON DELETE no action ON UPDATE no action
      `;
      console.log('  ✓ Added foreign key constraint');
    } else {
      console.log('  ℹ Foreign key constraint already exists');
    }

    console.log('\n✅ Database migration completed successfully!\n');
    console.log('You can now:');
    console.log('  1. Create a test user: INSERT INTO web_users (email, name, password_hash) VALUES (\'test@example.com\', \'Test User\', \'<hashed-password>\');');
    console.log('  2. Start the app and test the auth flow');

    await sql.end();
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
    if (e.message.includes('already exists')) {
      console.log('\n✅ Tables/columns already exist. No action needed.');
      await sql.end();
      process.exit(0);
    }
    process.exit(1);
  }
}

applyMigration();
