const Sequelize = require('sequelize');
const dbconfig = require('../config/db.config.js');
const config = dbconfig['development'];

const db = {};
let sequelize = new Sequelize(config.database, config.username, config.password, config);

const Invite = require('./Invite.js');
const Meet = require('./Meet.js');
const Tier = require('./Tier.js');
const User = require('./User.js');
const History = require('./History.js');

db.Invite = Invite(sequelize, Sequelize);
db.Meet = Meet(sequelize, Sequelize);
db.Tier = Tier(sequelize, Sequelize);
db.User = User(sequelize, Sequelize);
db.History = History(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;