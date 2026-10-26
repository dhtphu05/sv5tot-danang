/**
 * 5TOT Đà Nẵng — Institution Domain Service Unit Tests (Backend V2)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FakeInstitutionRepository } from '../fakes/fakeInstitutionRepository';
import { InstitutionService } from '../../src/modules/institutions/institution.service';

describe('Backend V2: Institution Domain Service Unit Tests', () => {
  let fakeRepo: FakeInstitutionRepository;
  let service: InstitutionService;

  beforeEach(() => {
    fakeRepo = new FakeInstitutionRepository();
    service = new InstitutionService(fakeRepo);
  });

  it('lists institutions with default pagination and ordering', async () => {
    const result = await service.getInstitutions({});
    assert.ok(result.data.length >= 10);
    assert.equal(typeof result.pagination.totalCount, 'number');
    assert.ok(result.pagination.totalCount! >= 10);
  });

  it('filters institutions by canonical code and ID', async () => {
    const dut = await service.getInstitutionByCode('DUT');
    assert.equal(dut.id, 'inst-dut');
    assert.equal(dut.code, 'DUT');
    assert.equal(dut.group, 'UD_MEMBER_UNIVERSITY');

    const byId = await service.getInstitutionById('inst-due');
    assert.equal(byId.code, 'DUE');
    assert.equal(byId.shortName, 'DUE');
  });

  it('performs accent-insensitive search and keyword matching', async () => {
    // "bach khoa" -> DUT
    const searchBk = await service.getInstitutions({ search: 'bach khoa' });
    assert.ok(searchBk.data.some((i) => i.code === 'DUT'));

    // "duy tan" -> DTU
    const searchDtu = await service.getInstitutions({ search: 'duy tan' });
    assert.ok(searchDtu.data.some((i) => i.code === 'DTU'));

    // "kinh te" -> DUE
    const searchDue = await service.getInstitutions({ search: 'kinh te' });
    assert.ok(searchDue.data.some((i) => i.code === 'DUE'));
  });

  it('filters by institution group (UD_MEMBER_UNIVERSITY vs AFFILIATED_UNIVERSITY)', async () => {
    const udMembers = await service.getInstitutions({ group: 'UD_MEMBER_UNIVERSITY' });
    assert.ok(udMembers.data.length >= 7);
    assert.ok(udMembers.data.every((i) => i.group === 'UD_MEMBER_UNIVERSITY'));

    const affiliated = await service.getInstitutions({ group: 'AFFILIATED_UNIVERSITY' });
    assert.ok(affiliated.data.length >= 4);
    assert.ok(affiliated.data.every((i) => i.group === 'AFFILIATED_UNIVERSITY'));
  });

  it('distinguishes active vs inactive institutions', async () => {
    const activeOnly = await service.getInstitutions({ isActive: true });
    assert.ok(activeOnly.data.every((i) => i.isActive === true));

    const inactive = await service.getInstitutions({ isActive: false });
    assert.ok(inactive.data.some((i) => i.code === 'LACVIET'));
  });

  it('throws 409 Conflict when attempting to create duplicate institution code', async () => {
    await assert.rejects(
      async () => {
        await service.createInstitution({
          code: 'DUT',
          officialName: 'Trường Đại học Bách khoa trùng lặp',
          shortName: 'DUT2',
          group: 'UD_MEMBER_UNIVERSITY',
        });
      },
      (err: any) => {
        assert.equal(err.status, 409);
        assert.equal(err.code, 'INSTITUTION_CODE_CONFLICT');
        return true;
      }
    );
  });

  it('resolves faculties for an institution', async () => {
    const faculties = await service.getFaculties('inst-dut');
    assert.ok(faculties.length >= 2);
    assert.ok(faculties.some((f) => f.code === 'CNTT'));
  });
});
