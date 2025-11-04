# 🐳 Docker Images for Hackathon Submission

This document provides information about the Docker Hub images submitted for the hackathon evaluation.

---

## 📦 Docker Hub Images

### Repository Information

**Docker Hub Username:** `nara13134`  
**Docker Hub Profile:** [https://hub.docker.com/u/nara13134](https://hub.docker.com/u/nara13134)

### Available Images

#### 1. Client Image (Frontend)

**Image Name:** `nara13134/onedrive-client:latest`  
**Image ID:** `sha256:7a8dd5a0a9016cd1dd51fb5c79f59dab6b2a1ec16d2ed0c5b94d6083203496a3`  
**Size:** 86.2 MB  
**Base Image:** `nginx:alpine`  
**Technology Stack:**
- React 18.2
- Vite build tool
- Nginx web server
- Multi-stage build for optimization

**Dockerfile Location:** `client/Dockerfile`

**Pull Command:**
```bash
docker pull nara13134/onedrive-client:latest
```

#### 2. Server Image (Backend)

**Image Name:** `nara13134/onedrive-server:latest`  
**Image ID:** `sha256:d1234295f5f28627ac8a34ef4530a88eea107d6b356e5efee9b7495679e30116`  
**Size:** 232 MB  
**Base Image:** `node:18-alpine`  
**Technology Stack:**
- Node.js 18
- Express.js
- Supabase client
- Built-in health checks

**Dockerfile Location:** `server/Dockerfile`

**Pull Command:**
```bash
docker pull nara13134/onedrive-server:latest
```

---

## 🚀 Quick Deployment with Docker Hub Images

### Prerequisites
- Docker Desktop installed
- Docker Compose available
- `.env` file configured with Supabase credentials

### One-Command Deployment

```bash
# Pull and run pre-built images from Docker Hub
docker-compose -f docker-compose.hub.yml up -d
```

This command will:
1. ✅ Pull latest images from Docker Hub
2. ✅ Start containers with proper networking
3. ✅ Configure environment variables
4. ✅ Set up persistent volumes
5. ✅ Enable health checks and auto-restart

### Access the Application

- **Frontend:** http://localhost
- **Backend API:** http://localhost:5001/api/health

---

## ✅ Image Verification

### Verification Status

All Docker Hub images have been verified to match the source code:

- ✅ **Client Images Match**
  - Local build ID matches Docker Hub image ID
  - Verified: `sha256:7a8dd5a0a9016cd1dd51fb5c79f59dab6b2a1ec16d2ed0c5b94d6083203496a3`
  
- ✅ **Server Images Match**
  - Local build ID matches Docker Hub image ID
  - Verified: `sha256:d1234295f5f28627ac8a34ef4530a88eea107d6b356e5efee9b7495679e30116`

### Verification Commands

To verify images match, run:

```bash
# Compare client images
docker inspect newfolder-client:latest --format='{{.Id}}'
docker inspect nara13134/onedrive-client:latest --format='{{.Id}}'

# Compare server images
docker inspect newfolder-server:latest --format='{{.Id}}'
docker inspect nara13134/onedrive-server:latest --format='{{.Id}}'
```

If Image IDs match → Images are identical ✅

---

## 📋 Image Specifications

### Build Process

Both images are built using:
- **Multi-stage builds** for size optimization
- **Alpine Linux** base images for minimal footprint
- **Production-ready** configurations
- **Health checks** built-in

### Security Features

- ✅ Minimal base images (Alpine Linux)
- ✅ Non-root user execution (where applicable)
- ✅ Security scanning passed
- ✅ No sensitive data in images
- ✅ Environment variables for secrets

### Optimization Features

- ✅ Multi-stage builds reduce final image size
- ✅ Layer caching for faster rebuilds
- ✅ `.dockerignore` files to exclude unnecessary files
- ✅ Production builds with optimized assets

---

## 🔧 Image Management

### Pulling Images

```bash
# Pull client image
docker pull nara13134/onedrive-client:latest

# Pull server image
docker pull nara13134/onedrive-server:latest

# Pull both at once
docker-compose -f docker-compose.hub.yml pull
```

### Inspecting Images

```bash
# View image details
docker inspect nara13134/onedrive-client:latest

# View image size and layers
docker images nara13134/onedrive-client:latest

# View build history
docker history nara13134/onedrive-client:latest
```

### Updating Images

```bash
# Pull latest versions
docker-compose -f docker-compose.hub.yml pull

# Restart with new images
docker-compose -f docker-compose.hub.yml up -d
```

---

## 📊 Image Details

### Client Image (nara13134/onedrive-client:latest)

**Build Information:**
- Build Date: Recent build from latest source code
- Build Context: `./client` directory
- Stages: 2 (build + production)

**Content:**
- React application (built with Vite)
- Nginx configuration
- Static assets (HTML, CSS, JS)
- Optimized production bundle

**Ports:**
- Exposes: Port 80 (HTTP)

**Health Check:**
- Automatic via Docker Compose health monitoring

### Server Image (nara13134/onedrive-server:latest)

**Build Information:**
- Build Date: Recent build from latest source code
- Build Context: `./server` directory
- Production dependencies only

**Content:**
- Node.js runtime
- Express.js application
- API routes and controllers
- Database models and migrations
- File upload handling

**Ports:**
- Exposes: Port 5001 (HTTP API)

**Health Check:**
- Built-in endpoint: `/api/health`
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3

**Volumes:**
- `/app/uploads` - Persistent file storage

---

## 🎯 For Hackathon Judges

### Quick Setup

1. **Ensure Docker is running**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "New folder"
   ```

3. **Configure environment**

   Create a `.env` file with the following demo credentials:

   ```bash
   # Create .env file
   cat > .env << 'EOF'
   # Demo Supabase Configuration (FOR HACKATHON EVALUATION ONLY)
   SUPABASE_URL=https://ukbugknucpgntsqxxgcg.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrYnVna251Y3BnbnRzcXh4Z2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMjI4NzYsImV4cCI6MjA3NzU5ODg3Nn0.Unm4QuVgFJETOcnq8u_C4zLxOFw1Bez1KsZ7WAZCYYQ

   # JWT Configuration
   JWT_SECRET=hackathon-demo-secret-2024
   JWT_EXPIRE=7d

   # File Upload Configuration
   MAX_FILE_SIZE=52428800
   FRONTEND_URL=http://localhost
   EOF
   ```

   **⚠️ IMPORTANT NOTES:**
   - These are **DEMO credentials** for hackathon evaluation only
   - Database has Row Level Security (RLS) enabled for protection
   - These credentials will be rotated after the hackathon
   - For production use, create your own Supabase project

4. **Deploy using Docker Hub images**
   ```bash
   docker-compose -f docker-compose.hub.yml up -d
   ```

5. **Verify deployment**
   ```bash
   # Check container status
   docker-compose -f docker-compose.hub.yml ps
   
   # Check health
   curl http://localhost:5001/api/health
   ```

6. **Access application**
   - Open: http://localhost
   - Login with demo credentials (see JUDGES_README.md)

### Benefits for Judges

✅ **Fast Setup** - No build time required  
✅ **Consistent** - Same images as tested by team  
✅ **Reliable** - Pre-verified and working  
✅ **Professional** - Production-ready deployment  

---

## 📝 Submission Checklist

- [x] Docker Hub images created and pushed
- [x] Images verified to match source code
- [x] `docker-compose.hub.yml` file included
- [x] Images are publicly accessible on Docker Hub
- [x] Images tested and working correctly
- [x] Documentation updated with image information
- [x] README.md includes Docker Hub image details
- [x] JUDGES_README.md includes deployment instructions

---

## 🔗 Related Files

- **`docker-compose.hub.yml`** - Docker Compose file using Docker Hub images
- **`docker-compose.yml`** - Docker Compose file for local builds
- **`client/Dockerfile`** - Client image Dockerfile
- **`server/Dockerfile`** - Server image Dockerfile
- **`JUDGES_README.md`** - Quick setup guide for judges
- **`README.md`** - Complete project documentation

---

## 📞 Support

For any issues with Docker Hub images:

1. Check image availability: https://hub.docker.com/u/nara13134
2. Verify Docker is running: `docker ps`
3. Check logs: `docker-compose -f docker-compose.hub.yml logs`
4. Review troubleshooting section in JUDGES_README.md

---

## ✨ Summary

**Docker Hub Images:**
- ✅ **Client**: `nara13134/onedrive-client:latest` (86.2 MB)
- ✅ **Server**: `nara13134/onedrive-server:latest` (232 MB)
- ✅ **Verified**: Images match source code
- ✅ **Ready**: Tested and production-ready
- ✅ **Documented**: Complete setup instructions provided

**Deployment:**
- One command: `docker-compose -f docker-compose.hub.yml up -d`
- Access at: http://localhost
- Full documentation: See JUDGES_README.md

---

## 🔒 Security & Credential Management

### Demo Credentials

The Supabase credentials provided in this document are **DEMO credentials** for hackathon evaluation purposes only.

**Security Measures in Place:**
- ✅ **Row Level Security (RLS)** enabled on all database tables
- ✅ **User isolation** - Users can only access their own data
- ✅ **Anonymous key** - Limited permissions, read-only for public data
- ✅ **JWT authentication** - All API requests require valid tokens
- ✅ **Password hashing** - bcrypt with salt rounds

### Post-Hackathon Actions

After the hackathon, we will:
1. ✅ Rotate all API keys
2. ✅ Update database credentials
3. ✅ Regenerate JWT secrets
4. ✅ Review and update RLS policies

### For End Users (Production Deployment)

**DO NOT use the demo credentials for production deployments.**

End users should:
1. Create their own Supabase account (free at https://supabase.com)
2. Set up their own database using provided SQL schemas
3. Generate their own API keys
4. Create strong JWT secrets
5. Configure proper RLS policies

**Required Files:**
- `server/supabase_schema.sql` - Initial database schema
- `server/recycle_bin_migration.sql` - Recycle bin feature

**Setup Steps:**
```bash
# 1. Create Supabase project at https://supabase.com

# 2. Run SQL schemas in Supabase SQL Editor
# - First: server/supabase_schema.sql
# - Then: server/recycle_bin_migration.sql

# 3. Get your credentials from Supabase dashboard:
# - Project Settings → API → URL
# - Project Settings → API → anon/public key

# 4. Create .env file with YOUR credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=your-random-secure-secret-here
```

### Data Privacy

- ✅ **No data sharing** - Each Supabase instance is isolated
- ✅ **No backdoors** - Users have full control of their data
- ✅ **No telemetry** - Application doesn't send usage data
- ✅ **Local file storage** - Files stored in Docker volumes, not cloud

---

**Thank you for reviewing our Docker Hub images submission!** 🎉

All images are verified, tested, and ready for hackathon evaluation.

