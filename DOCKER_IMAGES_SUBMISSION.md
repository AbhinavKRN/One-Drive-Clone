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
   ```bash
   cp .env.docker.example .env
   # Edit .env with provided Supabase credentials
   ```

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

**Thank you for reviewing our Docker Hub images submission!** 🎉

All images are verified, tested, and ready for hackathon evaluation.

