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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
const user_1 = __importDefault(require("../models/user"));
dotenv.config();
const router = express_1.default.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key'; // Use the environment variable or a default value
// Register a new user
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password || password.length < 8) {
        console.log('Invalid username or password format');
        return res.status(400).json({ message: 'Invalid username or password format' });
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    try {
        const user = yield user_1.default.create({ username, password: hashedPassword });
        console.log('User registered:', user.username);
        res.status(201).json({ message: 'User registered successfully', user });
    }
    catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.log('Username already taken');
            res.status(400).json({ message: 'Username already taken' });
        }
        else {
            console.error('Error registering user:', error.message);
            res.status(500).json({ message: error.message });
        }
    }
}));
// Login a user
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const user = yield user_1.default.findOne({ where: { username } });
        if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
            console.log('Invalid username or password');
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    }
    catch (error) {
        console.error('Error logging in user:', error.message);
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
