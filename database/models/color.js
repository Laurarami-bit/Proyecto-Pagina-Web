
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Color', {
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
        tableName: 'colors',
        timestamps: false
    });
};
