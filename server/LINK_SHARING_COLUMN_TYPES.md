# Link Sharing Column Types Reference

## Required Columns for Link Sharing

Here are the correct column types that should exist in the `file_shares` table:

### 1. **shared_with**
- **Type**: `UUID`
- **Nullable**: `YES` (Must allow NULL for link shares)
- **Description**: User ID for user-based shares, NULL for link shares

### 2. **share_token**
- **Type**: `TEXT`
- **Nullable**: `YES`
- **Unique**: `YES` (UNIQUE constraint)
- **Description**: Unique token for accessing shared files via link

### 3. **link_enabled**
- **Type**: `BOOLEAN`
- **Default**: `false`
- **Nullable**: `NO`
- **Description**: Whether the link sharing is enabled

### 4. **expires_at**
- **Type**: `TIMESTAMP WITH TIME ZONE`
- **Nullable**: `YES`
- **Description**: Optional expiration date/time for the share link

### 5. **allow_download**
- **Type**: `BOOLEAN`
- **Default**: `true`
- **Nullable**: `NO`
- **Description**: Whether users can download the file via the link

### 6. **share_type**
- **Type**: `TEXT`
- **Default**: `'user'`
- **Nullable**: `NO`
- **Valid Values**: `'user'` or `'link'`
- **Description**: Type of share - either user-based or link-based

## Verification

Run the verification query in `verify_link_sharing_columns.sql` to check if all columns exist with correct types.

