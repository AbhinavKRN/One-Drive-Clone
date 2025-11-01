# OneDrive Clone

A fully functional OneDrive clone built with React, featuring file management, folder organization, search, and preview capabilities.

## Features

### Authentication
- Sign up with name, email, and password
- Login with email and password
- User session persistence
- Logout functionality

### File Management
- **Upload Files**: Upload multiple files with drag-and-drop support
- **Create Folders**: Organize files in custom folders
- **Delete Items**: Remove files and folders (with recursive deletion for folders)
- **Rename**: Rename both files and folders
- **Download**: Download files directly to your device
- **Navigate**: Browse through folder hierarchy with breadcrumb navigation

### Views & Organization
- **Grid View**: Visual card-based file display
- **List View**: Detailed table view with file information
- **Search**: Real-time search across all files and folders
- **Filters**: Filter by All files, Folders, Photos, or Documents
- **Multi-select**: Select multiple items for batch operations

### File Preview
- Image preview with full-size display
- PDF preview placeholder
- Text file preview
- File metadata display (size, modification date)

### Storage Management
- Visual storage usage indicator
- 5GB storage limit (configurable)
- Real-time storage calculation

## Tech Stack

- **React 18** - UI framework
- **React Router** - Navigation and routing
- **Vite** - Build tool and dev server
- **LocalStorage** - Data persistence
- **Font Awesome** - Icons
- **CSS3** - Styling with modern features

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### First Time Setup

1. **Sign Up**: Create a new account with your name, email, and password
2. **Login**: Use your credentials to access your dashboard
3. **Upload Files**: Click "Upload" button or drag files into the interface
4. **Create Folders**: Click "New folder" to organize your files
5. **Explore**: Navigate through folders, preview files, and manage your storage

### File Operations

- **Upload**: Click the "Upload" button in the toolbar
- **Create Folder**: Click "New folder" button
- **Delete**: Select items and click "Delete"
- **Rename**: Select a single item and click "Rename"
- **Download**: Click the download icon on any file
- **Preview**: Click on any file to preview it
- **Navigate**: Click on folders to open them, use breadcrumbs to go back

### Search & Filter

- Use the search bar in the top navigation to find files
- Click filter options in the sidebar:
  - **All files**: Show everything
  - **Folders**: Show only folders
  - **Photos**: Show only image files
  - **Documents**: Show only document files (PDF, Word, Excel, etc.)

### View Modes

- **Grid View**: Visual cards with large icons/thumbnails
- **List View**: Compact table with detailed information

## Project Structure

```
onedrive-clone/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   ├── Sidebar.jsx         # Left sidebar with filters
│   │   ├── FileGrid.jsx        # File/folder display component
│   │   ├── FilePreview.jsx     # File preview modal
│   │   ├── CreateFolderModal.jsx
│   │   └── RenameModal.jsx
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Signup.jsx          # Signup page
│   │   └── Dashboard.jsx       # Main dashboard
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication context
│   ├── hooks/
│   │   └── useFileManager.js   # File management logic
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Data Storage

All data is stored in the browser's localStorage:
- User accounts: `users` key
- Current session: `currentUser` key
- File system: `onedrive_files_{email}` key per user

**Note**: Since this is a prototype, data is stored locally in your browser. Clearing browser data will delete all files and accounts.

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Customization

### Storage Limit
Edit the storage limit in `src/hooks/useFileManager.js`:
```javascript
const storageTotal = 5 * 1024 * 1024 * 1024 // Change this value
```

### Color Scheme
Primary colors can be modified in the CSS files:
- Primary blue: `#0078d4`
- Accent blue: `#00bcf2`

## Future Enhancements

Potential features for future versions:
- Drag-and-drop file upload
- File sharing with other users
- Starred/favorite files
- Recent files view
- Trash/recycle bin
- File versioning
- Real backend integration
- Cloud storage integration

## License

This project is open source and available for educational purposes.
