# OneDrive Clone Backend Server

A fully functional backend API for the OneDrive clone project built with Node.js, Express, and MongoDB.

## Features

- **JWT Authentication** - Secure user signup, login, and session management
- **File Management** - Upload, download, delete, rename, and organize files
- **Folder Management** - Create, navigate, delete (recursive), and rename folders
- **Hierarchical Organization** - Support for nested folder structures
- **MongoDB Integration** - Database storage for users, files, and folders

## Tech Stack

- **Node.js + Express.js** - RESTful API framework
- **MongoDB + Mongoose** - Database and ODM
- **JWT** - Token-based authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
The `.env` file is already configured with MongoDB connection.

3. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Files
- `GET /api/files` - Get all files
- `GET /api/files/:id` - Get specific file
- `POST /api/files/upload` - Upload file
- `DELETE /api/files/:id` - Delete file
- `PATCH /api/files/:id/rename` - Rename file
- `GET /api/files/:id/download` - Download file

### Folders
- `GET /api/folders` - Get all folders
- `GET /api/folders/hierarchy` - Get folder hierarchy
- `POST /api/folders` - Create folder
- `DELETE /api/folders/:id` - Delete folder (recursive)
- `PATCH /api/folders/:id/rename` - Rename folder
- `GET /api/folders/:id/files` - Get files in folder

## Project Structure

```
project/server/
├── controllers/     # Business logic
│   ├── auth.controller.js
│   ├── file.controller.js
│   └── folder.controller.js
├── middlewares/     # Auth middleware
│   └── auth.middleware.js
├── models/          # MongoDB models
│   ├── User.js
│   ├── File.js
│   └── Folder.js
├── routes/          # API routes
│   ├── auth.routes.js
│   ├── file.routes.js
│   └── folder.routes.js
├── uploads/         # File storage
├── server.js        # Server entry point
├── package.json
└── .env
```

## Environment Variables

- `PORT` - Server port (default: 5001)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time
- `MAX_FILE_SIZE` - Maximum file upload size

## Frontend Integration

The frontend is configured to connect to this backend server at `http://localhost:5001/api`.

## License

MIT License

