-- Migration SQL to add Recycle Bin functionality
-- Run this in your Supabase SQL Editor to add necessary columns

-- Add deleted_at and original_folder_id columns to files table
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS original_folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

-- Add deleted_at and original_parent_id columns to folders table
ALTER TABLE folders 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS original_parent_id UUID REFERENCES folders(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_files_deleted_at ON files(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_files_original_folder_id ON files(original_folder_id) WHERE original_folder_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_folders_deleted_at ON folders(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_folders_original_parent_id ON folders(original_parent_id) WHERE original_parent_id IS NOT NULL;

-- Success message
SELECT 'Recycle bin migration completed successfully!' AS message;

