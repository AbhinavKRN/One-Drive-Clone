-- File Shares Link Migration Reset and Re-run
-- Run this in Supabase SQL Editor to reset and reapply the link sharing migration

-- Step 1: Drop indexes if they exist
DROP INDEX IF EXISTS idx_file_shares_token;
DROP INDEX IF EXISTS idx_file_shares_link_enabled;
DROP INDEX IF EXISTS file_shares_file_id_shared_with_unique;

-- Step 2: Drop the columns if they exist
ALTER TABLE file_shares 
DROP COLUMN IF EXISTS share_token,
DROP COLUMN IF EXISTS link_enabled,
DROP COLUMN IF EXISTS expires_at,
DROP COLUMN IF EXISTS allow_download,
DROP COLUMN IF EXISTS share_type;

-- Step 3: Now allow shared_with to be NULL (this is safe to run multiple times)
ALTER TABLE file_shares 
ALTER COLUMN shared_with DROP NOT NULL;

-- Step 4: Drop the old unique constraint if it exists
ALTER TABLE file_shares DROP CONSTRAINT IF EXISTS file_shares_file_id_shared_with_key;

-- Step 5: Re-add all columns
ALTER TABLE file_shares 
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS link_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS share_type TEXT DEFAULT 'user'; -- 'user' or 'link'

-- Step 6: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_file_shares_token ON file_shares(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_file_shares_link_enabled ON file_shares(file_id) WHERE link_enabled = true;

-- Step 7: Create new unique constraint that handles NULL properly
CREATE UNIQUE INDEX IF NOT EXISTS file_shares_file_id_shared_with_unique 
ON file_shares(file_id, shared_with) 
WHERE shared_with IS NOT NULL;

-- Success message
SELECT 'Link sharing migration reset and reapplied successfully!' AS message;

