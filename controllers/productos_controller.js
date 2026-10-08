const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_FILE = path.join(__dirname, '..', 'data', 'products.json');
const CATEGORIES = ['Ropa para bebé', 'Coches y paseo', 'Juguetes', 'Accesorios'];
const COLORS = ['Blanco', 'Beige', 'Rosa', 'Celeste', 'Amarillo', 'Verde', 'Gris', 'Azul', 'Rojo', 'Negro', 'Multicolor'];

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

exports.listarProductos = (req, res) => {
  res.render('admin/products', {
    title: 'Productos',
    products: readProducts()
  });
};

exports.mostrarFormularioNuevo = (req, res) => {
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
};

exports.crearProducto = (req, res) => {
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
};

exports.mostrarFormularioEditar = (req, res) => {
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
};

exports.actualizarProducto = (req, res) => {
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
};