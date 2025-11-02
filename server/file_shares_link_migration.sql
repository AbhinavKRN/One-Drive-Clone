-- File Shares Link Sharing Migration
-- Run this in Supabase SQL Editor to add link sharing support
-- IMPORTANT: This migration allows shared_with to be NULL for link shares

-- First, allow shared_with to be NULL for link shares (required for link sharing)
ALTER TABLE file_shares 
ALTER COLUMN shared_with DROP NOT NULL;

-- Add new columns to file_shares table for link sharing
ALTER TABLE file_shares 
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS link_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS share_type TEXT DEFAULT 'user'; -- 'user' or 'link'

-- Create index for share_token for quick lookups
CREATE INDEX IF NOT EXISTS idx_file_shares_token ON file_shares(share_token) WHERE share_token IS NOT NULL;

-- Create index for link-enabled shares
CREATE INDEX IF NOT EXISTS idx_file_shares_link_enabled ON file_shares(file_id) WHERE link_enabled = true;

-- Update unique constraint to handle NULL values properly (allow multiple NULLs for link shares)
-- Drop existing constraint if it exists
ALTER TABLE file_shares DROP CONSTRAINT IF EXISTS file_shares_file_id_shared_with_key;

-- Create new constraint that allows multiple NULLs (for link shares)
-- This ensures one user share per file, but allows multiple link shares
CREATE UNIQUE INDEX IF NOT EXISTS file_shares_file_id_shared_with_unique 
ON file_shares(file_id, shared_with) 
WHERE shared_with IS NOT NULL;

-- Success message
SELECT 'Link sharing support added successfully!' AS message;

