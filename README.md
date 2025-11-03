# OneDrive Clone - Cloud Storage Solution

> A full-stack cloud storage application inspired by Microsoft OneDrive, built with React, Node.js, Express, and PostgreSQL (Supabase).

![Tech Stack](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

---

## 🚀 Quick Start - Docker Deployment (Recommended)

**Deploy the entire application with a single command using Docker!**

### Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "New folder"
   ```

2. **Configure environment**
   ```bash
   cp .env.docker.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - **Frontend**: http://localhost
   - **Backend API**: http://localhost:5001/api/health

**That's it!** The application will run persistently in the background with auto-restart on failures.

### 🎯 Demo Credentials

Use these credentials to test the application:

```
Email: test@gmail.com
Password: test123
```

**Note**: Create this test account after first deployment, or use the signup page to create a new account.

### Docker Images

This application is containerized with Docker for easy deployment:

- **Client Image**: React frontend served with Nginx
- **Server Image**: Node.js/Express backend
- **Persistent Storage**: Docker volumes for uploaded files
- **Auto-restart**: Containers automatically restart on failure
- **Health Checks**: Built-in health monitoring

**For detailed deployment instructions, see:**
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Complete deployment guide
- [HACKATHON_DEPLOYMENT.md](HACKATHON_DEPLOYMENT.md) - Quick start for teams

---

## Table of Contents

- [🚀 Quick Start - Docker Deployment](#-quick-start---docker-deployment-recommended)
- [🎯 Demo Credentials](#-demo-credentials)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Data Models](#data-models)
- [Setup Instructions](#setup-instructions)
  - [Docker Deployment](#docker-deployment-recommended-for-production)
  - [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [UI Architecture & State Management](#ui-architecture--state-management)
- [File Versioning & Synchronization](#file-versioning--synchronization)
- [Edge Cases Handled](#edge-cases-handled)
- [API Documentation](#api-documentation)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Functionality
- **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- **File Management** - Upload, download, rename, move, and delete files
- **Folder Organization** - Create nested folder structures with unlimited depth
- **Recycle Bin** - Soft delete with restore functionality for files and folders
- **Search & Filter** - Search by filename and filter by file type (Images, Documents, Videos, Office files)
- **Multi-View Support** - Switch between grid and list views
- **Storage Management** - Track storage usage with 5GB per user quota
- **Office Document Creation** - Create empty Word, Excel, PowerPoint, OneNote, and text documents

### User Interface
- **Microsoft Fluent UI** - Modern design system matching Microsoft 365 aesthetics
- **Responsive Design** - Mobile-friendly layout with adaptive sidebar
- **Theme Support** - Light, Dark, and System theme modes with persistence
- **Drag & Drop** - Intuitive file upload experience
- **Context Menus** - Right-click file operations
- **Breadcrumb Navigation** - Easy folder hierarchy navigation
- **Toast Notifications** - User feedback for all operations
- **File Preview** - Inline preview for supported file types
- **Details Panel** - Comprehensive file metadata display

### Advanced Features
- **Bulk Operations** - Select and delete multiple files/folders
- **Recent Files View** - Quick access to recently modified files across all folders
- **Folder Hierarchy** - Self-referencing folder structure for nested organization
- **MIME Type Detection** - Automatic file type categorization
- **Duplicate Name Prevention** - Smart file/folder renaming

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI library for component-based architecture |
| Vite | 5.0.0 | Fast build tool and dev server |
| React Router DOM | 6.20.0 | Client-side routing and navigation |
| Tailwind CSS | 3.4.18 | Utility-first CSS framework |
| Fluent UI React | 9.72.4 | Microsoft design system components |
| Supabase JS | 2.78.0 | Database client and API integration |
| PostCSS | 8.5.6 | CSS processing and transformation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest | JavaScript runtime environment |
| Express.js | 5.1.0 | Web application framework |
| Supabase | Cloud | PostgreSQL database and backend services |
| JWT | 9.0.2 | JSON Web Token authentication |
| bcryptjs | 3.0.2 | Password hashing and security |
| Multer | 2.0.2 | Multipart form data and file uploads |
| CORS | 2.8.5 | Cross-origin resource sharing |
| dotenv | 17.2.3 | Environment variable management |

### Database
- **PostgreSQL** (via Supabase Cloud)
- Row-level security (RLS) policies
- Indexed queries for performance
- Soft delete architecture

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   Pages      │  │  Components  │  │   Context API       │  │
│  │ - Dashboard  │  │ - FileGrid   │  │ - AuthContext       │  │
│  │ - Login      │  │ - Sidebar    │  │ - ThemeContext      │  │
│  │ - Photos     │  │ - FilePanel  │  │ - ToastContext      │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Custom Hooks (useFileManager)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                       HTTP/REST API
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    SERVER (Express.js)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   Routes     │  │ Controllers  │  │   Middleware        │  │
│  │ - auth       │  │ - auth       │  │ - authenticate      │  │
│  │ - files      │  │ - file       │  │ - multer            │  │
│  │ - folders    │  │ - folder     │  │ - error handler     │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase SDK Client                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                   DATABASE (PostgreSQL)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  users   │  │  files   │  │ folders  │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    FILE SYSTEM (Disk)                           │
│                    /server/uploads/                             │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
1. User Action (Upload File)
   └─> React Component (FileGrid)
       └─> useFileManager Hook
           └─> HTTP POST /api/files/upload
               └─> Express Route Handler
                   └─> Multer Middleware (saves to disk)
                       └─> File Controller
                           └─> Supabase Insert (metadata)
                               └─> Response to Client
                                   └─> Update React State
                                       └─> Re-render UI
```

### Folder Structure

```
onedrive-clone/
├── client/                    # Frontend React application
│   ├── public/
│   │   └── images/           # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── CommandBar.jsx
│   │   │   ├── FileContextMenu.jsx
│   │   │   ├── FileDetailsPanel.jsx
│   │   │   ├── FileGrid.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/          # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useFileManager.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Photos.jsx
│   │   │   ├── Albums.jsx
│   │   │   ├── Moments.jsx
│   │   │   └── Favorites.jsx
│   │   ├── config/
│   │   │   └── api.js        # API configuration
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Backend Node.js/Express
│   ├── config/
│   │   └── database.js       # Supabase configuration
│   ├── controllers/          # Business logic
│   │   ├── auth.controller.js
│   │   ├── file.controller.js
│   │   └── folder.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── routes/               # API routes
│   │   ├── auth.routes.js
│   │   ├── file.routes.js
│   │   └── folder.routes.js
│   ├── uploads/              # File storage directory
│   ├── templates/            # Office document templates
│   ├── server.js             # Express app setup
│   ├── supabase_schema.sql   # Database schema
│   ├── recycle_bin_migration.sql
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## Data Models

### Entity Relationship Diagram

```
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id (UUID, PK)       │
│ name (TEXT)         │
│ email (TEXT, UNIQUE)│
│ password (TEXT)     │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │
           │ 1:N
           │
    ┌──────┴───────┬────────────────────┐
    │              │                    │
    ▼              ▼                    │
┌────────────┐  ┌──────────────────┐   │
│  folders   │  │     files        │   │
├────────────┤  ├──────────────────┤   │
│ id (PK)    │◄─┤ id (PK)          │   │
│ name       │  │ name             │   │
│ user_id(FK)│  │ type (MIME)      │   │
│ parent_id  │  │ size (BIGINT)    │   │
│ deleted_at │  │ path (TEXT)      │   │
│ original_  │  │ user_id (FK)     │───┘
│  parent_id │  │ folder_id (FK)   │
│ created_at │  │ deleted_at       │
│ updated_at │  │ original_folder  │
└─────┬──────┘  │ created_at       │
      │         │ updated_at       │
      │ 1:N     └──────────────────┘
      │
      └─────┐ (self-referencing)
            │
            ▼
       (nested folders)
```

### Users Table

**Purpose**: Stores user authentication and profile information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| name | TEXT | NOT NULL | User's display name |
| email | TEXT | UNIQUE, NOT NULL | Login email (unique) |
| password | TEXT | NOT NULL | bcrypt hashed password |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_users_email` on `email` (for fast login queries)

---

### Files Table

**Purpose**: Stores file metadata and location information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique file identifier |
| name | TEXT | NOT NULL | Original filename |
| type | TEXT | NOT NULL | MIME type (e.g., 'image/png') |
| size | BIGINT | NOT NULL | File size in bytes |
| path | TEXT | NOT NULL | File system path on server |
| user_id | UUID | FOREIGN KEY → users(id) | File owner |
| folder_id | UUID | FOREIGN KEY → folders(id), NULLABLE | Parent folder (NULL = root) |
| deleted_at | TIMESTAMP | NULLABLE | Soft delete timestamp |
| original_folder_id | UUID | NULLABLE | Original location for restore |
| created_at | TIMESTAMP | DEFAULT NOW() | Upload timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last modification timestamp |

**Indexes**:
- `idx_files_user_id` on `user_id` (user's files)
- `idx_files_folder_id` on `folder_id` (folder contents)
- `idx_files_deleted_at` on `deleted_at WHERE deleted_at IS NOT NULL` (recycle bin)

**Constraints**:
- `CHECK (deleted_at IS NULL OR folder_id IS NULL)` - Deleted files cleared from folders
- `ON DELETE CASCADE` for user_id - Delete user's files when user deleted

---

### Folders Table

**Purpose**: Stores folder hierarchy with self-referencing structure

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique folder identifier |
| name | TEXT | NOT NULL | Folder name |
| user_id | UUID | FOREIGN KEY → users(id) | Folder owner |
| parent_id | UUID | FOREIGN KEY → folders(id), NULLABLE | Parent folder (NULL = root) |
| deleted_at | TIMESTAMP | NULLABLE | Soft delete timestamp |
| original_parent_id | UUID | NULLABLE | Original parent for restore |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last modification timestamp |

**Indexes**:
- `idx_folders_user_id` on `user_id` (user's folders)
- `idx_folders_parent_id` on `parent_id` (folder hierarchy)
- `idx_folders_deleted_at` on `deleted_at WHERE deleted_at IS NOT NULL` (recycle bin)

**Constraints**:
- Self-referencing foreign key allows unlimited nesting
- `ON DELETE CASCADE` for user_id - Delete user's folders when user deleted

---

### Data Relationships

1. **One-to-Many**: `users` → `files`
   - One user owns many files
   - Cascade delete: Deleting user deletes all their files

2. **One-to-Many**: `users` → `folders`
   - One user owns many folders
   - Cascade delete: Deleting user deletes all their folders

3. **One-to-Many**: `folders` → `files`
   - One folder contains many files
   - Nullable: Files can exist at root level (folder_id = NULL)

4. **Self-Referencing**: `folders` → `folders`
   - Folders can contain sub-folders (parent_id)
   - Unlimited depth nesting supported
   - Nullable: Root folders have parent_id = NULL

5. **Soft Delete Tracking**:
   - `original_folder_id` in files → original location before deletion
   - `original_parent_id` in folders → original parent before deletion

---

### Row-Level Security (RLS) Policies

**Users can only access their own data**:

```sql
-- Files RLS Policy
CREATE POLICY "Users can only access their own files"
  ON files
  FOR ALL
  USING (user_id = auth.uid());

-- Folders RLS Policy
CREATE POLICY "Users can only access their own folders"
  ON folders
  FOR ALL
  USING (user_id = auth.uid());
```

---

## Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Git** - Version control
- **Supabase Account** - [Sign up](https://supabase.com/)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/onedrive-clone.git
cd onedrive-clone
```

#### 2. Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com/)
2. Navigate to SQL Editor in your Supabase dashboard
3. Run the schema files in order:

```bash
# Copy the contents of these files and execute in Supabase SQL Editor
# 1. First, run the main schema
server/supabase_schema.sql

# 2. Then, run the recycle bin migration
server/recycle_bin_migration.sql
```

4. Copy your Supabase URL and Anon Key from Project Settings → API

#### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

**Configure your `.env` file**:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=52428800  # 50MB in bytes
UPLOAD_DIR=./uploads

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Create uploads directory**:

```bash
mkdir uploads
```

**Start the backend server**:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5001`

#### 4. Frontend Setup

```bash
# Navigate to client directory (from root)
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Configure your client `.env` file**:

```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_APP_NAME=OneDrive Clone
VITE_APP_VERSION=1.0.0
```

**Start the frontend development server**:

```bash
npm run dev
```

The app will run on `http://localhost:5173`

#### 5. Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Create a new account using the Signup page
3. Login with your credentials
4. Start uploading and organizing files!

---

### Production Build

#### Backend Production

```bash
cd server
npm install --production
npm start
```

#### Frontend Production

```bash
cd client

# Build for production
npm run build

# The build output will be in the 'dist' folder
# Serve with any static file server (nginx, Apache, Vercel, Netlify, etc.)
```

---

### Docker Deployment (Recommended for Production)

**Quick deployment with Docker Compose - perfect for hackathons and production!**

#### Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

#### Quick Start

1. **Configure Environment**

```bash
# Copy environment template
cp .env.docker.example .env

# Edit with your Supabase credentials
# Required: SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET
```

2. **Start Application (Persistent Mode)**

```bash
# Build and start in background
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

3. **Access Application**

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5001/api/health

**That's it!** The application will:
- ✅ Run in the background (close terminal anytime)
- ✅ Auto-restart on crashes
- ✅ Auto-start when Docker Desktop opens
- ✅ Persist uploaded files in Docker volumes

#### Common Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Restart application
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build

# Check container health
curl http://localhost:5001/api/health
```

#### Architecture

```
┌─────────────┐       ┌──────────────┐
│   Client    │◄─────►│   Server     │
│  (Port 80)  │       │  (Port 5001) │
│   Nginx     │       │   Node.js    │
└─────────────┘       └──────────────┘
                             │
                      ┌──────▼───────┐
                      │   Supabase   │
                      │  PostgreSQL  │
                      └──────────────┘
```

**For detailed deployment guide, troubleshooting, and production setup:**
- See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Complete deployment guide
- See [HACKATHON_DEPLOYMENT.md](HACKATHON_DEPLOYMENT.md) - Quick start for teams

---

## Environment Variables

### Server Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5001 | Server port number |
| `NODE_ENV` | No | development | Environment (development/production) |
| `SUPABASE_URL` | **Yes** | - | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | **Yes** | - | Supabase anonymous key |
| `JWT_SECRET` | **Yes** | - | Secret key for JWT signing (use strong random string) |
| `JWT_EXPIRE` | No | 7d | JWT token expiration (e.g., '1h', '7d', '30d') |
| `MAX_FILE_SIZE` | No | 52428800 | Max file upload size in bytes (default 50MB) |
| `UPLOAD_DIR` | No | ./uploads | Directory for file storage |
| `FRONTEND_URL` | No | http://localhost:5173 | Frontend URL for CORS |

### Client Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | **Yes** | - | Backend API base URL |
| `VITE_APP_NAME` | No | OneDrive Clone | Application name |
| `VITE_APP_VERSION` | No | 1.0.0 | Application version |

---

## UI Architecture & State Management

### State Management Strategy

This application uses **React Context API** for global state management instead of Redux, providing a simpler yet powerful solution for this use case.

#### Context Providers

```
App Component
  └── ThemeProvider
      └── ToastProvider
          └── AuthProvider
              └── Routes
```

---

### 1. AuthContext

**Purpose**: Manages authentication state and user session

**State**:
- `user` - Current user object (id, name, email)
- `token` - JWT authentication token
- `loading` - Loading state for auth operations

**Methods**:
- `login(email, password)` - Authenticate user and store token
- `signup(name, email, password)` - Create new user account
- `logout()` - Clear session and redirect to login
- `getToken()` - Retrieve current JWT token

**Persistence**:
- Stores user data in `localStorage` under key `user`
- Stores token in `localStorage` under key `token`
- Auto-restores session on app mount

**Usage**:
```javascript
const { user, login, logout, getToken } = useAuth();
```

---

### 2. ThemeContext

**Purpose**: Manages application theme (Light/Dark/System)

**State**:
- `theme` - Current theme ('light' | 'dark' | 'system')

**Methods**:
- `changeTheme(newTheme)` - Update theme preference

**Features**:
- Persists preference in `localStorage`
- Listens to system theme changes
- Applies CSS classes to `document.body`
- System theme uses `window.matchMedia('(prefers-color-scheme: dark)')`

**Usage**:
```javascript
const { theme, changeTheme } = useTheme();
```

---

### 3. ToastContext

**Purpose**: Manages notification toasts for user feedback

**State**:
- `toasts` - Array of active toast notifications

**Methods**:
- `showToast(message, type, duration)` - Show toast
- `success(message)` - Success notification
- `error(message)` - Error notification
- `warning(message)` - Warning notification
- `info(message)` - Info notification

**Features**:
- Auto-dismiss after duration (default 3 seconds)
- Multiple toasts support
- Type-based styling (success, error, warning, info)
- Unique ID for each toast

**Usage**:
```javascript
const toast = useToast();
toast.success('File uploaded successfully!');
toast.error('Failed to delete folder');
```

---

### Custom Hooks

#### useFileManager

**Purpose**: Comprehensive file and folder operations management

**State Managed**:
- `files` - Array of files in current folder
- `folders` - Array of all user folders
- `currentFolder` - Currently viewing folder
- `storageUsed` - Total storage consumed
- `storageLimit` - User storage quota (5GB)
- `breadcrumbs` - Folder path for navigation
- `recycleBin` - Deleted items

**Key Methods**:

**File Operations**:
- `uploadFile(file, folderId)` - Upload file to server
- `downloadFile(fileId, fileName)` - Download file
- `renameFile(fileId, newName)` - Rename file
- `moveFile(fileId, newFolderId)` - Move file to folder
- `deleteFile(fileId)` - Soft delete file
- `previewFile(fileId)` - Get file preview URL

**Folder Operations**:
- `createFolder(name, parentId)` - Create new folder
- `renameFolder(folderId, newName)` - Rename folder
- `deleteFolder(folderId)` - Soft delete folder (recursive)
- `navigateToFolder(folderId)` - Change current folder

**Recycle Bin Operations**:
- `getRecycleBin()` - Fetch deleted items
- `restoreItem(itemId, isFolder)` - Restore from recycle bin
- `permanentDelete(itemId, isFolder)` - Permanently delete

**Utility Functions**:
- `nameToSlug(name)` - Convert folder name to URL-safe slug
- `findFolderBySlug(slug)` - Find folder by slug for routing
- `buildBreadcrumbs(folderId)` - Generate breadcrumb path

**Data Fetching**:
- Uses Supabase SDK for database operations
- Automatic state updates on CRUD operations
- Error handling with toast notifications

**Usage**:
```javascript
const {
  files,
  folders,
  uploadFile,
  createFolder,
  deleteFile
} = useFileManager();
```

---

### Component State Management

#### Dashboard Component

**Local State**:
- `view` - 'grid' or 'list' view mode
- `searchQuery` - File search input
- `filterType` - File type filter ('all', 'images', 'documents', etc.)
- `selectedItems` - Array of selected file/folder IDs
- `previewFile` - Currently previewing file
- `showCreateFolder` - Create folder modal visibility
- `showRename` - Rename modal visibility
- `sortBy` - Sort preference ('name', 'date', 'size', 'type')
- `sortOrder` - 'asc' or 'desc'

**Derived State**:
- `filteredFiles` - Files after search and filter applied
- `sortedFiles` - Files after sorting applied

---

### Data Flow Architecture

```
User Action (e.g., Upload File)
    │
    ▼
Component Event Handler (onClick, onChange)
    │
    ▼
useFileManager Hook Method
    │
    ▼
API Call (fetch/axios)
    │
    ▼
Backend Controller
    │
    ▼
Database Update (Supabase)
    │
    ▼
Response to Frontend
    │
    ▼
Update Hook State
    │
    ▼
React Re-render (useEffect triggers)
    │
    ▼
UI Updates
```

---

### Performance Optimizations

1. **Context Splitting**
   - Separate contexts for different concerns (Auth, Theme, Toast)
   - Prevents unnecessary re-renders

2. **Local State First**
   - Component-specific state kept local
   - Only shared state in Context

3. **useEffect Dependencies**
   - Careful dependency arrays to prevent infinite loops
   - Memoized callbacks where needed

4. **Lazy Loading**
   - React.lazy() for code splitting (ready for future implementation)

---

## File Versioning & Synchronization

### Current Implementation

#### Soft Delete System

The application implements a **soft delete** architecture for file recovery:

**How it works**:
1. When user deletes file/folder:
   - `deleted_at` timestamp is set to current time
   - `original_folder_id` (for files) or `original_parent_id` (for folders) stores original location
   - `folder_id` is set to NULL (removes from current folder)

2. Recycle Bin Query:
   ```sql
   SELECT * FROM files WHERE deleted_at IS NOT NULL AND user_id = $1
   ```

3. Restore Operation:
   - Restores `folder_id` to `original_folder_id`
   - Sets `deleted_at` to NULL
   - Item reappears in original location

4. Permanent Delete:
   - Removes database record
   - Deletes physical file from disk

**Benefits**:
- User can recover accidentally deleted files
- 30-day retention before auto-purge (future feature)
- Maintains data integrity

---

### Timestamp Tracking

Every file and folder has:
- `created_at` - Original upload/creation time
- `updated_at` - Last modification time
- `deleted_at` - Deletion time (NULL if active)

**Usage**:
- Sort files by "Date Modified"
- Show "Recent Files" view
- Track file lifecycle
- Audit trail for future compliance

---

### Synchronization Approach

**Current**: Single-source-of-truth database with client-side state management

**Flow**:
1. User performs action (upload, rename, delete)
2. Optimistic UI update (instant feedback)
3. API request to server
4. Database update
5. Response confirms/rejects
6. UI reconciles with server state

**Edge Case Handling**:
- Network failures: Retry logic with exponential backoff (future)
- Concurrent updates: Last-write-wins strategy
- Stale data: Refresh on page focus (future)

---

### Future Versioning Plans

#### 1. File Version History

**Proposed Schema Addition**:
```sql
CREATE TABLE file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  path TEXT NOT NULL,
  size BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  UNIQUE(file_id, version_number)
);
```

**Features**:
- Keep last 10 versions per file
- User can restore previous version
- Compare versions side-by-side
- Version diff for text files

#### 2. Real-time Synchronization

**Proposed Technologies**:
- **WebSockets** (Socket.io) for real-time updates
- **Supabase Realtime** for database change subscriptions
- **Service Workers** for offline support

**Features**:
- Multi-device sync
- Offline mode with local storage
- Conflict resolution (operational transformation)
- Real-time collaboration indicators

#### 3. Conflict Resolution

**Strategies**:
- **Automatic**: Last-write-wins for simple updates
- **Manual**: Prompt user for complex conflicts
- **Version branching**: Keep both versions with rename

---

## Edge Cases Handled

### 1. Duplicate File Names

**Scenario**: User uploads file with name that already exists in folder

**Solution**:
- Backend checks for existing filename in target folder
- If exists, appends counter: `document.pdf` → `document (1).pdf`
- Incremental numbering: `document (2).pdf`, `document (3).pdf`, etc.

**Code Location**: [server/controllers/file.controller.js](server/controllers/file.controller.js)

---

### 2. Duplicate Folder Names

**Scenario**: User creates folder with name that already exists

**Solution**:
- Frontend checks existing folder names before creation
- Shows error toast: "Folder already exists"
- Prevents creation of duplicate

**Code Location**: [client/src/hooks/useFileManager.jsx](client/src/hooks/useFileManager.jsx)

---

### 3. Deleted Shared Folders

**Scenario**: Folder is deleted that was shared with other users (future feature)

**Current Handling**:
- Soft delete preserves data
- Can be restored from recycle bin

**Future Implementation**:
- Notify shared users of deletion
- Move shared files to "Removed Shared Items" folder
- Owner can revoke deletion within retention period
- Shared users retain read-only access for 30 days

---

### 4. Upload Conflicts

**Scenario**: Two files uploaded simultaneously with same name

**Solution**:
- Multer generates unique server-side filename: `timestamp-randomId-originalname.ext`
- Database stores both original name and unique path
- No server-side conflict possible
- Client-side conflict handled by duplicate name logic

---

### 5. Large File Uploads

**Scenario**: User uploads file exceeding size limit

**Solution**:
- Multer middleware enforces `MAX_FILE_SIZE` (50MB default)
- Returns 400 error if exceeded
- Frontend shows clear error message
- Future: Chunked upload for files > 100MB

---

### 6. Nested Folder Deletion

**Scenario**: User deletes folder containing sub-folders and files

**Solution**:
- Backend implements recursive soft delete
- Marks parent folder as deleted
- Marks all children folders as deleted
- Marks all files in folder tree as deleted
- Preserves hierarchy for restore operation
- Single restore call recovers entire tree

**Code Location**: [server/controllers/folder.controller.js](server/controllers/folder.controller.js)

---

### 7. Network Failures During Upload

**Scenario**: Network interruption mid-upload

**Current**:
- Upload fails with error toast
- User must retry manually

**Future Enhancement**:
- Resumable uploads using tus protocol
- Auto-retry with exponential backoff
- Upload queue management

---

### 8. Session Expiration

**Scenario**: JWT token expires while user is active

**Solution**:
- JWT expiration set to 7 days
- 401 response triggers automatic logout
- User redirected to login page
- Auth context clears session

**Future Enhancement**:
- Refresh token rotation
- Silent token renewal
- Session extension on activity

---

### 9. SQL Injection Prevention

**Solution**:
- All queries use parameterized statements (Supabase SDK)
- Input validation on all endpoints
- No raw SQL string concatenation

---

### 10. XSS Prevention

**Solution**:
- React auto-escapes all rendered content
- No `dangerouslySetInnerHTML` usage
- CSP headers (future)

---

### 11. Path Traversal Attacks

**Scenario**: Malicious user tries to access files outside uploads directory

**Solution**:
- File downloads validate file ownership (user_id check)
- Path stored in database, not user input
- No direct path manipulation allowed
- JWT authentication required for all file operations

---

### 12. Storage Quota Exceeded

**Scenario**: User tries to upload file when storage full

**Current**:
- Frontend shows storage usage
- Warning at 90% capacity

**Future**:
- Backend enforces hard limit
- Returns 413 Payload Too Large
- Option to upgrade storage

---

### 13. Concurrent Renames

**Scenario**: Same file renamed from two devices simultaneously

**Solution**:
- Last-write-wins strategy
- Database update timestamp determines winner
- Loser receives error on response
- Can retry with new name

---

### 14. File System Permissions

**Scenario**: Server lacks permission to write to uploads directory

**Solution**:
- Startup check verifies write permissions
- Multer errors caught and returned as 500
- Clear error message to user
- Logged for admin investigation

---

### 15. Empty Recycle Bin

**Scenario**: User permanently deletes all items in recycle bin

**Solution**:
- Confirmation dialog before action
- Bulk delete operation
- Irreversible warning shown
- Physical files removed from disk

---

## API Documentation

### Base URL

```
Development: http://localhost:5001/api
Production: https://your-domain.com/api
```

### Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

### Authentication Endpoints

#### POST `/auth/signup`

Create a new user account.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

#### POST `/auth/login`

Authenticate user and receive JWT token.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors**:
- 401: Invalid credentials
- 404: User not found

---

#### GET `/auth/profile`

Get current user profile (protected).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "id": "uuid-here",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### File Endpoints

#### GET `/files`

Get all user files (optionally filtered by folder).

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `folderId` (optional) - Filter by folder UUID

**Response** (200 OK):
```json
{
  "files": [
    {
      "id": "file-uuid",
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 1048576,
      "path": "uploads/1234567890-abc-document.pdf",
      "folder_id": "folder-uuid",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### POST `/files/upload`

Upload a file (multipart/form-data).

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data**:
- `file` (File) - The file to upload
- `folderId` (String, optional) - Target folder UUID

**Response** (201 Created):
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": "file-uuid",
    "name": "document.pdf",
    "type": "application/pdf",
    "size": 1048576,
    "path": "uploads/1234567890-abc-document.pdf",
    "folder_id": "folder-uuid",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors**:
- 400: No file provided or file too large
- 413: File exceeds size limit

---

#### POST `/files/create`

Create empty office document.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "New Document",
  "type": "word",
  "folderId": "folder-uuid"
}
```

**Supported Types**: `word`, `excel`, `powerpoint`, `onenote`, `text`

**Response** (201 Created):
```json
{
  "message": "File created successfully",
  "file": {
    "id": "file-uuid",
    "name": "New Document.docx",
    "type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "size": 5432,
    "path": "uploads/1234567890-abc-New-Document.docx"
  }
}
```

---

#### GET `/files/:id/download`

Download a file.

**Headers**: `Authorization: Bearer <token>`

**Response**: File stream with headers:
```
Content-Type: <file-mime-type>
Content-Disposition: attachment; filename="<original-filename>"
```

**Errors**:
- 404: File not found
- 403: Unauthorized access

---

#### GET `/files/:id/preview`

Preview file inline (in browser).

**Headers**: `Authorization: Bearer <token>`

**Response**: File stream with headers:
```
Content-Type: <file-mime-type>
Content-Disposition: inline
```

---

#### PATCH `/files/:id/rename`

Rename a file.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "newName": "Updated Document.pdf"
}
```

**Response** (200 OK):
```json
{
  "message": "File renamed successfully",
  "file": {
    "id": "file-uuid",
    "name": "Updated Document.pdf",
    "updated_at": "2024-01-15T11:30:00Z"
  }
}
```

---

#### PATCH `/files/:id/move`

Move file to different folder.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "folderId": "target-folder-uuid"
}
```

**Response** (200 OK):
```json
{
  "message": "File moved successfully",
  "file": {
    "id": "file-uuid",
    "folder_id": "target-folder-uuid",
    "updated_at": "2024-01-15T11:30:00Z"
  }
}
```

---

#### DELETE `/files/:id`

Soft delete file (move to recycle bin).

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "message": "File deleted successfully"
}
```

---

#### GET `/files/recycle-bin`

Get all deleted items (files and folders).

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "file-uuid",
      "name": "document.pdf",
      "type": "file",
      "size": 1048576,
      "deleted_at": "2024-01-15T10:30:00Z",
      "original_folder_id": "folder-uuid"
    },
    {
      "id": "folder-uuid",
      "name": "Old Folder",
      "type": "folder",
      "deleted_at": "2024-01-14T09:00:00Z",
      "original_parent_id": null
    }
  ]
}
```

---

#### POST `/files/restore/:id`

Restore item from recycle bin.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `type` - 'file' or 'folder'

**Response** (200 OK):
```json
{
  "message": "Item restored successfully"
}
```

---

### Folder Endpoints

#### POST `/folders`

Create a new folder.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "My Folder",
  "parentId": "parent-folder-uuid"
}
```

**Response** (201 Created):
```json
{
  "message": "Folder created successfully",
  "folder": {
    "id": "folder-uuid",
    "name": "My Folder",
    "parent_id": "parent-folder-uuid",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors**:
- 400: Folder name already exists

---

#### GET `/folders`

Get all user folders.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "folders": [
    {
      "id": "folder-uuid",
      "name": "My Folder",
      "parent_id": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### GET `/folders/hierarchy`

Get folder tree with nested structure.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "folders": [
    {
      "id": "root-folder-uuid",
      "name": "Documents",
      "parent_id": null,
      "children": [
        {
          "id": "child-folder-uuid",
          "name": "Work",
          "parent_id": "root-folder-uuid",
          "children": []
        }
      ]
    }
  ]
}
```

---

#### GET `/folders/:id/files`

Get all files in a specific folder.

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "files": [
    {
      "id": "file-uuid",
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 1048576,
      "folder_id": "folder-uuid",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### PATCH `/folders/:id/rename`

Rename a folder.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "newName": "Updated Folder Name"
}
```

**Response** (200 OK):
```json
{
  "message": "Folder renamed successfully",
  "folder": {
    "id": "folder-uuid",
    "name": "Updated Folder Name",
    "updated_at": "2024-01-15T11:30:00Z"
  }
}
```

---

#### DELETE `/folders/:id`

Soft delete folder (recursive).

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "message": "Folder deleted successfully"
}
```

**Note**: Deletes all sub-folders and files recursively.

---

### Error Response Format

All errors follow this format:

```json
{
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

**Common Status Codes**:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 413: Payload Too Large
- 500: Internal Server Error

---

## Future Improvements

### 1. Office 365 Integration

**Goal**: Enable real-time editing of Office documents

**Implementation**:
- Integrate Microsoft Graph API for document editing
- OAuth 2.0 authentication with Microsoft accounts
- Embed Office Online viewers/editors
- Auto-save to OneDrive Clone storage

**Benefits**:
- Edit Word, Excel, PowerPoint in browser
- No local Office installation required
- Seamless Microsoft ecosystem integration

**Estimated Effort**: 3-4 weeks

---

### 2. Live Document Co-Editing

**Goal**: Allow multiple users to edit documents simultaneously

**Technologies**:
- **Operational Transformation (OT)** or **CRDT** for conflict-free editing
- **WebSockets** (Socket.io) for real-time sync
- **Yjs** library for collaborative editing
- **Monaco Editor** for code files

**Features**:
- Real-time cursor positions
- User presence indicators
- Change tracking
- Comment threads

**Estimated Effort**: 4-6 weeks

---

### 3. AI File Organization

**Goal**: Automatically organize files using machine learning

**Features**:
- **Smart Folders**: Auto-categorize files by content
- **Tag Suggestions**: AI-powered tagging (work, personal, receipts, etc.)
- **Duplicate Detection**: Find and merge duplicate files
- **OCR**: Extract text from images and PDFs for search
- **Smart Search**: Natural language queries ("find contracts from last month")

**Technologies**:
- **TensorFlow.js** or **ML Kit** for client-side ML
- **OpenAI API** for semantic understanding
- **Tesseract.js** for OCR

**Estimated Effort**: 6-8 weeks

---

### 4. File Sharing & Permissions

**Goal**: Share files/folders with other users

**Features**:
- Share via email or link
- Permission levels (view, edit, comment)
- Expiring share links
- Password-protected shares
- Public vs. private sharing

**Database Changes**:
```sql
CREATE TABLE shares (
  id UUID PRIMARY KEY,
  file_id UUID REFERENCES files(id),
  folder_id UUID REFERENCES folders(id),
  shared_by UUID REFERENCES users(id),
  shared_with UUID REFERENCES users(id),
  permission VARCHAR(10), -- 'view', 'edit', 'comment'
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);
```

**Estimated Effort**: 2-3 weeks

---

### 5. File Versioning

**Goal**: Keep version history of file changes

**Features**:
- Automatic version creation on update
- Manual version snapshots
- Compare versions side-by-side
- Restore previous version
- Version retention policy (keep last 10)

**Database Changes**:
```sql
CREATE TABLE file_versions (
  id UUID PRIMARY KEY,
  file_id UUID REFERENCES files(id),
  version_number INTEGER,
  path TEXT,
  size BIGINT,
  created_at TIMESTAMP,
  created_by UUID REFERENCES users(id)
);
```

**Estimated Effort**: 2-3 weeks

---

### 6. Advanced Search

**Goal**: Full-text search across all files

**Features**:
- Search file contents (PDFs, DOCX, TXT)
- Filter by date range, size, type
- Saved searches
- Search within folders
- Regular expression support

**Technologies**:
- **Elasticsearch** or **Algolia** for indexing
- **Apache Tika** for content extraction

**Estimated Effort**: 3-4 weeks

---

### 7. Mobile Apps

**Goal**: Native iOS and Android applications

**Technologies**:
- **React Native** for cross-platform development
- **Expo** for rapid development
- Native file pickers and camera integration
- Offline mode with sync

**Features**:
- Upload photos from camera
- Offline file access
- Biometric authentication
- Push notifications

**Estimated Effort**: 8-12 weeks

---

### 8. File Encryption

**Goal**: End-to-end encryption for sensitive files

**Features**:
- Client-side encryption before upload
- Zero-knowledge architecture
- User-controlled encryption keys
- Encrypted sharing

**Technologies**:
- **Web Crypto API** for encryption
- **AES-256-GCM** encryption standard

**Estimated Effort**: 3-4 weeks

---

### 9. Media Gallery & Photos

**Goal**: Enhanced photo/video management

**Features**:
- **Auto-organization**: By date, location, people
- **Albums**: Manual and automatic (e.g., "Summer 2024")
- **Memories**: Auto-generated photo collections
- **Photo Editing**: Crop, rotate, filters
- **Face Recognition**: Group photos by people
- **EXIF Data**: Display camera settings, location

**Technologies**:
- **Sharp** for image processing
- **ffmpeg** for video thumbnails
- **TensorFlow.js** for face detection

**Estimated Effort**: 4-6 weeks

---

### 10. Cloud Storage Integration

**Goal**: Migrate from local disk to cloud storage

**Benefits**:
- Scalability and redundancy
- CDN for faster downloads
- Lower server storage costs

**Technologies**:
- **AWS S3** or **Azure Blob Storage**
- **Cloudflare R2** (no egress fees)
- Presigned URLs for direct uploads

**Estimated Effort**: 2-3 weeks

---

### 11. Activity & Audit Logs

**Goal**: Track all file operations for security

**Features**:
- View activity timeline
- Filter by user, action, date
- Export logs for compliance
- Suspicious activity alerts

**Database**:
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(50),
  resource_type VARCHAR(20),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP
);
```

**Estimated Effort**: 1-2 weeks

---

### 12. Notifications System

**Goal**: Real-time notifications for file events

**Notifications**:
- File shared with you
- Comment on your file
- Storage quota warning
- Recycle bin auto-purge reminder

**Technologies**:
- **Web Push API** for browser notifications
- **Email notifications** (SendGrid, AWS SES)
- **In-app notification center**

**Estimated Effort**: 2-3 weeks

---

### 13. Favorites & Quick Access

**Goal**: Pin frequently used files/folders

**Features**:
- Star/favorite files
- Quick access sidebar
- Recent files section
- Suggested files (AI-based)

**Estimated Effort**: 1 week

---

### 14. Trash Auto-Purge

**Goal**: Automatically delete old recycle bin items

**Features**:
- Configurable retention period (default 30 days)
- Warning email before purge
- Manual purge option
- Restore before purge deadline

**Implementation**:
- Cron job runs daily
- Checks `deleted_at` timestamp
- Permanently deletes old items

**Estimated Effort**: 1 week

---

### 15. Admin Dashboard

**Goal**: Analytics and user management for admins

**Features**:
- User statistics (total users, active users)
- Storage usage analytics
- File type distribution charts
- User activity monitoring
- Ban/suspend users

**Technologies**:
- **Chart.js** or **Recharts** for visualizations

**Estimated Effort**: 2-3 weeks

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update README for new features
- Test thoroughly before PR

---

## Acknowledgments

- **Microsoft Fluent UI** for design components
- **Supabase** for backend infrastructure
- **React Team** for the amazing framework
- **Vite** for blazing fast builds
- All open-source contributors

---

## Project Status

**Current Version**: 1.0.0
**Status**: Beta - Ready for Hackathon Demo
**Last Updated**: January 2025

---

<div align="center">

**Built with ❤️ for the Cloud Storage Revolution**

[⬆ Back to Top](#onedrive-clone---cloud-storage-solution)

</div>
