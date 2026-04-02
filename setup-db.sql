-- Create web_users table
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
);

-- Add columns to policies table
ALTER TABLE "policies" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "policies" ADD COLUMN IF NOT EXISTS "products" jsonb DEFAULT '[]'::jsonb NOT NULL;

-- Add foreign key constraint if not exists
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.table_constraints
		WHERE constraint_name = 'policies_user_id_web_users_id_fk'
	) THEN
		ALTER TABLE "policies" ADD CONSTRAINT "policies_user_id_web_users_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "public"."web_users"("id")
		ON DELETE no action ON UPDATE no action;
	END IF;
END $$;
