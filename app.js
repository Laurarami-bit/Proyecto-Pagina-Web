const express = require('express');
const path = require('path');

const app = express();
const PUERTO = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    res.render('users/login');
});

app.get('/registro', (req, res) => {
    res.render('users/registro');
});

app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});