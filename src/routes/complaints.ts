import express from 'express';
import { sequelize, Complaint, Notification } from '../models';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize'; // Import Sequelize operators

const router = express.Router();
const SECRET_KEY = 'your_secret_key';

// Middleware to check JWT token
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

// Validate email format
const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Create a new complaint (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  const { productId, customer, description } = req.body;
  if (!productId || !customer || !customer.name || !customer.email || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (!validateEmail(customer.email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  try {
    const complaint = await Complaint.create({
      productId,
      customerName: customer.name,
      customerEmail: customer.email,
      date: new Date(),
      description,
      status: 'Open'
    });
    res.status(201).json({ message: 'Complaint created successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
});

// Get all complaints (authenticated) with pagination, search, and filter
router.get('/', authenticateToken, async (req, res) => {
  const { productId, customerName, status, page = 1, pageSize = 10 } = req.query;
  const where: any = {};
  if (productId) where.productId = productId;
  if (customerName) where.customerName = { [Op.like]: `%${customerName}%` };
  if (status) where.status = status;

  try {
    const complaints = await Complaint.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize)
    });
    res.json({
      complaints: complaints.rows,
      total: complaints.count,
      pages: Math.ceil(complaints.count / Number(pageSize))
    });
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
});

// Get a single complaint by ID (authenticated)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (complaint) {
      res.json(complaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
});

// Update a complaint (authenticated)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (['Rejected', 'Accepted', 'Canceled'].includes(complaint.status)) {
      return res.status(400).json({ message: `Cannot update complaint with status ${complaint.status}` });
    }

    const { description, status } = req.body;
    if (description) complaint.description = description;

    if (status) {
      if (status === 'Rejected' && complaint.status !== 'InProgress') {
        return res.status(400).json({ message: 'Cannot update complaint to Rejected unless it is InProgress' });
      }
      complaint.status = status;
      await Notification.create({
        complaintId: complaint.id,
        message: `Complaint status updated to ${status}`,
        date: new Date()
      });
    }
    await complaint.save();

    res.json({ message: 'Complaint updated successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
});

// Cancel a complaint (authenticated)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = 'Canceled';
    await complaint.save();

    await Notification.create({
      complaintId: complaint.id,
      message: 'Complaint canceled',
      date: new Date()
    });

    res.json({ message: 'Complaint canceled successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
});

export default router;
