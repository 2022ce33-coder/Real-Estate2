-- Migration: Add users table for regular users
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Migration: Add password_hash column to agents table
ALTER TABLE agents ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '';

-- Add unique constraint to email
ALTER TABLE agents ADD UNIQUE KEY unique_agent_email (email);

-- Optional: Add password_hash to profiles table as well if needed
ALTER TABLE profiles ADD COLUMN password_hash VARCHAR(255);

-- Migration: Add amenities column to properties table
ALTER TABLE properties ADD COLUMN amenities JSON DEFAULT '[]';
