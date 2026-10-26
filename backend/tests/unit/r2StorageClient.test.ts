/**
 * 5TOT Đà Nẵng — Cloudflare R2 Storage Client Unit Tests (Backend V2)
 * Verifies AWS Signature V4 Presigned PUT/GET URLs, Range GET magic byte inspection, and object deletion.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CloudflareR2StorageClient,
  verifyEvidenceMagicBytes,
  validateEvidenceExtensionAndMime,
} from '../../src/shared/storage/r2StorageClient';

describe('Backend V2: Cloudflare R2 Object Storage & Magic Byte Verification Tests', () => {
  const testConfig = {
    accountId: 'test-cf-account-999',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    bucketName: '5tot-danang-private-evidence',
    presignedPutTtlSeconds: 300,
    presignedGetTtlSeconds: 120,
  };

  it('generates valid AWS Signature V4 Presigned PUT URL for Cloudflare R2', async () => {
    const client = new CloudflareR2StorageClient(testConfig);
    const result = await client.createPresignedPutUrl({
      objectKey: 'evidence/individual/app-001/1700000000-bang-diem.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 102400,
    });

    const parsed = new URL(result.uploadUrl);
    assert.equal(parsed.origin, 'https://test-cf-account-999.r2.cloudflarestorage.com');
    assert.equal(
      parsed.pathname,
      '/5tot-danang-private-evidence/evidence/individual/app-001/1700000000-bang-diem.pdf'
    );
    assert.equal(parsed.searchParams.get('X-Amz-Algorithm'), 'AWS4-HMAC-SHA256');
    assert.equal(parsed.searchParams.get('X-Amz-Expires'), '300');
    assert.ok(parsed.searchParams.get('X-Amz-Credential')?.includes('AKIAIOSFODNN7EXAMPLE'));
    assert.ok(parsed.searchParams.get('X-Amz-Credential')?.includes('/auto/s3/aws4_request'));
    assert.ok(parsed.searchParams.get('X-Amz-SignedHeaders')?.includes('content-type;host'));
    assert.match(parsed.searchParams.get('X-Amz-Signature') || '', /^[0-9a-f]{64}$/);
    assert.equal(result.headers['Content-Type'], 'application/pdf');
    assert.equal(result.expiresInSeconds, 300);
  });

  it('generates valid AWS Signature V4 Presigned GET URL with inline Content-Disposition and immutable Cache-Control', async () => {
    const client = new CloudflareR2StorageClient(testConfig);
    const result = await client.createPresignedGetUrl({
      objectKey: 'evidence/individual/app-001/1700000000-minh-chung.png',
      fileName: 'minh-chung.png',
      mimeType: 'image/png',
    });

    const parsed = new URL(result.viewUrl);
    assert.equal(parsed.origin, 'https://test-cf-account-999.r2.cloudflarestorage.com');
    assert.equal(parsed.searchParams.get('X-Amz-Algorithm'), 'AWS4-HMAC-SHA256');
    assert.equal(parsed.searchParams.get('X-Amz-Expires'), '120');
    assert.ok(
      parsed.searchParams.get('response-content-disposition')?.includes('inline; filename="minh-chung.png"')
    );
    assert.equal(parsed.searchParams.get('response-content-type'), 'image/png');
    assert.equal(
      parsed.searchParams.get('response-cache-control'),
      'private, max-age=3600, immutable'
    );
    assert.match(parsed.searchParams.get('X-Amz-Signature') || '', /^[0-9a-f]{64}$/);
  });

  it('inspects uploaded object on R2 via ultra-light 64-byte Range GET (bytes=0-63) and returns size and magic bytes hex', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n', 'utf8');
    let capturedUrl = '';
    let capturedHeaders: Record<string, string> = {};

    const mockFetch = async (input: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(input);
      capturedHeaders = (init?.headers as Record<string, string>) || {};
      return new Response(pdfBuffer, {
        status: 206,
        headers: {
          'content-range': 'bytes 0-28/51200',
          'content-length': String(pdfBuffer.length),
          'content-type': 'application/pdf',
          etag: '"abc123etag"',
        },
      });
    };

    const client = new CloudflareR2StorageClient({
      ...testConfig,
      fetchImpl: mockFetch as typeof fetch,
    });

    const inspection = await client.inspectUploadedObject(
      'evidence/individual/app-001/test.pdf'
    );

    assert.ok(capturedUrl.includes('/5tot-danang-private-evidence/evidence/individual/app-001/test.pdf'));
    assert.equal(capturedHeaders['Range'], 'bytes=0-63');
    assert.ok(capturedHeaders['Authorization']?.startsWith('AWS4-HMAC-SHA256 Credential='));
    assert.equal(inspection?.exists, true);
    assert.equal(inspection?.sizeBytes, 51200);
    assert.ok(inspection?.headerMagicBytesHex.startsWith('255044462d')); // %PDF-
  });

  it('validates magic bytes strictly for PDF, JPEG, PNG, and WEBP', () => {
    // Valid PDF (%PDF-)
    assert.equal(verifyEvidenceMagicBytes('application/pdf', '255044462d312e37'), true);
    // Valid JPEG (FF D8 FF)
    assert.equal(verifyEvidenceMagicBytes('image/jpeg', 'ffd8ffe000104a464946'), true);
    // Valid PNG (89 50 4E 47 0D 0A 1A 0A)
    assert.equal(verifyEvidenceMagicBytes('image/png', '89504e470d0a1a0a0000000d'), true);
    // Valid WEBP (RIFF....WEBP -> 52494646 + 8 hex chars + 57454250)
    assert.equal(verifyEvidenceMagicBytes('image/webp', '524946462400000057454250565038'), true);

    // Invalid: WAV file masquerading as WEBP (RIFF....WAVE)
    assert.equal(verifyEvidenceMagicBytes('image/webp', '524946462400000057415645'), false);
    // Invalid: JPEG masquerading as PDF
    assert.equal(verifyEvidenceMagicBytes('application/pdf', 'ffd8ffe000104a46'), false);
  });

  it('validates file extension matches declared image/PDF MIME type', () => {
    assert.equal(validateEvidenceExtensionAndMime('minh-chung.pdf', 'application/pdf').valid, true);
    assert.equal(validateEvidenceExtensionAndMime('anh-the.jpg', 'image/jpeg').valid, true);
    assert.equal(validateEvidenceExtensionAndMime('anh-the.jpeg', 'image/jpeg').valid, true);
    assert.equal(validateEvidenceExtensionAndMime('bang-khen.png', 'image/png').valid, true);
    assert.equal(validateEvidenceExtensionAndMime('chung-nhan.webp', 'image/webp').valid, true);

    assert.equal(validateEvidenceExtensionAndMime('malware.exe', 'application/pdf').valid, false);
    assert.equal(validateEvidenceExtensionAndMime('anh.png', 'application/pdf').valid, false);
  });

  it('normalizes Neon PostgreSQL pooled URLs and retries transient Neon cold-start errors', async () => {
    const { normalizeNeonDatabaseUrl, executeWithNeonRetry } = await import(
      '../../src/shared/database/prismaClient'
    );

    const rawNeonPoolerUrl =
      'postgresql://neondb_owner:secret@ep-shiny-rain-123-pooler.ap-southeast-1.aws.neon.tech/neondb';
    const normalized = normalizeNeonDatabaseUrl(rawNeonPoolerUrl);
    const parsed = new URL(normalized);

    assert.equal(parsed.searchParams.get('sslmode'), 'require');
    assert.equal(parsed.searchParams.get('pgbouncer'), 'true');
    assert.equal(parsed.searchParams.get('connect_timeout'), '15');
    assert.equal(parsed.searchParams.get('pool_timeout'), '15');
    assert.equal(parsed.searchParams.get('connection_limit'), '10');

    let attempts = 0;
    const result = await executeWithNeonRetry(async () => {
      attempts++;
      if (attempts < 2) {
        const err: any = new Error("Can't reach database server at ep-shiny-rain-123-pooler.neon.tech");
        err.code = 'P1001';
        throw err;
      }
      return 'neon-recovered';
    }, { maxAttempts: 3, baseDelayMs: 5 });

    assert.equal(result, 'neon-recovered');
    assert.equal(attempts, 2);
  });

  it('automatically extends Presigned PUT TTL to 900s for large files (> 20MB up to 100MB) and retries transient R2 503 errors on inspection', async () => {
    let fetchAttempts = 0;
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);

    const client = new CloudflareR2StorageClient({
      ...testConfig,
      presignedPutTtlSeconds: 300,
      fetchImpl: (async () => {
        fetchAttempts++;
        if (fetchAttempts < 2) {
          return new Response('Service Unavailable', { status: 503 });
        }
        return new Response(pngBuffer, {
          status: 206,
          headers: {
            'content-range': 'bytes 0-9/89128960',
            'content-length': String(pngBuffer.length),
          },
        });
      }) as typeof fetch,
    });

    // 85 MB file should get 900s TTL even if default is 300s
    const largePut = await client.createPresignedPutUrl({
      objectKey: 'evidence/individual/app-001/large-85mb.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 85 * 1024 * 1024,
    });
    const parsed = new URL(largePut.uploadUrl);
    assert.equal(parsed.searchParams.get('X-Amz-Expires'), '900');
    assert.equal(largePut.expiresInSeconds, 900);

    // Inspection retries once on 503 and succeeds on 2nd attempt
    const inspection = await client.inspectUploadedObject('evidence/individual/app-001/large-85mb.png');
    assert.equal(fetchAttempts, 2);
    assert.equal(inspection?.exists, true);
    assert.equal(inspection?.sizeBytes, 89128960);
  });
});


