CREATE TYPE "public"."fallback_reason" AS ENUM('unknown_topic', 'low_confidence', 'out_of_scope', 'harmful', 'ai_unavailable');--> statement-breakpoint
CREATE TABLE "ai_fallback_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" text NOT NULL,
	"fallback_reason" "fallback_reason" NOT NULL,
	"session_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
