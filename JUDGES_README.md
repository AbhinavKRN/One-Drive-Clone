# OneDrive Clone - Quick Demo Setup for Judges

> A full-stack cloud storage application inspired by Microsoft OneDrive

## 🎯 Demo Credentials

**Use these credentials to test the application:**

```
Email: test@gmail.com
Password: test123
```

**Note**: If this account doesn't exist yet, please create it using the signup page with the above credentials.

---

## 🚀 One-Command Setup with Docker

### Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "New folder"
   ```

2. **Create environment file**
   ```bash
   cp .env.docker.example .env
   ```

3. **Edit .env with Supabase credentials** (provided separately)
   ```env
   SUPABASE_URL=<provided-by-team>
   SUPABASE_ANON_KEY=<provided-by-team>
   JWT_SECRET=<provided-by-team>
   ```

4. **Start the application** (Choose one method)

   **Option A: Using Pre-built Docker Hub Images (Recommended - Fastest)**
   ```bash
   docker-compose -f docker-compose.hub.yml up -d
   ```
   This pulls pre-built images from Docker Hub - no build time required!

   **Option B: Build from Source**
   ```bash
   docker-compose up -d
   ```
   This builds images locally from source code.

5. **Access the application**
   - Open browser: **http://localhost**
   - Login with demo credentials above

**That's it!** 🎉

---

## 🐳 Docker Hub Images

### Pre-built Images Available

**Docker Hub Repository:** [`nara13134`](https://hub.docker.com/u/nara13134)

**Images:**
- **Client**: `nara13134/onedrive-client:latest` (86.2 MB)
  - React frontend built with Vite
  - Served with Nginx Alpine
  - Multi-stage build for optimization
  
- **Server**: `nara13134/onedrive-server:latest` (232 MB)
  - Node.js 18 Alpine runtime
  - Express.js backend
  - Built-in health checks

### Benefits of Using Docker Hub Images

✅ **Fast Setup** - No build time, images pull in seconds  
✅ **Consistent** - Same images tested and verified  
✅ **Reliable** - Pre-built and optimized  
✅ **Professional** - Production-ready images  

### Image Verification

All Docker Hub images are verified to match the source code:
- Image IDs verified against local builds
- Images tested and working correctly
- Size optimized with multi-stage builds

---

## ✨ Key Features to Test

### User Authentication
- ✅ Secure JWT-based authentication
- ✅ Password hashing with bcrypt

### File Management
- ✅ Upload files (drag & drop supported)
- ✅ Download files
- ✅ Rename files
- ✅ Delete files (moves to recycle bin)
- ✅ Restore from recycle bin

### Folder Organization
- ✅ Create nested folders
- ✅ Move files between folders
- ✅ Folder breadcrumb navigation
- ✅ Unlimited folder depth

### Search & Filter
- ✅ Search files by name
- ✅ Filter by file type (Images, Documents, Videos, Office files)
- ✅ View recent files

### User Interface
- ✅ Grid and List view modes
- ✅ Light/Dark/System themes
- ✅ Microsoft Fluent UI design
- ✅ Responsive mobile-friendly layout
- ✅ Context menus (right-click)

### Advanced Features
- ✅ Bulk file operations
- ✅ File preview
- ✅ Storage quota tracking (5GB per user)
- ✅ Create empty Office documents (Word, Excel, PowerPoint)
- ✅ Real-time file metadata display

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18.2 + Vite + FluentUI + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Server file system with Docker volumes
- **Authentication**: JWT tokens
- **Containerization**: Docker + Docker Compose

### System Architecture

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   Client        │       │   Server         │       │   Supabase      │
│   (React)       │◄─────►│   (Express)      │◄─────►│   (PostgreSQL)  │
│   Port 80       │       │   Port 5001      │       │   Cloud         │
│   Nginx         │       │   Node.js        │       │                 │
└─────────────────┘       └──────────────────┘       └─────────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  Docker Volume  │
                          │  (File Storage) │
                          └─────────────────┘
```

### Docker Setup
- **Multi-stage builds** for optimized image sizes
- **Health checks** for automatic container monitoring
- **Auto-restart** on container failures (`restart: unless-stopped`)
- **Persistent storage** using Docker volumes
- **Network isolation** for security

---

## 📊 Database Schema

### Tables
- **users**: User authentication and profiles
- **files**: File metadata and storage paths
- **folders**: Folder hierarchy with self-referencing structure

### Key Features
- Soft delete architecture (recycle bin)
- Foreign key relationships for data integrity
- Indexed queries for performance
- Row-level security with Supabase

---

## 🔧 Docker Commands Reference

```bash
# View logs
docker-compose logs -f

# Check container status
docker-compose ps

# Restart containers
docker-compose restart

# Stop application
docker-compose down

# View backend health
curl http://localhost:5001/api/health
```

---

## 🧪 Testing Checklist

### Basic Flow
- [ ] Register/Login with demo credentials
- [ ] Upload a file
- [ ] Create a folder
- [ ] Move file to folder
- [ ] Rename a file
- [ ] Delete a file (check recycle bin)
- [ ] Restore from recycle bin
- [ ] Search for a file
- [ ] Filter by file type
- [ ] Switch between grid/list view
- [ ] Toggle dark/light theme

### Advanced Testing
- [ ] Test nested folder creation
- [ ] Upload multiple files
- [ ] Bulk delete operations
- [ ] View file details panel
- [ ] Check storage usage
- [ ] Create empty Office documents
- [ ] View recent files
- [ ] Test breadcrumb navigation
- [ ] Test context menu (right-click)

---

## 📱 Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5001
kill -9 <PID>
```

### Container Not Starting

```bash
# Check logs
docker-compose logs server
docker-compose logs client

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Cannot Connect to Database

- Verify Supabase credentials in `.env`
- Check internet connection
- Ensure Supabase project is active

---

## 📚 Additional Documentation

- [README.md](README.md) - Complete project documentation
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Detailed deployment guide
- [HACKATHON_DEPLOYMENT.md](HACKATHON_DEPLOYMENT.md) - Team deployment guide

---

## 👥 Contact & Support

For questions or issues during evaluation, please check:
- Application logs: `docker-compose logs -f`
- Health check: http://localhost:5001/api/health

---

**Thank you for reviewing our project!** 🙏

We've implemented a production-ready cloud storage solution with modern architecture, comprehensive features, and containerized deployment. The application showcases full-stack development skills including React, Node.js, PostgreSQL, Docker, and cloud services integration.
