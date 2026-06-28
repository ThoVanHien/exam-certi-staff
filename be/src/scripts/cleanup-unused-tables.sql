-- =================================================================
-- Cleanup Script: Drop tables not used in Inspector Certification App
-- Run this MANUALLY after verifying no data needs to be backed up.
-- =================================================================

-- Disable FK checks to allow dropping in any order
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS exam_results;
DROP TABLE IF EXISTS exam_questions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;

-- Re-enable FK checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify remaining tables (should be exactly 10)
SHOW TABLES;
