-- ============================================================================
-- 5TOT ĐÀ NẴNG — SCHOOL FORWARDING BATCH MIGRATION (SRW-1)
-- Migration Name: 20261021000000_school_forwarding_batch
-- Scope: SchoolForwardingBatch model, ForwardingBatchStatus enum, IndividualApplication relation
-- Safety Guarantee: Non-destructive, append-only, idempotent DDL
-- ============================================================================

-- 1. Create ForwardingBatchStatus Enum
DO $$ BEGIN
    CREATE TYPE "ForwardingBatchStatus" AS ENUM ('DRAFT', 'FORWARDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create SchoolForwardingBatch Table
CREATE TABLE IF NOT EXISTS "SchoolForwardingBatch" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "schoolReviewUnitId" TEXT NOT NULL,
    "status" "ForwardingBatchStatus" NOT NULL DEFAULT 'DRAFT',
    "decisionNumber" TEXT,
    "decisionTitle" TEXT,
    "decisionDate" TIMESTAMP(3),
    "signedByName" TEXT,
    "signedByTitle" TEXT,
    "decisionFileId" TEXT,
    "decisionFileName" TEXT,
    "decisionFileSize" INTEGER,
    "decisionFileUrl" TEXT,
    "forwardingNote" TEXT,
    "submittedByUserId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "applicationCount" INTEGER NOT NULL DEFAULT 0,
    "selectedApplicationIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "idempotencyKey" TEXT,
    "payloadHash" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolForwardingBatch_pkey" PRIMARY KEY ("id")
);

-- 3. Create Constraints & Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "SchoolForwardingBatch_schoolReviewUnitId_seasonId_key" 
ON "SchoolForwardingBatch"("schoolReviewUnitId", "seasonId");

CREATE INDEX IF NOT EXISTS "SchoolForwardingBatch_schoolReviewUnitId_status_idx" 
ON "SchoolForwardingBatch"("schoolReviewUnitId", "status");

CREATE INDEX IF NOT EXISTS "SchoolForwardingBatch_seasonId_status_idx" 
ON "SchoolForwardingBatch"("seasonId", "status");

CREATE INDEX IF NOT EXISTS "SchoolForwardingBatch_idempotencyKey_idx" 
ON "SchoolForwardingBatch"("idempotencyKey");

-- Foreign Keys for SchoolForwardingBatch
DO $$ BEGIN
    ALTER TABLE "SchoolForwardingBatch" 
    ADD CONSTRAINT "SchoolForwardingBatch_seasonId_fkey" 
    FOREIGN KEY ("seasonId") REFERENCES "AwardSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "SchoolForwardingBatch" 
    ADD CONSTRAINT "SchoolForwardingBatch_schoolReviewUnitId_fkey" 
    FOREIGN KEY ("schoolReviewUnitId") REFERENCES "SchoolReviewUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Add forwardingBatchId Column and Foreign Key to IndividualApplication
ALTER TABLE "IndividualApplication" ADD COLUMN IF NOT EXISTS "forwardingBatchId" TEXT;

CREATE INDEX IF NOT EXISTS "IndividualApplication_forwardingBatchId_idx" 
ON "IndividualApplication"("forwardingBatchId");

DO $$ BEGIN
    ALTER TABLE "IndividualApplication" 
    ADD CONSTRAINT "IndividualApplication_forwardingBatchId_fkey" 
    FOREIGN KEY ("forwardingBatchId") REFERENCES "SchoolForwardingBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
