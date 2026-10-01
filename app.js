const express = require('express');
const multer = require('multer');
const path = require('path');
const session = require('express-session');

const usersController = require('./controllers/user_controller');
const shopController = require('./controllers/shop_controller');
const productsController = require('./controllers/productos_controller');

const app = express();
const PUERTO = 3000;

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, 'public', 'uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'angelitos-clave-local',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 60 * 60 * 1000
    }
}));

app.get('/', (req, res) => {
  res.redirect('/admin/productos');
});

app.get('/login', usersController.mostrarLogin);
app.post('/usuarios/login', usersController.procesarLogin);
app.get('/registro', usersController.mostrarRegistro);
app.post('/usuarios/registro', usersController.procesarRegistro);

app.get('/home', shopController.mostrarHome);
app.get('/carrito', shopController.mostrarCarrito);
app.get('/detalleproducto', shopController.mostrarDetalleProducto);

app.get('/admin/productos', productsController.listarProductos);
app.get('/admin/productos/nuevo', productsController.mostrarFormularioNuevo);
app.post('/admin/productos', upload.single('image'), productsController.crearProducto);
app.get('/admin/productos/:id/editar', productsController.mostrarFormularioEditar);
app.post('/admin/productos/:id/editar', upload.single('image'), productsController.actualizarProducto);

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});