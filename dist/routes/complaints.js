"use strict";
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
const models_1 = require("../models");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize"); // Import Sequelize operators
const router = express_1.default.Router();
const SECRET_KEY = 'your_secret_key';
// Middleware to check JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.sendStatus(401);
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, user) => {
        if (err)
            return res.sendStatus(403);
        req.user = user;
        next();
    });
};
// Validate email format
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};
// Create a new complaint (authenticated)
router.post('/', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, customer, description } = req.body;
    if (!productId || !customer || !customer.name || !customer.email || !description) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!validateEmail(customer.email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    try {
        const complaint = yield models_1.Complaint.create({
            productId,
            customerName: customer.name,
            customerEmail: customer.email,
            date: new Date(),
            description,
            status: 'Open'
        });
        res.status(201).json({ message: 'Complaint created successfully', complaint });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get all complaints (authenticated) with pagination, search, and filter
router.get('/', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, customerName, status, page = 1, pageSize = 10 } = req.query;
    const where = {};
    if (productId)
        where.productId = productId;
    if (customerName)
        where.customerName = { [sequelize_1.Op.like]: `%${customerName}%` };
    if (status)
        where.status = status;
    try {
        const complaints = yield models_1.Complaint.findAndCountAll({
            where,
            offset: (Number(page) - 1) * Number(pageSize),
            limit: Number(pageSize)
        });
        res.json({
            complaints: complaints.rows,
            total: complaints.count,
            pages: Math.ceil(complaints.count / Number(pageSize))
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get a single complaint by ID (authenticated)
router.get('/:id', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const complaint = yield models_1.Complaint.findByPk(req.params.id);
        if (complaint) {
            res.json(complaint);
        }
        else {
            res.status(404).json({ message: 'Complaint not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Update a complaint (authenticated)
router.put('/:id', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const complaint = yield models_1.Complaint.findByPk(req.params.id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        if (['Rejected', 'Accepted', 'Canceled'].includes(complaint.status)) {
            return res.status(400).json({ message: `Cannot update complaint with status ${complaint.status}` });
        }
        const { description, status } = req.body;
        if (description)
            complaint.description = description;
        if (status) {
            if (status === 'Rejected' && complaint.status !== 'InProgress') {
                return res.status(400).json({ message: 'Cannot update complaint to Rejected unless it is InProgress' });
            }
            complaint.status = status;
            yield models_1.Notification.create({
                complaintId: complaint.id,
                message: `Complaint status updated to ${status}`,
                date: new Date()
            });
        }
        yield complaint.save();
        res.json({ message: 'Complaint updated successfully', complaint });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Cancel a complaint (authenticated)
router.delete('/:id', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const complaint = yield models_1.Complaint.findByPk(req.params.id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        complaint.status = 'Canceled';
        yield complaint.save();
        yield models_1.Notification.create({
            complaintId: complaint.id,
            message: 'Complaint canceled',
            date: new Date()
        });
        res.json({ message: 'Complaint canceled successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
