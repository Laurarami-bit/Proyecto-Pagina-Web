
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config.json');

const dbConfig = config.development;

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        logging: false
    }
);

const UserCategory = require('./user_category')(sequelize, DataTypes);
const User = require('./user')(sequelize, DataTypes);
const Category = require('./category')(sequelize, DataTypes);
const Color = require('./color')(sequelize, DataTypes);
const Gender = require('./gender')(sequelize, DataTypes);
const Product = require('./product')(sequelize, DataTypes);

// Relacion entre categorias de usuarios y usuarios
UserCategory.hasMany(User, {
    foreignKey: 'user_category_id'
});

User.belongsTo(UserCategory, {
    foreignKey: 'user_category_id'
});

// Relacion entre categorias y productos
Category.hasMany(Product, {
    foreignKey: 'category_id'
});

Product.belongsTo(Category, {
    foreignKey: 'category_id'
});

// Relacion entre generos y productos
Gender.hasMany(Product, {
    foreignKey: 'gender_id'
});

Product.belongsTo(Gender, {
    foreignKey: 'gender_id'
});

// Relacion entre colores y productos
Color.hasMany(Product, {
    foreignKey: 'color_id'
});

Product.belongsTo(Color, {
    foreignKey: 'color_id'
});

module.exports = {
    sequelize,
    UserCategory,
    User,
    Category,
    Color,
    Gender,
    Product
};
