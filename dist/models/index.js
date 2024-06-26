"use strict";
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
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    models: [complaint_1.default, user_1.default, notification_1.default],
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
exports.sequelize = sequelize;
