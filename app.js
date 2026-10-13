const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const methodOverride = require('method-override');

const app = express();
const shop = require('./controllers/shop_controller');
const products = require('./controllers/productos_controller');
const users = require('./controllers/user_controller');

const PUBLIC = path.join(__dirname, 'public');
const UPLOADS = path.join(PUBLIC, 'uploads');

fs.mkdirSync(UPLOADS, { recursive: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static(PUBLIC));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, UPLOADS),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname).toLowerCase())
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Solo se permiten imágenes.'))
});

// Tienda
app.get('/', (req, res) => res.redirect('/home'));
app.get('/home', shop.mostrarHome);
app.get('/shop/categoria/:nombre', shop.verCategoria);
app.get('/nosotros', shop.mostrarNosotros);
app.get('/contacto', shop.mostrarContacto);
app.get('/carrito', shop.mostrarCarrito);
app.get('/detalleproducto/:id', shop.mostrarDetalleProducto);

// Usuarios
app.get(['/login', '/register', '/registro'], (req, res, next) => {
    if (req.path === '/login') return users.mostrarLogin(req, res, next);
    users.mostrarRegistro(req, res, next);
});
app.post('/usuarios/login', users.procesarLogin);
app.post('/usuarios/registro', users.procesarRegistro);

// Administrador
app.get('/products', products.listarProductos);
app.get('/products/create', products.mostrarFormularioNuevo);
app.post('/products', upload.single('image'), products.crearProducto);
app.get('/products/:id/edit', products.mostrarFormularioEditar);
app.get('/products/:id', shop.mostrarDetalleProducto);
app.put('/products/:id', upload.single('image'), products.actualizarProducto);
app.delete('/products/:id', products.eliminarProducto);

// Errores
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) return res.status(400).send('La imagen supera los 5 MB permitidos.');
    if (err) return res.status(400).send(err.message);
    next();
});

const PORT = process.env.PORT || 3200;
app.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));
