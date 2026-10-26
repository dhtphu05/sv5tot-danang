import { StructuredMemberRecord } from "../collectiveTypes";

export const DEMO_42_MEMBERS: StructuredMemberRecord[] = [
  { id: 'mem-01', fullName: 'Nguyễn Thị Mai', studentCode: '102210001', className: '21TCLC_DT1', isParticipatingMovement: true, isSchoolSv5tRecognized: true, recognitionDecisionNumber: '115/QĐ-HSV-ĐHBK', dataOrigin: 'MANUAL' },
  { id: 'mem-02', fullName: 'Lê Hoàng Long', studentCode: '102210002', className: '21TCLC_DT1', isParticipatingMovement: true, isSchoolSv5tRecognized: true, recognitionDecisionNumber: '115/QĐ-HSV-ĐHBK', dataOrigin: 'MANUAL' },
  { id: 'mem-03', fullName: 'Trần Bảo Anh', studentCode: '102210003', className: '21TCLC_DT1', isParticipatingMovement: true, isSchoolSv5tRecognized: true, recognitionDecisionNumber: '115/QĐ-HSV-ĐHBK', dataOrigin: 'MANUAL' },
  { id: 'mem-04', fullName: 'Phạm Minh Trí', studentCode: '102210004', className: '21TCLC_DT1', isParticipatingMovement: true, isSchoolSv5tRecognized: true, recognitionDecisionNumber: '115/QĐ-HSV-ĐHBK', dataOrigin: 'MANUAL' },
  { id: 'mem-05', fullName: 'Đặng Thảo Vy', studentCode: '102210005', className: '21TCLC_DT1', isParticipatingMovement: true, isSchoolSv5tRecognized: true, recognitionDecisionNumber: '115/QĐ-HSV-ĐHBK', dataOrigin: 'MANUAL' },
  { id: 'mem-06', fullName: 'Vũ Quốc Khánh', studentCode: '102210006', className: '21TCLC_DT1', isParticipatingMovement: true, isSchoolSv5tRecognized: true, recognitionDecisionNumber: '115/QĐ-HSV-ĐHBK', dataOrigin: 'MANUAL' },
  { id: 'mem-07', fullName: 'Hoàng Kim Ngân', studentCode: '102210007', className: '21TCLC_DT1', isParticipatingMovement: true, isSchoolSv5tRecognized: true, recognitionDecisionNumber: '115/QĐ-HSV-ĐHBK', dataOrigin: 'MANUAL' },
  { id: 'mem-08', fullName: 'Bùi Đức Huy', studentCode: '102210008', className: '21TCLC_DT1', isParticipatingMovement: true, isSchoolSv5tRecognized: true, recognitionDecisionNumber: '115/QĐ-HSV-ĐHBK', dataOrigin: 'MANUAL' },
  { id: 'mem-09', fullName: 'Ngô Thanh Hà', studentCode: '102210009', className: '21TCLC_DT1', isParticipatingMovement: true, isSchoolSv5tRecognized: true, recognitionDecisionNumber: '115/QĐ-HSV-ĐHBK', dataOrigin: 'MANUAL' },
  ...Array.from({ length: 33 }, (_, idx) => {
    const num = idx + 10;
    return {
      id: `mem-${num}`,
      fullName: `Sinh viên Chi hội ${num}`,
      studentCode: `1022100${num < 100 ? num : num}`,
      className: '21TCLC_DT1',
      isParticipatingMovement: true,
      isSchoolSv5tRecognized: false,
      dataOrigin: 'IMPORTED' as const,
    };
  }),
];
