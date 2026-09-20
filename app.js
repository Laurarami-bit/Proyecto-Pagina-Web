const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const app = express();
const PUERTO = 3000;

const DATA_FILE = path.join(__dirname, 'data', 'products.json');
const CATEGORIES = ['Ropa para bebé', 'Coches y paseo', 'Juguetes', 'Accesorios'];
const COLORS = ['Blanco', 'Beige', 'Rosa', 'Celeste', 'Amarillo', 'Verde', 'Gris', 'Azul', 'Rojo', 'Negro', 'Multicolor'];

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, 'public', 'uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.static(path.join(__dirname, 'public')));

function readProducts() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

app.get('/', (req, res) => {
  res.redirect('/admin/productos');
});

app.get('/login', (req, res) => {
  res.render('users/login');
});

app.get('/registro', (req, res) => {
  res.render('users/registro');
});

app.get('/productos', (req, res) => {
  res.render('products/list');
});

app.get('/detalleproducto', (req, res) => {
  res.render('shop/detalleproducto');
});

app.get('/carrito', (req, res) => {
  res.render('shop/carrito');
});

app.get('/admin/productos', (req, res) => {
  res.render('admin/products', {
    title: 'Productos',
    products: readProducts()
  });
});

app.get('/admin/productos/nuevo', (req, res) => {
  const product = {
    name: '',
    description: '',
    category: '',
    price: '',
    color: '',
    image: ''
  };

  res.render('admin/product-form', {
    title: 'Nuevo producto',
    product,
    categories: CATEGORIES,
    colors: COLORS,
    action: '/admin/productos'
  });
});

app.post('/admin/productos', upload.single('image'), (req, res) => {
  const { name, description, category, price, color } = req.body;

  if (!name || !description || !category || !price) {
    return res.status(400).send('Faltan datos. Vuelve atrás y completa el formulario.');
  }

  const products = readProducts();

  products.push({
    id: randomUUID(),
    name,
    description,
    category,
    price: Number(price),
    color,
    image: req.file ? '/uploads/' + req.file.filename : ''
  });

  writeProducts(products);

  res.redirect('/admin/productos');
});

app.get('/admin/productos/:id/editar', (req, res) => {
  const product = readProducts().find((p) => p.id === req.params.id);

  if (!product) {
    return res.status(404).send('Producto no encontrado');
  }

  res.render('admin/product-form', {
    title: 'Editar producto',
    product,
    categories: CATEGORIES,
    colors: COLORS,
    action: '/admin/productos/' + product.id + '/editar'
  });
});

app.post('/admin/productos/:id/editar', upload.single('image'), (req, res) => {
  const products = readProducts();
  const product = products.find((p) => p.id === req.params.id);

  if (!product) {
    return res.status(404).send('Producto no encontrado');
  }

  const { name, description, category, price, color } = req.body;

  if (!name || !description || !category || !price) {
    return res.status(400).send('Faltan datos. Vuelve atrás y completa el formulario.');
  }

  product.name = name;
  product.description = description;
  product.category = category;
  product.price = Number(price);
  product.color = color;

  if (req.file) {
    product.image = '/uploads/' + req.file.filename;
  }

  writeProducts(products);

  res.redirect('/admin/productos');
});

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});