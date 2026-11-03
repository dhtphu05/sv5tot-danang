import 'dotenv/config';
import { dbManager } from '../shared/database/prismaClient';

async function migrate() {
  console.log('Connecting to database via dbManager...');
  process.env.BACKEND_DATABASE_MODE = 'online';
  const prisma = await dbManager.getClient();

  console.log('Ensuring "UserFeedback" table exists...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "public"."UserFeedback" (
      "id" TEXT NOT NULL,
      "userId" TEXT,
      "senderName" TEXT,
      "senderEmail" TEXT,
      "senderPhone" TEXT,
      "institutionId" TEXT,
      "category" TEXT NOT NULL DEFAULT 'BUG',
      "content" TEXT NOT NULL,
      "pageUrl" TEXT,
      "deviceInfo" JSONB,
      "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "UserFeedback_pkey" PRIMARY KEY ("id")
    )
  `);

  console.log('Creating individual indexes...');
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "UserFeedback_status_idx" ON "public"."UserFeedback"("status")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "UserFeedback_category_idx" ON "public"."UserFeedback"("category")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "UserFeedback_createdAt_idx" ON "public"."UserFeedback"("createdAt")`);

  console.log('Adding foreign key constraint...');
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'UserFeedback_userId_fkey'
      ) THEN
        ALTER TABLE "public"."UserFeedback"
        ADD CONSTRAINT "UserFeedback_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  console.log('Testing query on UserFeedback table...');
  const count = await prisma.userFeedback.count();
  console.log('✅ UserFeedback table ready! Current record count:', count);

  await dbManager.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
