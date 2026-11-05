
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        avatar: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        user_category_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'users',
        timestamps: false
    });
};
