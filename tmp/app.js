// Academic Project Platform - Main Server File
const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Project routes
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    // Fetch projects from database
    const projects = await getProjects(req.user.id);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const project = await createProject(req.body, req.user.id);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// File upload route
app.post('/api/projects/:id/files', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const fileData = {
      projectId: req.params.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    };
    
    const savedFile = await saveProjectFile(fileData);
    res.json({ message: 'File uploaded successfully', file: savedFile });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Academic Project Platform running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to get started`);
});

// Helper functions (would be in separate modules in real app)
async function getProjects(userId) {
  // Database query implementation
  return [];
}

async function createProject(projectData, userId) {
  // Database creation implementation
  return { id: 'new-project-id', ...projectData };
}

async function saveProjectFile(fileData) {
  // File metadata storage implementation
  return fileData;
}