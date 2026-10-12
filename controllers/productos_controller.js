const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_FILE = path.join(__dirname, '..', 'data', 'products.json');

const CATEGORIES = [
  'juguetes',
  'camisas',
  'aseo',
  'pantalones',
  'vestidos',
  'conjuntos',
  'zapatos',
  'pijamas',
  'abrigos'
];

const COLORS = [
  'Blanco', 'Beige', 'Rosa', 'Celeste', 'Amarillo',
  'Verde', 'Gris', 'Azul', 'Rojo', 'Negro', 'Multicolor'
];

const GENDERS = ['niña', 'niño', 'unisex'];

function readProducts() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }

  const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  if (!Array.isArray(products)) {
    throw new Error('El archivo products.json no contiene una lista válida.');
  }

  return products;
}

function writeProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

function validarProducto({ name, description, category, price, gender, color }) {
  if (!name?.trim() || !description?.trim() || !category || !price || !gender) {
    return 'Completa todos los campos obligatorios.';
  }

  if (!CATEGORIES.includes(category)) {
    return 'La categoría seleccionada no es válida.';
  }

  if (!GENDERS.includes(gender)) {
    return 'Selecciona niña, niño o unisex.';
  }

  if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
    return 'El precio debe ser mayor que cero.';
  }

  if (color && !COLORS.includes(color)) {
    return 'El color seleccionado no es válido.';
  }

  return null;
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
    gender: '',
    price: '',
    color: '',
    image: ''
  };

  res.render('admin/product-form', {
    title: 'Nuevo producto',
    product,
    categories: CATEGORIES,
    colors: COLORS,
    action: '/products' // <-- CORREGIDO: Apunta a la ruta nueva
  });
};

exports.crearProducto = (req, res) => {
  const { name, description, category, price, color, gender } = req.body;

  const error = validarProducto({
    name, description, category, price, color, gender
  });

  if (error) {
    return res.status(400).send(error);
  }

  if (!req.file) {
    return res.status(400).send('Debes seleccionar una imagen para el producto.');
  }

  const products = readProducts();

  products.push({
    id: randomUUID(),
    name: name.trim(),
    description: description.trim(),
    category,
    gender,
    price: Number(price),
    color: color || '',
    image: '/uploads/' + req.file.filename
  });

  writeProducts(products);

  res.redirect('/products'); // <-- CORREGIDO: Redirige al listado correcto
};

exports.mostrarFormularioEditar = (req, res) => {
  const product = readProducts().find((p) => String(p.id).trim() === String(req.params.id).trim());

  if (!product) {
    return res.status(404).send('Producto no encontrado.');
  }

  res.render('admin/product-form', {
    title: 'Editar producto',
    product,
    categories: CATEGORIES,
    colors: COLORS,
    action: '/products/' + product.id + '?_method=PUT' // <-- CORREGIDO: Apunta a PUT con method-override
  });
};

exports.actualizarProducto = (req, res) => {
  const products = readProducts();
  const product = products.find((p) => String(p.id).trim() === String(req.params.id).trim());

  if (!product) {
    return res.status(404).send('Producto no encontrado.');
  }

  const { name, description, category, price, color, gender } = req.body;

  const error = validarProducto({
    name, description, category, price, color, gender
  });

  if (error) {
    return res.status(400).send(error);
  }

  product.name = name.trim();
  product.description = description.trim();
  product.category = category;
  product.gender = gender;
  product.price = Number(price);
  product.color = color || '';

  if (req.file) {
    product.image = '/uploads/' + req.file.filename;
  }

  writeProducts(products);

  res.redirect('/products'); // <-- CORREGIDO
};

exports.eliminarProducto = (req, res) => {
    const products = readProducts();
    const product = products.find(p => String(p.id).trim() === String(req.params.id).trim());

    if (!product) {
        return res.redirect('/products');
    }

    const productosActualizados = products.filter(
        p => String(p.id).trim() !== String(req.params.id).trim()
    );

    writeProducts(productosActualizados);

    res.redirect('/products'); // <-- CORREGIDO
};