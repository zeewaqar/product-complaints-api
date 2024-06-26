"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.User = exports.Complaint = exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const complaint_1 = __importDefault(require("./complaint"));
exports.Complaint = complaint_1.default;
const user_1 = __importDefault(require("./user"));
exports.User = user_1.default;
const notification_1 = __importDefault(require("./notification"));
exports.Notification = notification_1.default;
const dotenv = __importStar(require("dotenv"));
// Load environment variables from .env file
dotenv.config();
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'sqlite',
    storage: process.env.DATABASE_URL || './database.sqlite', // Use DATABASE_URL from .env or default to './database.sqlite'
    models: [complaint_1.default, user_1.default, notification_1.default],
    pool: {
        max: parseInt(process.env.DB_POOL_MAX || '10', 10), // Use DB_POOL_MAX from .env or default to 10
        min: parseInt(process.env.DB_POOL_MIN || '0', 10), // Use DB_POOL_MIN from .env or default to 0
        acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10), // Use DB_POOL_ACQUIRE from .env or default to 30000
        idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10) // Use DB_POOL_IDLE from .env or default to 10000
    }
});
exports.sequelize = sequelize;
