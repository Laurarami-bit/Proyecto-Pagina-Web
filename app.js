
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const shopController = require('./controllers/shop_controller');
const productsController = require('./controllers/productos_controller');

const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, UPLOADS_DIR),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname).toLowerCase())
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Solo se permiten archivos de imagen.'));
    }
});

// Tienda
app.get('/', (req, res) => res.redirect('/home'));
app.get('/home', shopController.mostrarHome);
app.get('/shop/categoria/:nombre', shopController.verCategoria);
app.get('/nosotros', shopController.mostrarNosotros);
app.get('/contacto', shopController.mostrarContacto);
app.get('/carrito', shopController.mostrarCarrito);
app.get('/detalleproducto/:id', shopController.mostrarDetalleProducto);

// Usuarios
app.get(['/login', '/register', '/registro'], (req, res) => res.render('users/' + (req.path === '/login' ? 'login' : 'registro')));
app.post('/usuarios/login', (req, res) => {
    console.log('Datos de inicio de sesión:', req.body);
    res.redirect('/home');
});
app.post('/usuarios/registro', (req, res) => {
    console.log('Datos de registro:', req.body);
    res.redirect('/login');
});

// Administrador
app.get('/admin/productos', productsController.listarProductos);
app.get('/admin/productos/nuevo', productsController.mostrarFormularioNuevo);
app.post('/admin/productos', upload.single('image'), productsController.crearProducto);
app.get('/admin/productos/:id/editar', productsController.mostrarFormularioEditar);
app.post('/admin/productos/:id/editar', upload.single('image'), productsController.actualizarProducto);
app.post('/admin/productos/:id/eliminar', productsController.eliminarProducto);

// Errores
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).send('Error al subir la imagen. El tamaño máximo permitido es de 5 MB.');
    }
    if (err) return res.status(400).send(err.message);
    next();
});

const PORT = process.env.PORT || 3200;
app.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));

