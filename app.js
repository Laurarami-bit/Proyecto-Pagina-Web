const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

const shopController = require('./controllers/shop_controller');
const productsController = require('./controllers/productos_controller');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, 'public', 'uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
});

app.get('/home', shopController.mostrarHome);

app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/shop/categoria/:nombre', shopController.verCategoria);

app.get('/nosotros', shopController.mostrarNosotros);
app.get('/contacto', shopController.mostrarContacto);
app.get('/carrito', shopController.mostrarCarrito);
app.get('/detalleproducto/:id', shopController.mostrarDetalleProducto);

app.get('/login', (req, res) => {
    res.render('users/login'); 
});

app.get('/register', (req, res) => {
    res.render('users/registro'); 
});

app.get('/registro', (req, res) => {
    res.render('users/registro'); 
});

app.post('/usuarios/login', (req, res) => {
    console.log("Datos de inicio de sesión:", req.body);
    res.redirect('/home');
});

app.post('/usuarios/registro', (req, res) => {
    console.log("Datos de registro:", req.body);
    res.redirect('/login');
});

app.get('/admin/productos', productsController.listarProductos);
app.get('/admin/productos/nuevo', productsController.mostrarFormularioNuevo);
app.post('/admin/productos', upload.single('image'), productsController.crearProducto);
app.get('/admin/productos/:id/editar', productsController.mostrarFormularioEditar);
app.post('/admin/productos/:id/editar', upload.single('image'), productsController.actualizarProducto);

const PORT = process.env.PORT || 3200;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});