const express = require('express');
const path = require('path');
const app = express();

// Importamos el controlador de la tienda que ya tienes creado
const shopController = require('./controllers/shop_controller');

// Configuración del motor de vistas EJS y la ruta correcta de vistas (src/views)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Carpeta de archivos estáticos (CSS, imágenes, JS)
app.use(express.static(path.join(__dirname, 'public')));

// IMPORTANTE: Middleware para poder leer los datos del formulario POST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta Principal (Home) usando el controlador
app.get('/home', shopController.mostrarHome);

// Redirección raíz al home
app.get('/', (req, res) => {
    res.redirect('/home');
});

// Ruta de categorías (usando tu función verCategoria del controlador)
app.get('/shop/categoria/:nombre', shopController.verCategoria);

// Demás rutas del menú conectadas al controlador
app.get('/nosotros', shopController.mostrarNosotros);
app.get('/contacto', shopController.mostrarContacto);
app.get('/carrito', shopController.mostrarCarrito);
app.get('/detalleproducto', shopController.mostrarDetalleProducto);

// ==========================================
// RUTAS DE LOGIN Y REGISTRO (Vistas GET)
// ==========================================
app.get('/login', (req, res) => {
    res.render('users/login'); 
});

app.get('/register', (req, res) => {
    res.render('users/registro'); 
});

app.get('/registro', (req, res) => {
    res.render('users/registro'); 
});

// ==========================================
// PROCESAMIENTO DE FORMULARIOS (Rutas POST)
// ==========================================

// 1. Al dar "ACCESO" en el Login -> Te lleva directo al Home
app.post('/usuarios/login', (req, res) => {
    console.log("Datos de inicio de sesión:", req.body);
    res.redirect('/home');
});

// 2. Al "CREAR CUENTA" en el Registro -> Te devuelve al Login para que ingreses
app.post('/usuarios/registro', (req, res) => {
    console.log("Datos de registro:", req.body);
    // Aquí después guardaremos el usuario en la base de datos
    res.redirect('/login');
});

// Iniciar servidor en el puerto 3160 libre de conflictos
const PORT = process.env.PORT || 3200;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});