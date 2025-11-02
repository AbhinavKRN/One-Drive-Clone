-- Verification Query for Link Sharing Columns
-- Run this in Supabase SQL Editor to check if columns exist and have correct types

-- Check column types and constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'file_shares'
AND column_name IN ('share_token', 'link_enabled', 'expires_at', 'allow_download', 'share_type', 'shared_with')
ORDER BY column_name;

-- Expected Results:
-- shared_with: uuid, is_nullable: YES (this should be YES for link sharing to work)
-- share_token: text, is_nullable: YES
-- link_enabled: boolean, column_default: false
-- expires_at: timestamp with time zone, is_nullable: YES
-- allow_download: boolean, column_default: true
-- share_type: text, column_default: 'user'

