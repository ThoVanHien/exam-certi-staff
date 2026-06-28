-- =================================================================
-- Cleanup Script: Drop old tables before migrating to MCQ spec
-- Run this MANUALLY after verifying no data needs to be backed up.
-- =================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS certification_files;
DROP TABLE IF EXISTS file_objects;
DROP TABLE IF EXISTS certification_results;
DROP TABLE IF EXISTS certification_settings;
DROP TABLE IF EXISTS certification_histories;

DROP TABLE IF EXISTS exam_result_answers;
DROP TABLE IF EXISTS exam_results;
DROP TABLE IF EXISTS exam_questions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS certificate_results;
DROP TABLE IF EXISTS approval_requests;
DROP TABLE IF EXISTS histories;

SET FOREIGN_KEY_CHECKS = 1;

SHOW TABLES;
