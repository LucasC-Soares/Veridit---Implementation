import {
  integer,
  jsonb,
  pgSchema,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

const accessSchema = pgSchema('access');
const creditsSchema = pgSchema('credits');
const captureSchema = pgSchema('capture');
const mediaSchema = pgSchema('media');
const notificationSchema = pgSchema('notification');
const auditSchema = pgSchema('audit');

export const userRole = accessSchema.enum('user_role', ['LAWYER', 'COMMON']);

export const users = accessSchema.table('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  cpfCiphertext: varchar('cpf_ciphertext', { length: 512 }),
  cpfBlindIndex: varchar('cpf_blind_index', { length: 128 }).unique(),
  oab: varchar('oab', { length: 30 }),
  role: userRole('role').default('COMMON').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const refreshSessions = accessSchema.table('refresh_sessions', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const passwordResetTokens = accessSchema.table('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const creditPackages = creditsSchema.table('credit_packages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 80 }).notNull().unique(),
  credits: integer('credits').notNull(),
  pricePerCreditCents: integer('price_per_credit_cents').notNull(),
  benefitsDescription: varchar('benefits_description', {
    length: 2000,
  }).notNull(),
  active: integer('active').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const creditPurchases = creditsSchema.table('credit_purchases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  packageId: integer('package_id')
    .notNull()
    .references(() => creditPackages.id),
  fullName: varchar('full_name', { length: 180 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  cpfCiphertext: varchar('cpf_ciphertext', { length: 512 }).notNull(),
  cpfBlindIndex: varchar('cpf_blind_index', { length: 128 }).notNull(),
  postalCode: varchar('postal_code', { length: 12 }).notNull(),
  address: varchar('address', { length: 240 }).notNull(),
  number: varchar('number', { length: 20 }).notNull(),
  complement: varchar('complement', { length: 120 }),
  neighborhood: varchar('neighborhood', { length: 120 }).notNull(),
  city: varchar('city', { length: 120 }).notNull(),
  state: varchar('state', { length: 2 }).notNull(),
  status: varchar('status', { length: 30 })
    .default('AWAITING_PAYMENT')
    .notNull(),
  totalCents: integer('total_cents').notNull(),
  providerPaymentId: varchar('provider_payment_id', { length: 180 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const creditLedger = creditsSchema.table('credit_ledger', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  purchaseId: integer('purchase_id').references(() => creditPurchases.id),
  amount: integer('amount').notNull(),
  entryType: varchar('entry_type', { length: 30 }).notNull(),
  idempotencyKey: varchar('idempotency_key', { length: 180 })
    .notNull()
    .unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const contentRecords = captureSchema.table('content_records', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  title: varchar('title', { length: 180 }).notNull(),
  siteUrl: varchar('site_url', { length: 2048 }).notNull(),
  status: varchar('status', { length: 30 }).default('PENDING').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  details: jsonb('details'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const evidenceArtifacts = mediaSchema.table('evidence_artifacts', {
  id: serial('id').primaryKey(),
  recordId: integer('record_id')
    .notNull()
    .references(() => contentRecords.id, { onDelete: 'cascade' }),
  objectKey: varchar('object_key', { length: 512 }).notNull(),
  artifactType: varchar('artifact_type', { length: 30 }).notNull(),
  sha256: varchar('sha256', { length: 64 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const outboxMessages = notificationSchema.table('outbox_messages', {
  id: serial('id').primaryKey(),
  topic: varchar('topic', { length: 180 }).notNull(),
  payload: jsonb('payload').notNull(),
  correlationId: varchar('correlation_id', { length: 64 }).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  attempts: integer('attempts').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const auditEvents = auditSchema.table('audit_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: varchar('action', { length: 120 }).notNull(),
  entityType: varchar('entity_type', { length: 80 }).notNull(),
  entityId: varchar('entity_id', { length: 80 }),
  correlationId: varchar('correlation_id', { length: 64 }).notNull(),
  previousHash: varchar('previous_hash', { length: 64 }),
  rowHash: varchar('row_hash', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
