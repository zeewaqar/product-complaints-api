import { Sequelize } from 'sequelize-typescript';
import Complaint from './complaint';
import User from './user';
import Notification from './notification';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  models: [Complaint, User, Notification],
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export { sequelize, Complaint, User, Notification };
