CREATE SCHEMA IF NOT EXISTS "access";--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "credits";--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "capture";--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "media";--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "notification";--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "audit";--> statement-breakpoint
CREATE TYPE "access"."user_role" AS ENUM('LAWYER', 'COMMON');--> statement-breakpoint
CREATE TABLE "audit"."audit_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" varchar(120) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" varchar(80),
	"correlation_id" varchar(64) NOT NULL,
	"previous_hash" varchar(64),
	"row_hash" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capture"."content_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(180) NOT NULL,
	"site_url" varchar(2048) NOT NULL,
	"status" varchar(30) DEFAULT 'PENDING' NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credits"."credit_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"purchase_id" integer,
	"amount" integer NOT NULL,
	"entry_type" varchar(30) NOT NULL,
	"idempotency_key" varchar(180) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_ledger_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "credits"."credit_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"credits" integer NOT NULL,
	"price_per_credit_cents" integer NOT NULL,
	"benefits_description" varchar(2000) NOT NULL,
	"active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_packages_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "credits"."credit_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"package_id" integer NOT NULL,
	"full_name" varchar(180) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"cpf_ciphertext" varchar(512) NOT NULL,
	"cpf_blind_index" varchar(128) NOT NULL,
	"postal_code" varchar(12) NOT NULL,
	"address" varchar(240) NOT NULL,
	"number" varchar(20) NOT NULL,
	"complement" varchar(120),
	"neighborhood" varchar(120) NOT NULL,
	"city" varchar(120) NOT NULL,
	"state" varchar(2) NOT NULL,
	"status" varchar(30) DEFAULT 'AWAITING_PAYMENT' NOT NULL,
	"total_cents" integer NOT NULL,
	"provider_payment_id" varchar(180),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media"."evidence_artifacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"record_id" integer NOT NULL,
	"object_key" varchar(512) NOT NULL,
	"artifact_type" varchar(30) NOT NULL,
	"sha256" varchar(64) NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification"."outbox_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic" varchar(180) NOT NULL,
	"payload" jsonb NOT NULL,
	"correlation_id" varchar(64) NOT NULL,
	"published_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "access"."password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" varchar(128) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "access"."refresh_sessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" varchar(128) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "access"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"cpf_ciphertext" varchar(512),
	"cpf_blind_index" varchar(128),
	"oab" varchar(30),
	"role" "access"."user_role" DEFAULT 'COMMON' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_cpf_blind_index_unique" UNIQUE("cpf_blind_index")
);
--> statement-breakpoint
ALTER TABLE "audit"."audit_events" ADD CONSTRAINT "audit_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "access"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capture"."content_records" ADD CONSTRAINT "content_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "access"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits"."credit_ledger" ADD CONSTRAINT "credit_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "access"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits"."credit_ledger" ADD CONSTRAINT "credit_ledger_purchase_id_credit_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "credits"."credit_purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits"."credit_purchases" ADD CONSTRAINT "credit_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "access"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits"."credit_purchases" ADD CONSTRAINT "credit_purchases_package_id_credit_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "credits"."credit_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media"."evidence_artifacts" ADD CONSTRAINT "evidence_artifacts_record_id_content_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "capture"."content_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "access"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access"."refresh_sessions" ADD CONSTRAINT "refresh_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "access"."users"("id") ON DELETE cascade ON UPDATE no action;