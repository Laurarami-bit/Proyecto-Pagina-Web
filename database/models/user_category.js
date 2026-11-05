
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('UserCategory', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    }, {
        tableName: 'user_categories',
        timestamps: false
    });
};
