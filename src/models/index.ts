import { Sequelize } from 'sequelize-typescript';
import Complaint from './complaint';
import User from './user';
import Notification from './notification';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_URL || './database.sqlite', // Use DATABASE_URL from .env or default to './database.sqlite'
  models: [Complaint, User, Notification],
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10', 10), // Use DB_POOL_MAX from .env or default to 10
    min: parseInt(process.env.DB_POOL_MIN || '0', 10),  // Use DB_POOL_MIN from .env or default to 0
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10), // Use DB_POOL_ACQUIRE from .env or default to 30000
    idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10) // Use DB_POOL_IDLE from .env or default to 10000
  }
});

export { sequelize, Complaint, User, Notification };
