-- ============================================================================
-- 5TOT ĐÀ NẴNG — AUTHORITATIVE INITIAL BACKEND V2 MIGRATION (PostgreSQL 16+)
-- Migration Name: 20261011000000_init_backend_v2
-- Scope: 21 Enums, 35 Domain Models, Composite Indexes, Strict Foreign Keys
-- Safety Guarantee: Non-destructive, append-only, pure DDL within "public" schema
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENUMS (21 CANONICAL ENUMS)
-- ----------------------------------------------------------------------------

CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'LOCKED', 'PENDING_VERIFICATION');
CREATE TYPE "SystemRoleCode" AS ENUM ('STUDENT', 'COLLECTIVE_PREPARER', 'SCHOOL_OFFICER', 'CITY_OFFICER', 'CITY_MANAGER', 'CITY_COMMITTEE', 'ADMIN');
CREATE TYPE "InstitutionGroup" AS ENUM ('UD_MEMBER_UNIVERSITY', 'AFFILIATED_UNIVERSITY', 'COLLEGE_JUNIOR_COLLEGE', 'CITY_YOUTH_UNION_UNIT');
CREATE TYPE "CollectiveType" AS ENUM ('CHI_HOI', 'LIEN_CHI_HOI', 'CHI_DOAN', 'LIEN_CHI_DOAN', 'CLUB_TEAM_GROUP');
CREATE TYPE "ApplicationTrack" AS ENUM ('INDIVIDUAL', 'COLLECTIVE');
CREATE TYPE "IndividualReviewStage" AS ENUM ('STUDENT_DRAFT', 'SCHOOL_PRELIMINARY', 'CITY_REVIEW', 'COMMITTEE_FINALIZATION', 'COMPLETED');
CREATE TYPE "SchoolPreliminaryStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING_SCHOOL_REVIEW', 'SCHOOL_IN_REVIEW', 'SCHOOL_SUPPLEMENT_REQUESTED', 'SCHOOL_SUPPLEMENT_RESUBMITTED', 'ELIGIBLE_FOR_CITY', 'NOT_ELIGIBLE_AT_SCHOOL', 'FORWARDED_TO_CITY');
CREATE TYPE "IndividualCityWorkflowStatus" AS ENUM ('NOT_AT_CITY', 'CITY_UNASSIGNED', 'CITY_ASSIGNED', 'CITY_IN_REVIEW', 'CITY_SUPPLEMENT_REQUESTED', 'CITY_SUPPLEMENT_RESUBMITTED', 'CITY_REVIEW_COMPLETED', 'COMMITTEE_PENDING', 'FINALIZED_RECOGNIZED', 'FINALIZED_NOT_RECOGNIZED', 'PUBLISHED');
CREATE TYPE "CollectiveWorkflowStatus" AS ENUM ('DRAFT', 'CITY_UNASSIGNED', 'CITY_ASSIGNED', 'CITY_IN_REVIEW', 'CITY_SUPPLEMENT_REQUESTED', 'CITY_SUPPLEMENT_RETURNED', 'CITY_REVIEW_COMPLETED', 'COMMITTEE_PENDING', 'FINALIZED_RECOGNIZED', 'FINALIZED_NOT_RECOGNIZED', 'PUBLISHED');
CREATE TYPE "CriterionSelfStatus" AS ENUM ('INCOMPLETE', 'DECLARED', 'READY');
CREATE TYPE "ReviewJudgmentStatus" AS ENUM ('NOT_REVIEWED', 'REVIEWING', 'SUITABLE', 'NEEDS_SUPPLEMENT', 'UNSUITABLE', 'NEEDS_CONSIDERATION');
CREATE TYPE "SchoolRecognitionPrerequisiteStatus" AS ENUM ('RECOGNIZED', 'NOT_RECOGNIZED', 'CLARIFYING');
CREATE TYPE "ViolationConfirmationStatus" AS ENUM ('NO_VIOLATIONS', 'HAS_VIOLATIONS', 'NEEDS_CLARIFICATION');
CREATE TYPE "SupplementScopeType" AS ENUM ('CRITERION_OR_REQUIREMENT', 'DECLARATION_ITEM', 'EVIDENCE_ATTACHMENT', 'MEMBER_ROSTER');
CREATE TYPE "SupplementLifecycleStatus" AS ENUM ('OPEN', 'RESUBMITTED', 'RESOLVED_SATISFIED', 'RESOLVED_UNSATISFIED', 'CANCELLED');
CREATE TYPE "CommitteeOutcome" AS ENUM ('RECOGNIZED', 'NOT_RECOGNIZED');
CREATE TYPE "DecisionBatchStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SUPERSEDED');
CREATE TYPE "EvidenceScanStatus" AS ENUM ('PENDING_UPLOAD', 'PENDING_SCAN', 'CLEAN', 'QUARANTINED', 'SCAN_FAILED');
CREATE TYPE "DataOrigin" AS ENUM ('MANUAL', 'IMPORTED', 'HUMAN_CONFIRMED');
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL');
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');
CREATE TYPE "OutboxProcessStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- ----------------------------------------------------------------------------
-- 2. ORGANIZATIONAL HIERARCHY & IDENTITY (MODELS 1–7)
-- ----------------------------------------------------------------------------

CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "officialName" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "group" "InstitutionGroup" NOT NULL,
    "hasStudentAssoc" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Institution_code_key" ON "Institution"("code");
