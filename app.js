const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const methodOverride = require('method-override'); // 1. Requerir method-override

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
app.use(methodOverride('_method')); // 2. Configurar method-override para PUT y DELETE

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

// Administrador / CRUD de Productos (Sprint 4)
app.get('/products', productsController.listarProductos);                           // 1. /products (GET) - Listado
app.get('/products/create', productsController.mostrarFormularioNuevo);             // 2. /products/create (GET) - Formulario de creación
app.get('/products/:id', shopController.mostrarDetalleProducto);                    // 3. /products/:id (GET) - Detalle de un producto
app.post('/products', upload.single('image'), productsController.crearProducto);    // 4. /products (POST) - Acción de creación
app.get('/products/:id/edit', productsController.mostrarFormularioEditar);          // 5. /products/:id/edit (GET) - Formulario de edición
app.put('/products/:id', upload.single('image'), productsController.actualizarProducto); // 6. /products/:id (PUT) - Acción de edición
app.delete('/products/:id', productsController.eliminarProducto);                   // 7. /products/:id (DELETE) - Acción de borrado

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
