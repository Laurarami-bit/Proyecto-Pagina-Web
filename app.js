const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const methodOverride = require('method-override');
const session = require('express-session');
const cookieParser = require('cookie-parser');



const app = express();
const shop = require('./controllers/shop_controller');
const products = require('./controllers/productos_controller');
const usersRoutes = require('./routes/users');

const PUBLIC = path.join(__dirname, 'public');
const UPLOADS = path.join(PUBLIC, 'uploads');

fs.mkdirSync(UPLOADS, { recursive: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static(PUBLIC));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(cookieParser());

app.use(session({
    secret: 'angelitos-con-amor-secreto',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    if (!req.session.user && req.cookies.recordarme) {
        try {
            const usuarios = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf8'));
            const encontrado = usuarios.find(u => u.email === req.cookies.recordarme);
            if (encontrado) {
                req.session.user = {
                    id: encontrado.id,
                    firstName: encontrado.firstName,
                    lastName: encontrado.lastName,
                    email: encontrado.email,
                    category: encontrado.category,
                    avatar: encontrado.avatar
                };
            }
        } catch (e) {}
    }
    next();
});

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

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
app.use('/', usersRoutes);

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
