module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Gender', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(60),
            allowNull: false
        }
    }, {
        tableName: 'genders',
        timestamps: false
    });
};