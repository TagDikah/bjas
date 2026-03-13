-- Runs automatically on first container start.
-- Creates minimal tables for the app.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  role VARCHAR(32) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(255) NULL,
  station VARCHAR(255) NULL,
  badge VARCHAR(64) NULL,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  publicKey TEXT NOT NULL,
  privateKey TEXT NOT NULL,
  createdAt DATETIME NOT NULL,
  createdBy VARCHAR(64) NULL
);

CREATE TABLE IF NOT EXISTS cases (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(64) NOT NULL,
  createdById VARCHAR(64) NOT NULL,
  createdByName VARCHAR(255) NOT NULL,
  createdByRole VARCHAR(32) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  assignedToId VARCHAR(64) NULL,
  assignedToName VARCHAR(255) NULL,
  assignedToRole VARCHAR(32) NULL,
  FOREIGN KEY (createdById) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_entries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  caseId VARCHAR(64) NOT NULL,
  action VARCHAR(255) NOT NULL,
  performedById VARCHAR(64) NOT NULL,
  performedByName VARCHAR(255) NOT NULL,
  performedByRole VARCHAR(32) NOT NULL,
  timestamp DATETIME NOT NULL,
  details TEXT NULL,
  blockIndex INT NULL,
  transactionHash VARCHAR(128) NULL,
  INDEX idx_caseId (caseId),
  FOREIGN KEY (caseId) REFERENCES cases(id)
);
