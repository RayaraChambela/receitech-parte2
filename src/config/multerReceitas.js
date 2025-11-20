// src/config/multerReceitas.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const destFolder = path.join(__dirname, '..', '..', 'public', 'uploads', 'recipes');

// garante que a pasta existe
if (!fs.existsSync(destFolder)) {
  fs.mkdirSync(destFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destFolder);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `recipe_${timestamp}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Arquivo precisa ser uma imagem'), false);
  }
};

const uploadRecipe = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = uploadRecipe;
