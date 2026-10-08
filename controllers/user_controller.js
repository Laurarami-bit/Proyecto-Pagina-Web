const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const USERS_FILE = path.join(__dirname, '..', '..', 'data', 'users.json');
console.log('Ruta del archivo:', USERS_FILE);

function readUsers() {
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

exports.mostrarLogin = (req, res) => {
    res.render('users/login');
};

exports.procesarLogin = async (req, res) => {
    const { usuario, clave } = req.body;
    const users = readUsers();
    const encontrado = users.find(u => u.usuario === usuario);

    if (!encontrado) {
        return res.send('Usuario o contraseña incorrectos');
    }

    const correcta = await bcrypt.compare(clave, encontrado.contrasena);

    if (correcta) {
        return res.redirect('/home');
    }

    res.send('Usuario o contraseña incorrectos');
};

exports.mostrarRegistro = (req, res) => {
    res.render('users/registro');
};

exports.procesarRegistro = async (req, res) => {
    const { firstName, lastName, email, password, category, contrasenacon } = req.body;

    if (password !== contrasenacon) {
        return res.send('Las contraseñas no coinciden');
    }

    const users = readUsers();

    const nuevoUsuario = {
        id: randomUUID(),
        firstName,
        lastName,
        category,
        email,
        password: await bcrypt.hash(password, 100)
    };

    users.push(nuevoUsuario);
    writeUsers(users);

    res.redirect('/login');
};