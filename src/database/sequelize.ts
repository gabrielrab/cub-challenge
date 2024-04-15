import 'dotenv/config';
import { Sequelize } from 'sequelize';

console.log('database log', process.env.DATABASE_LOG);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false
});

export default sequelize;
