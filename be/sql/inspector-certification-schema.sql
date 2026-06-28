CREATE TABLE plants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_plants_code (code),
  KEY idx_plants_active (is_active)
);

CREATE TABLE processes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_processes_code (code),
  KEY idx_processes_active (is_active)
);

CREATE TABLE detail_processes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  process_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_detail_processes_process FOREIGN KEY (process_id) REFERENCES processes(id),
  UNIQUE KEY uk_detail_processes_process_code (process_id, code),
  KEY idx_detail_processes_process (process_id),
  KEY idx_detail_processes_active (is_active)
);

CREATE TABLE inspectors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  eid VARCHAR(50) NOT NULL,
  knox_id VARCHAR(100) NULL,
  plant_id BIGINT UNSIGNED NOT NULL,
  process_id BIGINT UNSIGNED NOT NULL,
  detail_process_id BIGINT UNSIGNED NOT NULL,
  enter_date DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inspectors_plant FOREIGN KEY (plant_id) REFERENCES plants(id),
  CONSTRAINT fk_inspectors_process FOREIGN KEY (process_id) REFERENCES processes(id),
  CONSTRAINT fk_inspectors_detail_process FOREIGN KEY (detail_process_id) REFERENCES detail_processes(id),
  UNIQUE KEY uk_inspectors_eid_detail_process (eid, detail_process_id),
  KEY idx_inspectors_eid (eid),
  KEY idx_inspectors_knox_id (knox_id),
  KEY idx_inspectors_active (is_active),
  KEY idx_inspectors_plant (plant_id),
  KEY idx_inspectors_process (process_id),
  KEY idx_inspectors_detail_process (detail_process_id)
);

CREATE TABLE certification_settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  passing_score DECIMAL(5,2) NOT NULL,
  valid_months INT NOT NULL,
  template_version VARCHAR(50) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_certification_settings_active (is_active)
);

CREATE TABLE certification_results (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  inspector_id BIGINT UNSIGNED NOT NULL,
  setting_id BIGINT UNSIGNED NULL,
  eid_snapshot VARCHAR(50) NOT NULL,
  staff_name_snapshot VARCHAR(255) NULL,
  department_snapshot VARCHAR(255) NULL,
  team_snapshot VARCHAR(255) NULL,
  product_snapshot VARCHAR(255) NULL,
  position_snapshot VARCHAR(255) NULL,
  plant_id_snapshot BIGINT UNSIGNED NULL,
  process_id_snapshot BIGINT UNSIGNED NULL,
  detail_process_id_snapshot BIGINT UNSIGNED NULL,
  training_start_date DATE NULL,
  training_end_date DATE NULL,
  exam_date DATE NULL,
  exam_score DECIMAL(5,2) NULL,
  passing_score_snapshot DECIMAL(5,2) NULL,
  exam_result_status VARCHAR(30) NOT NULL DEFAULT 'NOT_TAKEN',
  certificate_no VARCHAR(100) NULL,
  certificate_date DATE NULL,
  valid_months_snapshot INT NULL,
  expire_date DATE NULL,
  certificate_status VARCHAR(30) NOT NULL DEFAULT 'NOT_ISSUED',
  approval_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  current_approval_request_id BIGINT UNSIGNED NULL,
  remark TEXT NULL,
  created_by VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_certification_results_inspector FOREIGN KEY (inspector_id) REFERENCES inspectors(id),
  CONSTRAINT fk_certification_results_setting FOREIGN KEY (setting_id) REFERENCES certification_settings(id),
  CONSTRAINT fk_certification_results_plant_snapshot FOREIGN KEY (plant_id_snapshot) REFERENCES plants(id),
  CONSTRAINT fk_certification_results_process_snapshot FOREIGN KEY (process_id_snapshot) REFERENCES processes(id),
  CONSTRAINT fk_certification_results_detail_process_snapshot FOREIGN KEY (detail_process_id_snapshot) REFERENCES detail_processes(id),
  KEY idx_certification_results_inspector (inspector_id),
  KEY idx_certification_results_eid_snapshot (eid_snapshot),
  KEY idx_certification_results_exam_status (exam_result_status),
  KEY idx_certification_results_approval_status (approval_status),
  KEY idx_certification_results_certificate_status (certificate_status),
  KEY idx_certification_results_certificate_date (certificate_date),
  KEY idx_certification_results_expire_date (expire_date),
  KEY idx_certification_results_current_approval_request (current_approval_request_id)
);

CREATE TABLE approval_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  certification_result_id BIGINT UNSIGNED NOT NULL,
  external_approval_id VARCHAR(100) NULL,
  external_approval_url VARCHAR(1000) NULL,
  approval_status VARCHAR(30) NOT NULL DEFAULT 'WAITING_APPROVAL',
  requested_by VARCHAR(100) NULL,
  requested_at DATETIME NULL,
  approved_by VARCHAR(100) NULL,
  approved_at DATETIME NULL,
  rejected_by VARCHAR(100) NULL,
  rejected_at DATETIME NULL,
  reject_reason TEXT NULL,
  cancelled_by VARCHAR(100) NULL,
  cancelled_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_approval_requests_certification_result FOREIGN KEY (certification_result_id) REFERENCES certification_results(id),
  KEY idx_approval_requests_certification_result (certification_result_id),
  KEY idx_approval_requests_external_id (external_approval_id),
  KEY idx_approval_requests_status (approval_status)
);

CREATE TABLE file_objects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  original_file_name VARCHAR(255) NOT NULL,
  stored_file_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(1000) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  file_hash CHAR(64) NOT NULL,
  storage_type VARCHAR(30) NOT NULL DEFAULT 'LOCAL',
  compressed TINYINT(1) NOT NULL DEFAULT 0,
  created_by VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_file_objects_file_hash (file_hash),
  KEY idx_file_objects_storage_type (storage_type),
  KEY idx_file_objects_created_at (created_at)
);

CREATE TABLE certification_files (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  certification_result_id BIGINT UNSIGNED NOT NULL,
  file_object_id BIGINT UNSIGNED NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  uploaded_by VARCHAR(100) NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  deleted_by VARCHAR(100) NULL,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_certification_files_certification_result FOREIGN KEY (certification_result_id) REFERENCES certification_results(id),
  CONSTRAINT fk_certification_files_file_object FOREIGN KEY (file_object_id) REFERENCES file_objects(id),
  KEY idx_certification_files_certification_result (certification_result_id),
  KEY idx_certification_files_file_object (file_object_id),
  KEY idx_certification_files_file_type (file_type),
  KEY idx_certification_files_deleted (is_deleted)
);

CREATE TABLE certification_histories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  certification_result_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_value JSON NULL,
  new_value JSON NULL,
  changed_by VARCHAR(100) NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_certification_histories_certification_result FOREIGN KEY (certification_result_id) REFERENCES certification_results(id),
  KEY idx_certification_histories_certification_result (certification_result_id),
  KEY idx_certification_histories_action (action),
  KEY idx_certification_histories_changed_at (changed_at)
);

-- Optional if your migration flow supports circular foreign keys safely:
-- ALTER TABLE certification_results
-- ADD CONSTRAINT fk_certification_results_current_approval_request
-- FOREIGN KEY (current_approval_request_id) REFERENCES approval_requests(id);
