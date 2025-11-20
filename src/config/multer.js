const multer = require('multer');
const path = require('path');
const fs = require('fs');

// CAMINHO CORRETO: da pasta src/config até public/uploads/avatars
// => RAIZ_DO_PROJETO/public/uploads/avatars
const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads', 'avatars');

// só pra ter certeza, cria a pasta se não existir
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log('Pasta de upload criada em:', uploadPath);
} else {
  console.log('Usando pasta de upload:', uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    const unique = Date.now();
    cb(null, `${baseName}_${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

module.exports = upload;
