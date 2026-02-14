-- Migration: Add Email Verification Fields
-- Purpose: Add email verification code and verified status to users and agents tables
-- Run this migration to update your database schema

-- Add email verification columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code_expires DATETIME;

-- Add email verification columns to agent_applications table
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS verification_code_expires DATETIME;

-- Add email verification columns to agents table
-- Note: password_hash column already exists, only adding email_verified if not exists
ALTER TABLE agents ADD COLUMN email_verified BOOLEAN DEFAULT true;

-- Important Notes:
-- 1. All new users and agents MUST verify their email before login
-- 2. Existing users in the system will have email_verified = false and need to verify
-- 3. You can update existing verified users manually:
--    UPDATE users SET email_verified = true WHERE id = 'user_id_here';
--    UPDATE agent_applications SET email_verified = true WHERE id = 'agent_id_here';
-- 4. Agents table email_verified defaults to true (approved agents are auto-verified)
