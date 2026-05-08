-- Update TAI_KHOAN with bcrypt hashed passwords
-- Generated using: npm run generate-hashes

-- Update admin account
UPDATE TAI_KHOAN 
SET MATKHAU = '$2b$10$RtL1RaEGCXuQBzxWTSdKzOTLPP76QK855WcYA7LkSQisBLxxHXK0i'
WHERE TENDANGNHAP = 'admin';

-- Update customer1 account  
UPDATE TAI_KHOAN 
SET MATKHAU = '$2b$10$vh3voPKIxNomeOT9iFMlxeNPHQgtG4E.uLvZ5GebhsN0Oru3uFqTa'
WHERE TENDANGNHAP = 'customer1';

COMMIT;

-- Verify updates
SELECT TENDANGNHAP, MATKHAU FROM TAI_KHOAN WHERE TENDANGNHAP IN ('admin', 'customer1');
