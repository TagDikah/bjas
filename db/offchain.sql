CREATE TABLE IF NOT EXISTS case_parties (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  caseId VARCHAR(64) NOT NULL,
  partyType VARCHAR(40) NOT NULL,
  fullName VARCHAR(160) NOT NULL,
  nationalId VARCHAR(60) NULL,
  phone VARCHAR(40) NULL,
  address TEXT NULL,
  notes TEXT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_case_parties_case (caseId),
  INDEX idx_case_parties_type (partyType)
);

CREATE TABLE IF NOT EXISTS statements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  caseId VARCHAR(64) NOT NULL,
  partyId BIGINT NULL,
  takenByUserId VARCHAR(64) NULL,
  statementText MEDIUMTEXT NOT NULL,
  statementHash CHAR(64) NOT NULL,
  ipfsCid VARCHAR(120) NULL,
  chainAnchorTx VARCHAR(160) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_statements_case (caseId),
  INDEX idx_statements_party (partyId),
  INDEX idx_statements_user (takenByUserId)
);

CREATE TABLE IF NOT EXISTS evidence_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  caseId VARCHAR(64) NOT NULL,
  uploadedByUserId VARCHAR(64) NULL,
  evidenceType VARCHAR(60) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  storageProvider VARCHAR(30) NOT NULL DEFAULT 'IPFS',
  storageRef VARCHAR(255) NOT NULL,
  mimeType VARCHAR(120) NULL,
  bytes BIGINT NULL,
  contentHash CHAR(64) NOT NULL,
  chainAnchorTx VARCHAR(160) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_evidence_case (caseId),
  INDEX idx_evidence_type (evidenceType),
  INDEX idx_evidence_user (uploadedByUserId)
);

CREATE TABLE IF NOT EXISTS exhibits (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  caseId VARCHAR(64) NOT NULL,
  exhibitTag VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  seizedByUserId VARCHAR(64) NULL,
  seizedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  currentHolderUserId VARCHAR(64) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'IN_CUSTODY',
  UNIQUE KEY uq_exhibit_tag (exhibitTag),
  INDEX idx_exhibit_case (caseId),
  INDEX idx_exhibit_holder (currentHolderUserId)
);

CREATE TABLE IF NOT EXISTS chain_transfers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  caseId VARCHAR(64) NOT NULL,
  exhibitId BIGINT NULL,
  fromUserId VARCHAR(64) NULL,
  toUserId VARCHAR(64) NULL,
  reason VARCHAR(255) NULL,
  transferAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transferHash CHAR(64) NOT NULL,
  chainAnchorTx VARCHAR(160) NULL,
  INDEX idx_transfer_case (caseId),
  INDEX idx_transfer_exhibit (exhibitId),
  INDEX idx_transfer_from (fromUserId),
  INDEX idx_transfer_to (toUserId)
);

CREATE TABLE IF NOT EXISTS case_assignments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  caseId VARCHAR(64) NOT NULL,
  assignedToUserId VARCHAR(64) NOT NULL,
  assignedByUserId VARCHAR(64) NULL,
  assignmentType VARCHAR(40) NOT NULL DEFAULT 'PRIMARY',
  note VARCHAR(255) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_assignment_case (caseId),
  INDEX idx_assignment_to (assignedToUserId),
  INDEX idx_assignment_type (assignmentType)
);

CREATE TABLE IF NOT EXISTS case_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  caseId VARCHAR(64) NOT NULL,
  eventType VARCHAR(60) NOT NULL,
  eventNote TEXT NULL,
  createdByUserId VARCHAR(64) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  eventHash CHAR(64) NOT NULL,
  chainAnchorTx VARCHAR(160) NULL,
  INDEX idx_events_case (caseId),
  INDEX idx_events_type (eventType),
  INDEX idx_events_user (createdByUserId)
);

CREATE TABLE IF NOT EXISTS file_registry (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  caseId VARCHAR(64) NOT NULL,
  uploadedByUserId VARCHAR(64) NULL,
  purpose VARCHAR(60) NOT NULL,
  storageProvider VARCHAR(30) NOT NULL DEFAULT 'IPFS',
  storageRef VARCHAR(255) NOT NULL,
  contentHash CHAR(64) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_files_case (caseId),
  INDEX idx_files_purpose (purpose),
  INDEX idx_files_user (uploadedByUserId)
);