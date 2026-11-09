const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const users = require('../controllers/user_controller');
const guestMiddleware = require('../middlewares/guestMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const validateRegister = require('../middlewares/validateRegister');
const validateLogin = require('../middlewares/validateLogin');

const AVATARS = path.join(__dirname, '..', 'public', 'images', 'users');
fs.mkdirSync(AVATARS, { recursive: true });

const EXTENSIONES_VALIDAS = ['.jpg', '.jpeg', '.png', '.gif'];

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, AVATARS),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname).toLowerCase())
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const mimeValido = /^image\/(jpeg|png|gif)$/.test(file.mimetype);

        if (EXTENSIONES_VALIDAS.includes(ext) && mimeValido) return cb(null, true);

        req.fileError = 'La imagen debe ser un archivo JPG, JPEG, PNG o GIF.';
        cb(null, false);
    }
});

// Envuelve a multer para que sus errores lleguen al validador
const subirAvatar = (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            req.fileError = 'La imagen no puede superar los 5 MB.';
        } else if (err) {
            return next(err);
        }
        next();
    });
};

router.get('/login', guestMiddleware, users.mostrarLogin);
router.get(['/register', '/registro'], guestMiddleware, users.mostrarRegistro);
router.post('/usuarios/login', guestMiddleware, validateLogin, users.procesarLogin);
router.post('/usuarios/registro', guestMiddleware, subirAvatar, validateRegister, users.procesarRegistro);

router.get('/perfil', authMiddleware, users.mostrarPerfil);
router.get('/logout', authMiddleware, users.logout);

module.exports = router;