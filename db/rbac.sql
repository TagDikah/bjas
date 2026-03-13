CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(80) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role VARCHAR(60) NOT NULL,
  permissionCode VARCHAR(80) NOT NULL,
  UNIQUE KEY uq_role_perm (role, permissionCode),
  INDEX idx_role (role),
  INDEX idx_perm (permissionCode)
);

CREATE TABLE IF NOT EXISTS department_policies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  department VARCHAR(60) NOT NULL UNIQUE,
  policyJson JSON NOT NULL
);