CREATE INDEX "Institution_group_isActive_idx" ON "Institution"("group", "isActive");

CREATE TABLE "SchoolReviewUnit" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "officialName" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "unitType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SchoolReviewUnit_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SchoolReviewUnit_code_key" ON "SchoolReviewUnit"("code");
CREATE INDEX "SchoolReviewUnit_institutionId_isActive_idx" ON "SchoolReviewUnit"("institutionId", "isActive");

CREATE TABLE "FacultyDepartment" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "schoolReviewUnitId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FacultyDepartment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FacultyDepartment_institutionId_code_key" ON "FacultyDepartment"("institutionId", "code");
CREATE INDEX "FacultyDepartment_schoolReviewUnitId_isActive_idx" ON "FacultyDepartment"("schoolReviewUnitId", "isActive");

CREATE TABLE "AcademicClass" (
    "id" TEXT NOT NULL,
    "facultyDepartmentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cohortYear" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "AcademicClass_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AcademicClass_facultyDepartmentId_code_key" ON "AcademicClass"("facultyDepartmentId", "code");

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "ssoSubjectId" TEXT,
    "fullName" TEXT NOT NULL,
    "studentCode" TEXT,
    "phone" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "institutionId" TEXT,
    "facultyDepartmentId" TEXT,
    "academicClassId" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_ssoSubjectId_key" ON "User"("ssoSubjectId");
CREATE UNIQUE INDEX "User_studentCode_key" ON "User"("studentCode");
CREATE INDEX "User_institutionId_status_idx" ON "User"("institutionId", "status");
CREATE INDEX "User_studentCode_idx" ON "User"("studentCode");

CREATE TABLE "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "SystemRoleCode" NOT NULL,
    "schoolReviewUnitId" TEXT,
    "assignedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserRoleAssignment_userId_role_schoolReviewUnitId_key" ON "UserRoleAssignment"("userId", "role", "schoolReviewUnitId");

CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AuthSession_refreshTokenHash_key" ON "AuthSession"("refreshTokenHash");
CREATE INDEX "AuthSession_userId_expiresAt_idx" ON "AuthSession"("userId", "expiresAt");

-- ----------------------------------------------------------------------------
-- 3. SEASONS & CRITERIA CATALOG (MODELS 8–10)
-- ----------------------------------------------------------------------------

CREATE TABLE "AwardSeason" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "schoolSubmissionDeadline" TIMESTAMP(3) NOT NULL,
    "schoolReviewDeadline" TIMESTAMP(3) NOT NULL,
    "cityReviewDeadline" TIMESTAMP(3) NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AwardSeason_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AwardSeason_code_key" ON "AwardSeason"("code");
CREATE INDEX "AwardSeason_isActive_code_idx" ON "AwardSeason"("isActive", "code");

CREATE TABLE "CriterionGroupDefinition" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "track" "ApplicationTrack" NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "ruleConfig" JSONB NOT NULL,
    CONSTRAINT "CriterionGroupDefinition_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CriterionGroupDefinition_seasonId_track_code_key" ON "CriterionGroupDefinition"("seasonId", "track", "code");
CREATE INDEX "CriterionGroupDefinition_seasonId_track_displayOrder_idx" ON "CriterionGroupDefinition"("seasonId", "track", "displayOrder");

CREATE TABLE "RequirementDefinition" (
    "id" TEXT NOT NULL,
    "criterionGroupId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "groupBranchCode" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 1,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "requiresEvidence" BOOLEAN NOT NULL DEFAULT true,
    "inputSchema" JSONB NOT NULL,
    CONSTRAINT "RequirementDefinition_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RequirementDefinition_criterionGroupId_code_key" ON "RequirementDefinition"("criterionGroupId", "code");

-- ----------------------------------------------------------------------------
-- 4. INDIVIDUAL APPLICATION DOMAIN (MODELS 11–15)
-- ----------------------------------------------------------------------------

CREATE TABLE "IndividualApplication" (
    "id" TEXT NOT NULL,
    "applicationCode" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "applicantUserId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "schoolReviewUnitId" TEXT NOT NULL,
    "facultyName" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "studentCodeSnapshot" TEXT NOT NULL,
    "fullNameSnapshot" TEXT NOT NULL,
    "gpaScale4" DECIMAL(4,2),
    "gpaScale10" DECIMAL(4,2),
    "conductScore" INTEGER,
    "declaredCriteriaCount" INTEGER NOT NULL DEFAULT 0,
    "totalEvidenceCount" INTEGER NOT NULL DEFAULT 0,
    "currentReviewStage" "IndividualReviewStage" NOT NULL DEFAULT 'STUDENT_DRAFT',
    "schoolPreliminaryStatus" "SchoolPreliminaryStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "cityWorkflowStatus" "IndividualCityWorkflowStatus" NOT NULL DEFAULT 'NOT_AT_CITY',
    "submittedToSchoolAt" TIMESTAMP(3),
    "schoolReviewedByUserId" TEXT,
    "schoolReviewedAt" TIMESTAMP(3),
    "schoolRecommendationNote" TEXT,
    "schoolForwardedAt" TIMESTAMP(3),
    "schoolForwardedByUserId" TEXT,
    "assignedCityOfficerId" TEXT,
    "previousCityOfficerId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "cityReviewStartedAt" TIMESTAMP(3),
    "cityReviewCompletedAt" TIMESTAMP(3),
    "cityOfficerOverallStatus" "ReviewJudgmentStatus" NOT NULL DEFAULT 'NOT_REVIEWED',
    "cityOfficerSummaryNote" TEXT,
    "openSupplementCount" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IndividualApplication_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "IndividualApplication_applicationCode_key" ON "IndividualApplication"("applicationCode");
CREATE UNIQUE INDEX "IndividualApplication_seasonId_applicantUserId_key" ON "IndividualApplication"("seasonId", "applicantUserId");
CREATE INDEX "IndividualApplication_school_queue_idx" ON "IndividualApplication"("seasonId", "schoolReviewUnitId", "schoolPreliminaryStatus", "submittedToSchoolAt" DESC);
CREATE INDEX "IndividualApplication_city_intake_idx" ON "IndividualApplication"("seasonId", "currentReviewStage", "cityWorkflowStatus", "schoolForwardedAt" DESC);
CREATE INDEX "IndividualApplication_officer_queue_idx" ON "IndividualApplication"("assignedCityOfficerId", "cityWorkflowStatus", "assignedAt" DESC);
CREATE INDEX "IndividualApplication_institution_filter_idx" ON "IndividualApplication"("seasonId", "institutionId", "currentReviewStage");

CREATE TABLE "IndividualCriterionSubmission" (
    "id" TEXT NOT NULL,
    "individualApplicationId" TEXT NOT NULL,
    "criterionCode" TEXT NOT NULL,
    "selfStatus" "CriterionSelfStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "declarationCount" INTEGER NOT NULL DEFAULT 0,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "applicantSummaryNote" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IndividualCriterionSubmission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "IndividualCriterionSubmission_app_crit_key" ON "IndividualCriterionSubmission"("individualApplicationId", "criterionCode");

CREATE TABLE "IndividualDeclarationItem" (
    "id" TEXT NOT NULL,
    "individualApplicationId" TEXT NOT NULL,
    "criterionSubmissionId" TEXT NOT NULL,
    "criterionCode" TEXT NOT NULL,
    "requirementCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "activityDateOrPeriod" TEXT,
    "issuingAuthority" TEXT,
    "certificateOrRefCode" TEXT,
    "numericValue" DECIMAL(8,2),
    "structuredAttributes" JSONB NOT NULL,
    "applicantNote" TEXT,
    "selfStatus" "CriterionSelfStatus" NOT NULL DEFAULT 'DECLARED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IndividualDeclarationItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "IndividualDeclarationItem_app_req_idx" ON "IndividualDeclarationItem"("individualApplicationId", "criterionCode", "requirementCode");
CREATE INDEX "IndividualDeclarationItem_sub_idx" ON "IndividualDeclarationItem"("criterionSubmissionId");

CREATE TABLE "SchoolCriterionReviewJudgment" (
    "id" TEXT NOT NULL,
    "individualApplicationId" TEXT NOT NULL,
    "criterionCode" TEXT NOT NULL,
    "judgmentStatus" "ReviewJudgmentStatus" NOT NULL DEFAULT 'NOT_REVIEWED',
    "reviewerUserId" TEXT NOT NULL,
    "reviewerNameSnapshot" TEXT NOT NULL,
    "reviewerNote" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisionNumber" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "SchoolCriterionReviewJudgment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SchoolCriterionReviewJudgment_app_crit_key" ON "SchoolCriterionReviewJudgment"("individualApplicationId", "criterionCode");
CREATE INDEX "SchoolCriterionReviewJudgment_reviewer_idx" ON "SchoolCriterionReviewJudgment"("reviewerUserId", "reviewedAt" DESC);

CREATE TABLE "CityCriterionReviewJudgment" (
    "id" TEXT NOT NULL,
    "individualApplicationId" TEXT NOT NULL,
    "criterionCode" TEXT NOT NULL,
    "judgmentStatus" "ReviewJudgmentStatus" NOT NULL DEFAULT 'NOT_REVIEWED',
    "reviewerUserId" TEXT NOT NULL,
    "reviewerNameSnapshot" TEXT NOT NULL,
    "reviewerNote" TEXT,
    "flaggedEvidenceLinkIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisionNumber" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "CityCriterionReviewJudgment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CityCriterionReviewJudgment_app_crit_key" ON "CityCriterionReviewJudgment"("individualApplicationId", "criterionCode");
CREATE INDEX "CityCriterionReviewJudgment_reviewer_idx" ON "CityCriterionReviewJudgment"("reviewerUserId", "reviewedAt" DESC);

-- ----------------------------------------------------------------------------
-- 5. COLLECTIVE APPLICATION DOMAIN (MODELS 16–22)
-- ----------------------------------------------------------------------------

CREATE TABLE "CollectiveUnit" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "officialName" TEXT NOT NULL,
    "collectiveType" "CollectiveType" NOT NULL,
    "institutionId" TEXT NOT NULL,
    "schoolReviewUnitId" TEXT NOT NULL,
    "facultyDepartmentId" TEXT,
    "facultyOrParentName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CollectiveUnit_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CollectiveUnit_code_key" ON "CollectiveUnit"("code");
CREATE INDEX "CollectiveUnit_inst_unit_idx" ON "CollectiveUnit"("institutionId", "schoolReviewUnitId", "isActive");

CREATE TABLE "CollectivePreparerAuthorization" (
    "id" TEXT NOT NULL,
    "collectiveUnitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "positionTitle" TEXT NOT NULL,
    "contactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "authorizedById" TEXT,
    "authorizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,
    CONSTRAINT "CollectivePreparerAuthorization_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CollectivePreparerAuthorization_unit_user_season_key" ON "CollectivePreparerAuthorization"("collectiveUnitId", "userId", "seasonId");
CREATE INDEX "CollectivePreparerAuthorization_user_season_idx" ON "CollectivePreparerAuthorization"("userId", "seasonId", "isActive");

CREATE TABLE "CollectiveApplication" (
    "id" TEXT NOT NULL,
    "applicationCode" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "collectiveUnitId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "schoolReviewUnitId" TEXT NOT NULL,
    "preparerUserId" TEXT NOT NULL,
    "collectiveNameSnapshot" TEXT NOT NULL,
    "collectiveTypeSnapshot" "CollectiveType" NOT NULL,
    "academicYear" TEXT NOT NULL,
    "workflowStatus" "CollectiveWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "participatingMembers" INTEGER NOT NULL DEFAULT 0,
    "recognizedMembers" INTEGER NOT NULL DEFAULT 0,
    "rosterRowCount" INTEGER NOT NULL DEFAULT 0,
    "tt01IsSchoolRecognized" BOOLEAN NOT NULL DEFAULT false,
    "tt02MeetsThreshold" BOOLEAN NOT NULL DEFAULT false,
    "tt03MeetsThreshold" BOOLEAN NOT NULL DEFAULT false,
    "tt04ViolationStatus" "ViolationConfirmationStatus" NOT NULL DEFAULT 'NEEDS_CLARIFICATION',
    "totalEvidenceCount" INTEGER NOT NULL DEFAULT 0,
    "submittedToCityAt" TIMESTAMP(3),
    "assignedCityOfficerId" TEXT,
    "previousCityOfficerId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "assignmentNote" TEXT,
    "cityReviewStartedAt" TIMESTAMP(3),
    "cityReviewCompletedAt" TIMESTAMP(3),
    "officerOverallJudgment" "ReviewJudgmentStatus" NOT NULL DEFAULT 'NOT_REVIEWED',
    "officerSummaryNote" TEXT,
    "openSupplementCount" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CollectiveApplication_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CollectiveApplication_applicationCode_key" ON "CollectiveApplication"("applicationCode");
CREATE UNIQUE INDEX "CollectiveApplication_seasonId_collectiveUnitId_key" ON "CollectiveApplication"("seasonId", "collectiveUnitId");
CREATE INDEX "CollectiveApplication_city_queue_idx" ON "CollectiveApplication"("seasonId", "workflowStatus", "submittedToCityAt" DESC);
CREATE INDEX "CollectiveApplication_officer_queue_idx" ON "CollectiveApplication"("assignedCityOfficerId", "workflowStatus", "assignedAt" DESC);
CREATE INDEX "CollectiveApplication_preparer_idx" ON "CollectiveApplication"("preparerUserId", "seasonId");
CREATE INDEX "CollectiveApplication_inst_idx" ON "CollectiveApplication"("seasonId", "institutionId", "workflowStatus");

CREATE TABLE "CollectiveRequirementRecord" (
    "id" TEXT NOT NULL,
    "collectiveApplicationId" TEXT NOT NULL,
    "requirementCode" TEXT NOT NULL,
    "selfStatus" "CriterionSelfStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "tt01RecognitionStatus" "SchoolRecognitionPrerequisiteStatus",
    "tt01RecognizedCollectiveName" TEXT,
    "tt01RecognizedAcademicYear" TEXT,
    "tt01IssuingUnitName" TEXT,
    "tt01DecisionNumber" TEXT,
    "tt01DecisionDate" TIMESTAMP(3),
    "tt02CensusDate" TIMESTAMP(3),
    "tt03RecognizedAcademicYear" TEXT,
    "tt03IssuingInstitutionName" TEXT,
    "tt03RecognitionSource" TEXT,
    "tt04ViolationStatus" "ViolationConfirmationStatus",
    "tt04NoViolationsConfirmed" BOOLEAN,
    "tt04ConfirmingUnitName" TEXT,
    "tt04ConfirmationDate" TIMESTAMP(3),
    "tt04ConfirmationDocNumber" TEXT,
    "tt04ScopeYear" TEXT,
    "applicantNotes" TEXT,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollectiveRequirementRecord_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CollectiveRequirementRecord_app_req_key" ON "CollectiveRequirementRecord"("collectiveApplicationId", "requirementCode");

CREATE TABLE "CollectiveMemberRosterEntry" (
    "id" TEXT NOT NULL,
    "collectiveApplicationId" TEXT NOT NULL,
    "studentCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "className" TEXT,
    "roleInCollective" TEXT,
    "isParticipatingMovement" BOOLEAN NOT NULL DEFAULT false,
    "isSchoolSv5tRecognized" BOOLEAN NOT NULL DEFAULT false,
    "recognitionDecisionNumber" TEXT,
    "recognitionAcademicYear" TEXT,
    "dataOrigin" "DataOrigin" NOT NULL DEFAULT 'MANUAL',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CollectiveMemberRosterEntry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CollectiveMemberRosterEntry_app_student_key" ON "CollectiveMemberRosterEntry"("collectiveApplicationId", "studentCode");
CREATE INDEX "CollectiveMemberRosterEntry_filter_idx" ON "CollectiveMemberRosterEntry"("collectiveApplicationId", "isParticipatingMovement", "isSchoolSv5tRecognized");

CREATE TABLE "CollectiveCityRequirementJudgment" (
    "id" TEXT NOT NULL,
    "collectiveApplicationId" TEXT NOT NULL,
    "requirementCode" TEXT NOT NULL,
    "judgmentStatus" "ReviewJudgmentStatus" NOT NULL DEFAULT 'NOT_REVIEWED',
    "reviewerUserId" TEXT NOT NULL,
    "reviewerNameSnapshot" TEXT NOT NULL,
    "reviewerNote" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisionNumber" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "CollectiveCityRequirementJudgment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CollectiveCityRequirementJudgment_app_req_key" ON "CollectiveCityRequirementJudgment"("collectiveApplicationId", "requirementCode");
CREATE INDEX "CollectiveCityRequirementJudgment_reviewer_idx" ON "CollectiveCityRequirementJudgment"("reviewerUserId", "reviewedAt" DESC);

CREATE TABLE "CollectiveCityRequirementJudgmentHistory" (
    "id" TEXT NOT NULL,
    "judgmentId" TEXT NOT NULL,
    "judgmentStatus" "ReviewJudgmentStatus" NOT NULL,
    "reviewerUserId" TEXT NOT NULL,
    "reviewerNameSnapshot" TEXT NOT NULL,
    "reviewerNote" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollectiveCityRequirementJudgmentHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CollectiveCityRequirementJudgmentHistory_idx" ON "CollectiveCityRequirementJudgmentHistory"("judgmentId", "recordedAt" DESC);

-- ----------------------------------------------------------------------------
-- 6. SHARED WORKFLOW, DECISIONS & EVIDENCE (MODELS 23–32)
-- ----------------------------------------------------------------------------

CREATE TABLE "OfficerAssignmentHistory" (
    "id" TEXT NOT NULL,
    "track" "ApplicationTrack" NOT NULL,
    "individualApplicationId" TEXT,
    "collectiveApplicationId" TEXT,
    "assignedOfficerUserId" TEXT NOT NULL,
    "assignedOfficerName" TEXT NOT NULL,
    "previousOfficerUserId" TEXT,
    "previousOfficerName" TEXT,
    "assignedByManagerUserId" TEXT NOT NULL,
    "assignedByManagerName" TEXT NOT NULL,
    "isReassignment" BOOLEAN NOT NULL DEFAULT false,
    "assignmentNote" TEXT,
    "reassignmentReason" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OfficerAssignmentHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OfficerAssignmentHistory_ind_idx" ON "OfficerAssignmentHistory"("individualApplicationId", "assignedAt" DESC);
CREATE INDEX "OfficerAssignmentHistory_col_idx" ON "OfficerAssignmentHistory"("collectiveApplicationId", "assignedAt" DESC);
CREATE INDEX "OfficerAssignmentHistory_officer_idx" ON "OfficerAssignmentHistory"("assignedOfficerUserId", "assignedAt" DESC);

CREATE TABLE "SupplementRequest" (
    "id" TEXT NOT NULL,
    "track" "ApplicationTrack" NOT NULL,
    "stage" TEXT NOT NULL,
    "individualApplicationId" TEXT,
    "collectiveApplicationId" TEXT,
    "criterionOrReqCode" TEXT NOT NULL,
    "scopeType" "SupplementScopeType" NOT NULL DEFAULT 'CRITERION_OR_REQUIREMENT',
    "targetDeclarationId" TEXT,
    "targetEvidenceLinkId" TEXT,
    "requestReason" TEXT NOT NULL,
    "requiredAction" TEXT,
    "deadlineAt" TIMESTAMP(3),
    "status" "SupplementLifecycleStatus" NOT NULL DEFAULT 'OPEN',
    "requestedByUserId" TEXT NOT NULL,
    "requestedByNameSnapshot" TEXT NOT NULL,
    "requestedByRole" "SystemRoleCode" NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedByUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    CONSTRAINT "SupplementRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SupplementRequest_ind_idx" ON "SupplementRequest"("individualApplicationId", "status", "requestedAt" DESC);
CREATE INDEX "SupplementRequest_col_idx" ON "SupplementRequest"("collectiveApplicationId", "status", "requestedAt" DESC);
CREATE INDEX "SupplementRequest_stage_idx" ON "SupplementRequest"("track", "stage", "status", "deadlineAt");

CREATE TABLE "SupplementResponse" (
    "id" TEXT NOT NULL,
    "supplementRequestId" TEXT NOT NULL,
    "responderUserId" TEXT NOT NULL,
    "responderNameSnapshot" TEXT NOT NULL,
    "explanationNote" TEXT NOT NULL,
    "attachedEvidenceIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplementResponse_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SupplementResponse_req_idx" ON "SupplementResponse"("supplementRequestId", "respondedAt" DESC);

CREATE TABLE "CommitteeDecisionRecord" (
    "id" TEXT NOT NULL,
    "track" "ApplicationTrack" NOT NULL,
    "individualApplicationId" TEXT,
    "collectiveApplicationId" TEXT,
    "outcome" "CommitteeOutcome" NOT NULL,
    "decisionNote" TEXT,
    "decidedByUserId" TEXT NOT NULL,
    "decidedByNameSnapshot" TEXT NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCurrentActive" BOOLEAN NOT NULL DEFAULT true,
    "reopenedAt" TIMESTAMP(3),
    "reopenedByUserId" TEXT,
    "reopenReason" TEXT,
    CONSTRAINT "CommitteeDecisionRecord_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CommitteeDecisionRecord_ind_idx" ON "CommitteeDecisionRecord"("individualApplicationId", "isCurrentActive", "decidedAt" DESC);
CREATE INDEX "CommitteeDecisionRecord_col_idx" ON "CommitteeDecisionRecord"("collectiveApplicationId", "isCurrentActive", "decidedAt" DESC);

CREATE TABLE "RecognitionDecisionBatch" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "track" "ApplicationTrack" NOT NULL,
    "decisionNumber" TEXT NOT NULL,
    "decisionTitle" TEXT NOT NULL,
    "decisionDate" TIMESTAMP(3) NOT NULL,
    "signedByName" TEXT NOT NULL,
    "signedByTitle" TEXT NOT NULL,
    "status" "DecisionBatchStatus" NOT NULL DEFAULT 'PUBLISHED',
    "publishedById" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecognitionDecisionBatch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RecognitionDecisionBatch_decisionNumber_key" ON "RecognitionDecisionBatch"("decisionNumber");
CREATE INDEX "RecognitionDecisionBatch_season_idx" ON "RecognitionDecisionBatch"("seasonId", "track", "status");

CREATE TABLE "ApplicationFinalResult" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "track" "ApplicationTrack" NOT NULL,
    "individualApplicationId" TEXT,
    "collectiveApplicationId" TEXT,
    "outcome" "CommitteeOutcome" NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "decisionBatchId" TEXT,
    "decisionNumberSnapshot" TEXT,
    "decisionDateSnapshot" TIMESTAMP(3),
    "certificateSerialNumber" TEXT,
    "finalizedByUserId" TEXT NOT NULL,
    "finalizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedByUserId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "summaryNote" TEXT,
    CONSTRAINT "ApplicationFinalResult_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ApplicationFinalResult_individualApplicationId_key" ON "ApplicationFinalResult"("individualApplicationId");
CREATE UNIQUE INDEX "ApplicationFinalResult_collectiveApplicationId_key" ON "ApplicationFinalResult"("collectiveApplicationId");
CREATE UNIQUE INDEX "ApplicationFinalResult_certificateSerialNumber_key" ON "ApplicationFinalResult"("certificateSerialNumber");
CREATE INDEX "ApplicationFinalResult_season_idx" ON "ApplicationFinalResult"("seasonId", "track", "isPublished", "outcome");
CREATE INDEX "ApplicationFinalResult_batch_idx" ON "ApplicationFinalResult"("decisionBatchId");

CREATE TABLE "EvidenceObject" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "track" "ApplicationTrack" NOT NULL,
    "individualAppId" TEXT,
    "collectiveAppId" TEXT,
    "currentVersionNo" INTEGER NOT NULL DEFAULT 1,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "sha256Checksum" TEXT NOT NULL,
    "bucketName" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "scanStatus" "EvidenceScanStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "EvidenceObject_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EvidenceObject_objectKey_key" ON "EvidenceObject"("objectKey");
CREATE INDEX "EvidenceObject_owner_idx" ON "EvidenceObject"("ownerUserId", "isFinalized", "uploadedAt" DESC);
CREATE INDEX "EvidenceObject_ind_idx" ON "EvidenceObject"("individualAppId", "isFinalized");
CREATE INDEX "EvidenceObject_col_idx" ON "EvidenceObject"("collectiveAppId", "isFinalized");
CREATE INDEX "EvidenceObject_scan_idx" ON "EvidenceObject"("scanStatus", "uploadedAt");

CREATE TABLE "EvidenceObjectVersion" (
    "id" TEXT NOT NULL,
    "evidenceObjectId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "sha256Checksum" TEXT NOT NULL,
    "bucketName" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "scanStatus" "EvidenceScanStatus" NOT NULL DEFAULT 'CLEAN',
    "uploadedByUserId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeReason" TEXT,
    CONSTRAINT "EvidenceObjectVersion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EvidenceObjectVersion_objectKey_key" ON "EvidenceObjectVersion"("objectKey");
CREATE UNIQUE INDEX "EvidenceObjectVersion_obj_ver_key" ON "EvidenceObjectVersion"("evidenceObjectId", "versionNumber");

CREATE TABLE "ApplicationEvidenceLink" (
    "id" TEXT NOT NULL,
    "evidenceObjectId" TEXT NOT NULL,
    "individualDeclarationItemId" TEXT,
    "collectiveRequirementId" TEXT,
    "linkedByUserId" TEXT NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlinkedAt" TIMESTAMP(3),
    CONSTRAINT "ApplicationEvidenceLink_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ApplicationEvidenceLink_obj_idx" ON "ApplicationEvidenceLink"("evidenceObjectId");
CREATE INDEX "ApplicationEvidenceLink_decl_idx" ON "ApplicationEvidenceLink"("individualDeclarationItemId");
CREATE INDEX "ApplicationEvidenceLink_req_idx" ON "ApplicationEvidenceLink"("collectiveRequirementId");

CREATE TABLE "EvidenceReviewJudgment" (
    "id" TEXT NOT NULL,
    "evidenceLinkId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "judgmentStatus" "ReviewJudgmentStatus" NOT NULL DEFAULT 'NOT_REVIEWED',
    "reviewerUserId" TEXT NOT NULL,
    "reviewerNameSnapshot" TEXT NOT NULL,
    "reviewerNote" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidenceReviewJudgment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EvidenceReviewJudgment_link_stage_key" ON "EvidenceReviewJudgment"("evidenceLinkId", "stage");
CREATE INDEX "EvidenceReviewJudgment_reviewer_idx" ON "EvidenceReviewJudgment"("reviewerUserId", "reviewedAt" DESC);

-- ----------------------------------------------------------------------------
-- 7. NOTIFICATIONS, OUTBOX & APPEND-ONLY AUDIT LOG (MODELS 33–35)
-- ----------------------------------------------------------------------------

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "track" "ApplicationTrack",
    "applicationId" TEXT,
    "actionUrl" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_user_status_idx" ON "Notification"("recipientUserId", "status", "createdAt" DESC);

CREATE TABLE "TransactionalOutboxEvent" (
    "id" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxProcessStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    CONSTRAINT "TransactionalOutboxEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TransactionalOutboxEvent_status_next_idx" ON "TransactionalOutboxEvent"("status", "nextAttemptAt");

CREATE TABLE "AuditLogEvent" (
    "id" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "actorUserId" TEXT,
    "actorEmail" TEXT,
    "actorRole" TEXT NOT NULL,
    "actorUnitId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "track" "ApplicationTrack",
    "applicationId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "actionCode" TEXT NOT NULL,
    "previousState" JSONB,
    "nextState" JSONB,
    "metadata" JSONB,
    CONSTRAINT "AuditLogEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLogEvent_app_idx" ON "AuditLogEvent"("applicationId", "occurredAt" DESC);
CREATE INDEX "AuditLogEvent_actor_idx" ON "AuditLogEvent"("actorUserId", "occurredAt" DESC);
CREATE INDEX "AuditLogEvent_track_action_idx" ON "AuditLogEvent"("track", "actionCode", "occurredAt" DESC);
CREATE INDEX "AuditLogEvent_idempotency_idx" ON "AuditLogEvent"("idempotencyKey");

-- ----------------------------------------------------------------------------
-- 8. REFERENTIAL INTEGRITY FOREIGN KEY CONSTRAINTS
-- ----------------------------------------------------------------------------

ALTER TABLE "SchoolReviewUnit" ADD CONSTRAINT "SchoolReviewUnit_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FacultyDepartment" ADD CONSTRAINT "FacultyDepartment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FacultyDepartment" ADD CONSTRAINT "FacultyDepartment_schoolReviewUnitId_fkey" FOREIGN KEY ("schoolReviewUnitId") REFERENCES "SchoolReviewUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AcademicClass" ADD CONSTRAINT "AcademicClass_facultyDepartmentId_fkey" FOREIGN KEY ("facultyDepartmentId") REFERENCES "FacultyDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "User" ADD CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CriterionGroupDefinition" ADD CONSTRAINT "CriterionGroupDefinition_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "AwardSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RequirementDefinition" ADD CONSTRAINT "RequirementDefinition_criterionGroupId_fkey" FOREIGN KEY ("criterionGroupId") REFERENCES "CriterionGroupDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IndividualApplication" ADD CONSTRAINT "IndividualApplication_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "AwardSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IndividualApplication" ADD CONSTRAINT "IndividualApplication_applicantUserId_fkey" FOREIGN KEY ("applicantUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IndividualApplication" ADD CONSTRAINT "IndividualApplication_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IndividualApplication" ADD CONSTRAINT "IndividualApplication_schoolReviewUnitId_fkey" FOREIGN KEY ("schoolReviewUnitId") REFERENCES "SchoolReviewUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "IndividualCriterionSubmission" ADD CONSTRAINT "IndividualCriterionSubmission_individualApplicationId_fkey" FOREIGN KEY ("individualApplicationId") REFERENCES "IndividualApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IndividualDeclarationItem" ADD CONSTRAINT "IndividualDeclarationItem_individualApplicationId_fkey" FOREIGN KEY ("individualApplicationId") REFERENCES "IndividualApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IndividualDeclarationItem" ADD CONSTRAINT "IndividualDeclarationItem_criterionSubmissionId_fkey" FOREIGN KEY ("criterionSubmissionId") REFERENCES "IndividualCriterionSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SchoolCriterionReviewJudgment" ADD CONSTRAINT "SchoolCriterionReviewJudgment_individualApplicationId_fkey" FOREIGN KEY ("individualApplicationId") REFERENCES "IndividualApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CityCriterionReviewJudgment" ADD CONSTRAINT "CityCriterionReviewJudgment_individualApplicationId_fkey" FOREIGN KEY ("individualApplicationId") REFERENCES "IndividualApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CollectiveUnit" ADD CONSTRAINT "CollectiveUnit_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CollectiveUnit" ADD CONSTRAINT "CollectiveUnit_schoolReviewUnitId_fkey" FOREIGN KEY ("schoolReviewUnitId") REFERENCES "SchoolReviewUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CollectiveUnit" ADD CONSTRAINT "CollectiveUnit_facultyDepartmentId_fkey" FOREIGN KEY ("facultyDepartmentId") REFERENCES "FacultyDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CollectivePreparerAuthorization" ADD CONSTRAINT "CollectivePreparerAuthorization_collectiveUnitId_fkey" FOREIGN KEY ("collectiveUnitId") REFERENCES "CollectiveUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CollectivePreparerAuthorization" ADD CONSTRAINT "CollectivePreparerAuthorization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CollectivePreparerAuthorization" ADD CONSTRAINT "CollectivePreparerAuthorization_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "AwardSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CollectiveApplication" ADD CONSTRAINT "CollectiveApplication_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "AwardSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CollectiveApplication" ADD CONSTRAINT "CollectiveApplication_collectiveUnitId_fkey" FOREIGN KEY ("collectiveUnitId") REFERENCES "CollectiveUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CollectiveApplication" ADD CONSTRAINT "CollectiveApplication_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CollectiveApplication" ADD CONSTRAINT "CollectiveApplication_schoolReviewUnitId_fkey" FOREIGN KEY ("schoolReviewUnitId") REFERENCES "SchoolReviewUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CollectiveApplication" ADD CONSTRAINT "CollectiveApplication_preparerUserId_fkey" FOREIGN KEY ("preparerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CollectiveRequirementRecord" ADD CONSTRAINT "CollectiveRequirementRecord_collectiveApplicationId_fkey" FOREIGN KEY ("collectiveApplicationId") REFERENCES "CollectiveApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CollectiveMemberRosterEntry" ADD CONSTRAINT "CollectiveMemberRosterEntry_collectiveApplicationId_fkey" FOREIGN KEY ("collectiveApplicationId") REFERENCES "CollectiveApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CollectiveCityRequirementJudgment" ADD CONSTRAINT "CollectiveCityRequirementJudgment_collectiveApplicationId_fkey" FOREIGN KEY ("collectiveApplicationId") REFERENCES "CollectiveApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CollectiveCityRequirementJudgmentHistory" ADD CONSTRAINT "CollectiveCityRequirementJudgmentHistory_judgmentId_fkey" FOREIGN KEY ("judgmentId") REFERENCES "CollectiveCityRequirementJudgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OfficerAssignmentHistory" ADD CONSTRAINT "OfficerAssignmentHistory_individualApplicationId_fkey" FOREIGN KEY ("individualApplicationId") REFERENCES "IndividualApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficerAssignmentHistory" ADD CONSTRAINT "OfficerAssignmentHistory_collectiveApplicationId_fkey" FOREIGN KEY ("collectiveApplicationId") REFERENCES "CollectiveApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SupplementRequest" ADD CONSTRAINT "SupplementRequest_individualApplicationId_fkey" FOREIGN KEY ("individualApplicationId") REFERENCES "IndividualApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplementRequest" ADD CONSTRAINT "SupplementRequest_collectiveApplicationId_fkey" FOREIGN KEY ("collectiveApplicationId") REFERENCES "CollectiveApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SupplementResponse" ADD CONSTRAINT "SupplementResponse_supplementRequestId_fkey" FOREIGN KEY ("supplementRequestId") REFERENCES "SupplementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommitteeDecisionRecord" ADD CONSTRAINT "CommitteeDecisionRecord_individualApplicationId_fkey" FOREIGN KEY ("individualApplicationId") REFERENCES "IndividualApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommitteeDecisionRecord" ADD CONSTRAINT "CommitteeDecisionRecord_collectiveApplicationId_fkey" FOREIGN KEY ("collectiveApplicationId") REFERENCES "CollectiveApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecognitionDecisionBatch" ADD CONSTRAINT "RecognitionDecisionBatch_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "AwardSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ApplicationFinalResult" ADD CONSTRAINT "ApplicationFinalResult_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "AwardSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApplicationFinalResult" ADD CONSTRAINT "ApplicationFinalResult_individualApplicationId_fkey" FOREIGN KEY ("individualApplicationId") REFERENCES "IndividualApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationFinalResult" ADD CONSTRAINT "ApplicationFinalResult_collectiveApplicationId_fkey" FOREIGN KEY ("collectiveApplicationId") REFERENCES "CollectiveApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationFinalResult" ADD CONSTRAINT "ApplicationFinalResult_decisionBatchId_fkey" FOREIGN KEY ("decisionBatchId") REFERENCES "RecognitionDecisionBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EvidenceObjectVersion" ADD CONSTRAINT "EvidenceObjectVersion_evidenceObjectId_fkey" FOREIGN KEY ("evidenceObjectId") REFERENCES "EvidenceObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ApplicationEvidenceLink" ADD CONSTRAINT "ApplicationEvidenceLink_evidenceObjectId_fkey" FOREIGN KEY ("evidenceObjectId") REFERENCES "EvidenceObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApplicationEvidenceLink" ADD CONSTRAINT "ApplicationEvidenceLink_individualDeclarationItemId_fkey" FOREIGN KEY ("individualDeclarationItemId") REFERENCES "IndividualDeclarationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationEvidenceLink" ADD CONSTRAINT "ApplicationEvidenceLink_collectiveRequirementId_fkey" FOREIGN KEY ("collectiveRequirementId") REFERENCES "CollectiveRequirementRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EvidenceReviewJudgment" ADD CONSTRAINT "EvidenceReviewJudgment_evidenceLinkId_fkey" FOREIGN KEY ("evidenceLinkId") REFERENCES "ApplicationEvidenceLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
