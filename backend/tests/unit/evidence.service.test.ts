/**
 * 5TOT Đà Nẵng — Private Evidence Service Unit Tests (Backend V2)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FakeEvidenceRepository } from '../fakes/fakeEvidenceRepository';
import { EvidenceService } from '../../src/modules/evidence/evidence.service';
import type { AuthenticatedActor } from '../../src/modules/authorization/authorization.types';

describe('Backend V2: Evidence Domain Service Unit Tests', () => {
  let fakeRepo: FakeEvidenceRepository;
  let service: EvidenceService;

  const studentActor: AuthenticatedActor = {
    userId: 'user-student-1',
    email: 'student@dut.udn.vn',
    fullName: 'Nguyễn Văn A',
    activeRole: 'STUDENT',
    roles: ['STUDENT'],
    institutionId: 'inst-dut',
    schoolReviewUnitId: 'unit-udn',
    sessionId: 'sess-student-1',
  };

  const otherStudentActor: AuthenticatedActor = {
    userId: 'user-student-2',
    email: 'student2@dut.udn.vn',
    fullName: 'Lê Văn C',
    activeRole: 'STUDENT',
    roles: ['STUDENT'],
    institutionId: 'inst-dut',
    schoolReviewUnitId: 'unit-udn',
    sessionId: 'sess-student-2',
  };

  beforeEach(() => {
    fakeRepo = new FakeEvidenceRepository();
    service = new EvidenceService(fakeRepo);
  });

  it('runs 3-step upload pipeline: intent -> finalize with magic bytes -> view-url', async () => {
    // 1. Intent
    const intent = await service.requestUploadIntent(studentActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-001',
      fileName: 'bang-diem-hk1.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024 * 50,
    });

    assert.ok(intent.evidenceObjectId);
    assert.ok(intent.uploadUrl);
    assert.ok(intent.objectKey.includes('evidence/individual/app-001/'));

    // 2. Finalize with matching PDF magic bytes (25504446)
    const finalized = await service.finalizeUpload(studentActor, {
      evidenceObjectId: intent.evidenceObjectId,
      sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      actualSizeBytes: 1024 * 50,
      headerMagicBytesHex: '255044462d312e35', // %PDF-1.5
    });

    assert.equal(finalized.isFinalized, true);
    assert.equal(finalized.scanStatus, 'CLEAN');

    // 3. View URL
    const view = await service.generateViewUrl(studentActor, intent.evidenceObjectId);
    assert.ok(view.viewUrl);
    assert.equal(view.fileName, 'bang-diem-hk1.pdf');
  });

  it('rejects finalize when magic bytes do not match declared MIME type', async () => {
    const intent = await service.requestUploadIntent(studentActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-001',
      fileName: 'fake-cert.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
    });

    // Send JPEG magic bytes for a PDF declared file
    await assert.rejects(
      async () =>
        service.finalizeUpload(studentActor, {
          evidenceObjectId: intent.evidenceObjectId,
          sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          actualSizeBytes: 1024,
          headerMagicBytesHex: 'ffd8ffe000104a46', // JPEG header
        }),
      (err: any) => err.status === 400
    );
  });

  it('denies cross-student unauthorized view access', async () => {
    const intent = await service.requestUploadIntent(studentActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-001',
      fileName: 'secret.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
    });

    await service.finalizeUpload(studentActor, {
      evidenceObjectId: intent.evidenceObjectId,
      sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      actualSizeBytes: 1024,
    });

    // Other student tries to view
    await assert.rejects(
      async () => service.generateViewUrl(otherStudentActor, intent.evidenceObjectId),
      (err: any) => err.status === 403
    );
  });

  it('enforces School Review Unit scoping and denies cross-unit IDOR for School Officers', async () => {
    const fakeAppRepo = new (await import('../fakes/fakeIndividualApplicationRepository')).FakeIndividualApplicationRepository();
    // Seed application belonging to unit-udn
    fakeAppRepo.applications.set('app-udn-001', {
      id: 'app-udn-001',
      applicationCode: '25-IND-DUT-001',
      seasonId: 'season-2025-2026',
      applicantUserId: 'user-student-1',
      fullNameSnapshot: 'Nguyễn Văn A',
      studentCodeSnapshot: '102210001',
      facultyName: 'Công nghệ Thông tin',
      className: '21TCLC_DT1',
      academicYear: '2025-2026',
      institutionId: 'inst-dut',
      schoolReviewUnitId: 'unit-udn',
      declaredCriteriaCount: 5,
      totalEvidenceCount: 5,
      currentReviewStage: 'SCHOOL_PRELIMINARY',
      schoolPreliminaryStatus: 'PENDING_SCHOOL_REVIEW',
      cityWorkflowStatus: 'CITY_UNASSIGNED',
      openSupplementCount: 0,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const scopedEvidenceService = new EvidenceService(fakeRepo, fakeAppRepo);

    const intent = await scopedEvidenceService.requestUploadIntent(studentActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-udn-001',
      fileName: 'udn-evidence.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
    });

    await scopedEvidenceService.finalizeUpload(studentActor, {
      evidenceObjectId: intent.evidenceObjectId,
      sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      actualSizeBytes: 1024,
    });

    const officerUDN: AuthenticatedActor = {
      userId: 'user-officer-udn',
      email: 'officer@udn.vn',
      fullName: 'Cán bộ ĐHĐN',
      activeRole: 'SCHOOL_OFFICER',
      roles: ['SCHOOL_OFFICER'],
      institutionId: 'inst-dut',
      schoolReviewUnitId: 'unit-udn',
      sessionId: 'sess-udn',
    };

    const officerDTU: AuthenticatedActor = {
      userId: 'user-officer-dtu',
      email: 'officer@dtu.edu.vn',
      fullName: 'Cán bộ Duy Tân',
      activeRole: 'SCHOOL_OFFICER',
      roles: ['SCHOOL_OFFICER'],
      institutionId: 'inst-dtu',
      schoolReviewUnitId: 'unit-dtu',
      sessionId: 'sess-dtu',
    };

    // 1. Authorized UDN School Officer can view
    const viewUDN = await scopedEvidenceService.generateViewUrl(officerUDN, intent.evidenceObjectId);
    assert.ok(viewUDN.viewUrl);

    // 2. Cross-Unit DTU School Officer is strictly DENIED (IDOR prevented)
    await assert.rejects(
      async () => scopedEvidenceService.generateViewUrl(officerDTU, intent.evidenceObjectId),
      (err: any) => {
        assert.equal(err.status, 403);
        assert.equal(err.code, 'CROSS_UNIT_IDOR_PREVENTED');
        return true;
      }
    );
  });

  it('denies School Officer access to Collective track evidence and unlinked evidence', async () => {
    const fakeAppRepo = new (await import('../fakes/fakeIndividualApplicationRepository')).FakeIndividualApplicationRepository();
    const scopedEvidenceService = new EvidenceService(fakeRepo, fakeAppRepo);

    // Collective evidence
    const colIntent = await scopedEvidenceService.requestUploadIntent(studentActor, {
      track: 'COLLECTIVE',
      applicationId: 'col-app-001',
      fileName: 'collective-cert.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
    });

    await scopedEvidenceService.finalizeUpload(studentActor, {
      evidenceObjectId: colIntent.evidenceObjectId,
      sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      actualSizeBytes: 1024,
    });

    const officerUDN: AuthenticatedActor = {
      userId: 'user-officer-udn',
      email: 'officer@udn.vn',
      fullName: 'Cán bộ ĐHĐN',
      activeRole: 'SCHOOL_OFFICER',
      roles: ['SCHOOL_OFFICER'],
      institutionId: 'inst-dut',
      schoolReviewUnitId: 'unit-udn',
      sessionId: 'sess-udn',
    };

    // School officer cannot view collective evidence
    await assert.rejects(
      async () => scopedEvidenceService.generateViewUrl(officerUDN, colIntent.evidenceObjectId),
      (err: any) => {
        assert.equal(err.status, 403);
        assert.equal(err.code, 'FORBIDDEN_TRACK_ACCESS');
        return true;
      }
    );
  });

  it('rejects upload-intent when file extension does not match declared MIME type (e.g. .png with application/pdf)', async () => {
    await assert.rejects(
      async () =>
        service.requestUploadIntent(studentActor, {
          track: 'INDIVIDUAL',
          applicationId: 'app-001',
          fileName: 'spoofed-image.png',
          mimeType: 'application/pdf',
          sizeBytes: 2048,
        }),
      (err: any) => {
        assert.equal(err.status, 400);
        assert.equal(err.code, 'EXTENSION_MIME_MISMATCH');
        return true;
      }
    );
  });

  it('generates Cloudflare R2 presigned PUT and GET URLs and deletes spoofed object from R2 on magic byte mismatch', async () => {
    const deletedKeys: string[] = [];
    const r2Client = new (await import('../../src/shared/storage/r2StorageClient')).CloudflareR2StorageClient({
      accountId: 'r2-acc-danang',
      accessKeyId: 'r2-key-123',
      secretAccessKey: 'r2-secret-456',
      bucketName: '5tot-danang-r2-bucket',
      presignedPutTtlSeconds: 300,
      presignedGetTtlSeconds: 120,
      fetchImpl: (async (input: string | URL | Request, init?: RequestInit) => {
        if (init?.method === 'DELETE') {
          deletedKeys.push(String(input));
          return new Response(null, { status: 204 });
        }
        // Simulate spoofed JPEG bytes uploaded to a .pdf object
        return new Response(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]), {
          status: 206,
          headers: {
            'content-range': 'bytes 0-5/4096',
            'content-length': '6',
          },
        });
      }) as typeof fetch,
    });

    const r2EvidenceService = new EvidenceService(fakeRepo, undefined, r2Client);

    const intent = await r2EvidenceService.requestUploadIntent(studentActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-r2-001',
      fileName: 'minh-chung-hoc-tap.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 4096,
    });

    assert.ok(intent.uploadUrl.startsWith('https://r2-acc-danang.r2.cloudflarestorage.com/5tot-danang-r2-bucket/'));
    assert.ok(intent.uploadUrl.includes('X-Amz-Signature='));

    // Finalize inspects R2 object, detects JPEG bytes on PDF object, deletes from R2, and throws 400
    await assert.rejects(
      async () =>
        r2EvidenceService.finalizeUpload(studentActor, {
          evidenceObjectId: intent.evidenceObjectId,
          sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          actualSizeBytes: 4096,
        }),
      (err: any) => {
        assert.equal(err.status, 400);
        assert.equal(err.code, 'MAGIC_BYTES_MISMATCH');
        return true;
      }
    );

    assert.equal(deletedKeys.length, 1);
    assert.ok(deletedKeys[0].includes(intent.objectKey));
  });

  it('batch generates presigned GET URLs in a single DB query and deduplicates application ABAC lookups', async () => {
    const fakeAppRepo = new (await import('../fakes/fakeIndividualApplicationRepository')).FakeIndividualApplicationRepository();
    fakeAppRepo.applications.set('app-udn-batch', {
      id: 'app-udn-batch',
      applicationCode: '25-IND-DUT-BATCH',
      seasonId: 'season-2025-2026',
      applicantUserId: 'user-student-1',
      fullNameSnapshot: 'Nguyễn Văn A',
      studentCodeSnapshot: '102210001',
      facultyName: 'CNTT',
      className: '21T',
      academicYear: '2025-2026',
      institutionId: 'inst-dut',
      schoolReviewUnitId: 'unit-udn',
      declaredCriteriaCount: 5,
      totalEvidenceCount: 3,
      currentReviewStage: 'SCHOOL_PRELIMINARY',
      schoolPreliminaryStatus: 'PENDING_SCHOOL_REVIEW',
      cityWorkflowStatus: 'CITY_UNASSIGNED',
      openSupplementCount: 0,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    let appLookupCount = 0;
    const origFindById = fakeAppRepo.findById.bind(fakeAppRepo);
    fakeAppRepo.findById = async (id: string) => {
      appLookupCount++;
      return origFindById(id);
    };

    const batchService = new EvidenceService(fakeRepo, fakeAppRepo);

    const i1 = await batchService.requestUploadIntent(studentActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-udn-batch',
      fileName: 'anh-1.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 2048,
    });
    const i2 = await batchService.requestUploadIntent(studentActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-udn-batch',
      fileName: 'anh-2.png',
      mimeType: 'image/png',
      sizeBytes: 4096,
    });
    const i3 = await batchService.requestUploadIntent(studentActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-udn-batch',
      fileName: 'minh-chung-3.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 8192,
    });

    await batchService.finalizeUpload(studentActor, {
      evidenceObjectId: i1.evidenceObjectId,
      sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      actualSizeBytes: 2048,
    });
    await batchService.finalizeUpload(studentActor, {
      evidenceObjectId: i2.evidenceObjectId,
      sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      actualSizeBytes: 4096,
    });
    await batchService.finalizeUpload(studentActor, {
      evidenceObjectId: i3.evidenceObjectId,
      sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      actualSizeBytes: 8192,
    });

    const officerUDN: AuthenticatedActor = {
      userId: 'user-officer-udn',
      email: 'officer@udn.vn',
      fullName: 'Cán bộ ĐHĐN',
      activeRole: 'SCHOOL_OFFICER',
      roles: ['SCHOOL_OFFICER'],
      institutionId: 'inst-dut',
      schoolReviewUnitId: 'unit-udn',
      sessionId: 'sess-udn',
    };

    const batchResult = await batchService.generateBatchViewUrls(officerUDN, [
      i1.evidenceObjectId,
      i2.evidenceObjectId,
      i3.evidenceObjectId,
    ]);

    assert.equal(batchResult.length, 3);
    assert.equal(batchResult[0].evidenceObjectId, i1.evidenceObjectId);
    assert.ok(batchResult[0].viewUrl.includes('response-cache-control='));
    // Must only look up the shared parent application ONCE (zero N+1 queries)
    assert.equal(appLookupCount, 1);
  });

  it('supports up to 100MB uploads and rejects files > 100MB at intent or finalize (with R2 cleanup and QUARANTINED state)', async () => {
    const ninetyFiveMb = 95 * 1024 * 1024;
    const hundredOneMb = 101 * 1024 * 1024;

    // 1. 95MB upload intent succeeds
    const validLargeIntent = await service.requestUploadIntent(studentActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-100mb',
      fileName: 'ho-so-minh-chung-95mb.pdf',
      mimeType: 'application/pdf',
      sizeBytes: ninetyFiveMb,
    });
    assert.ok(validLargeIntent.evidenceObjectId);
    assert.equal(validLargeIntent.expiresInSeconds, 900);

    // 2. 101MB upload intent is rejected with 413 FILE_TOO_LARGE
    await assert.rejects(
      async () =>
        service.requestUploadIntent(studentActor, {
          track: 'INDIVIDUAL',
          applicationId: 'app-100mb',
          fileName: 'qua-gioi-han-101mb.pdf',
          mimeType: 'application/pdf',
          sizeBytes: hundredOneMb,
        }),
      (err: any) => {
        assert.equal(err.status, 413);
        assert.equal(err.code, 'FILE_TOO_LARGE');
        return true;
      }
    );

    // 3. Finalize with actual size > 100MB marks QUARANTINED and throws 413
    await assert.rejects(
      async () =>
        service.finalizeUpload(studentActor, {
          evidenceObjectId: validLargeIntent.evidenceObjectId,
          sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          actualSizeBytes: hundredOneMb,
          headerMagicBytesHex: '255044462d312e37',
        }),
      (err: any) => {
        assert.equal(err.status, 413);
        assert.equal(err.code, 'FILE_TOO_LARGE');
        return true;
      }
    );

    const quarantinedObj = await fakeRepo.findById(validLargeIntent.evidenceObjectId);
    assert.equal(quarantinedObj?.scanStatus, 'QUARANTINED');
    assert.equal(quarantinedObj?.isFinalized, false);
  });

  it('handles upload state machine safely: blocks unfinalized view, allows retry-upload, and makes finalize idempotent', async () => {
    const intent = await service.requestUploadIntent(studentActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-state-001',
      fileName: 'minh-chung-state.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 5 * 1024 * 1024,
    });

    // 1. Viewing before finalize is blocked with 409 EVIDENCE_NOT_FINALIZED
    await assert.rejects(
      async () => service.generateViewUrl(studentActor, intent.evidenceObjectId),
      (err: any) => {
        assert.equal(err.status, 409);
        assert.equal(err.code, 'EVIDENCE_NOT_FINALIZED');
        return true;
      }
    );

    // 2. Retrying upload while in PENDING_UPLOAD issues a fresh Presigned PUT URL for the same object
    const retried = await service.retryUploadIntent(studentActor, intent.evidenceObjectId);
    assert.equal(retried.evidenceObjectId, intent.evidenceObjectId);
    assert.equal(retried.objectKey, intent.objectKey);
    assert.ok(retried.uploadUrl);

    // 3. First finalize succeeds
    const fin1 = await service.finalizeUpload(studentActor, {
      evidenceObjectId: intent.evidenceObjectId,
      sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      actualSizeBytes: 5 * 1024 * 1024,
      headerMagicBytesHex: '255044462d312e37',
    });
    assert.equal(fin1.isFinalized, true);
    assert.equal(fin1.scanStatus, 'CLEAN');

    // 4. Second finalize (idempotent network retry) returns the same finalized object without duplicating version 1
    const fin2 = await service.finalizeUpload(studentActor, {
      evidenceObjectId: intent.evidenceObjectId,
      sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      actualSizeBytes: 5 * 1024 * 1024,
      headerMagicBytesHex: '255044462d312e37',
    });
    assert.equal(fin2.id, fin1.id);
    assert.equal(fin2.isFinalized, true);
    assert.equal(fakeRepo.versions.get(intent.evidenceObjectId)?.length, 1);

    // 5. Retry upload on an already finalized object is rejected with 409 EVIDENCE_ALREADY_FINALIZED
    await assert.rejects(
      async () => service.retryUploadIntent(studentActor, intent.evidenceObjectId),
      (err: any) => {
        assert.equal(err.status, 409);
        assert.equal(err.code, 'EVIDENCE_ALREADY_FINALIZED');
        return true;
      }
    );
  });
});



