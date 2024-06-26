import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize, Complaint, User, Notification } from '../src/models';
import app from '../src/server';

let server: any;
let token: string;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const hashedPassword = await bcrypt.hash('password', 10);
  await User.create({ username: 'testuser', password: hashedPassword });
  console.log('testuser created');

  server = app.listen(4000, () => {
    console.log('Test server is running on port 4000');
  });

  const res = await request(app)
    .post('/login')
    .send({ username: 'testuser', password: 'password' });
  token = res.body.token;
  console.log('testuser logged in');
});

afterAll(async () => {
  await sequelize.close(); // Close Sequelize connection
  server.close(); // Close Express server
});

describe('User API', () => {
  it('should register a user with valid data', async () => {
    const res = await request(app)
      .post('/register')
      .send({ username: 'newuser', password: 'password123' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should not register a user with a username that is already taken', async () => {
    console.log('Attempting to register a user with a duplicate username');
    const res = await request(app)
      .post('/register')
      .send({ username: 'testuser', password: 'password123' });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Username already taken');
  });

  it('should not register a user with a weak password', async () => {
    const res = await request(app)
      .post('/register')
      .send({ username: 'weakpassworduser', password: '123' });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid username or password format');
  });

  it('should log in with valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'password' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not log in with invalid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'wrongpassword' });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid username or password');
  });
});

describe('Complaints API', () => {
  beforeEach(async () => {
    await Complaint.destroy({ where: {} });
  });

  it('should create a complaint', async () => {
    const res = await request(app)
      .post('/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
        customer: { name: 'John Doe', email: 'john.doe@example.com' },
        description: 'The product does not work as expected.'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('complaint');
  });

  it('should not create a complaint with missing fields', async () => {
    const res = await request(app)
      .post('/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
        customer: { name: 'John Doe' }
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Missing required fields');
  });

  it('should not create a complaint with invalid email', async () => {
    const res = await request(app)
      .post('/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
        customer: { name: 'John Doe', email: 'invalid-email' },
        description: 'The product does not work as expected.'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid email format');
  });

  it('should get all complaints with pagination', async () => {
    const res = await request(app)
      .get('/complaints?page=1&pageSize=10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('complaints');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('pages');
  });

  it('should get complaints by product ID', async () => {
    await request(app)
      .post('/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
        customer: { name: 'John Doe', email: 'john.doe@example.com' },
        description: 'The product does not work as expected.'
      });

    const res = await request(app)
      .get('/complaints?productId=1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.complaints[0]).toHaveProperty('productId', 1);
  });

  it('should get complaints by customer name', async () => {
    await request(app)
      .post('/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
        customer: { name: 'John Doe', email: 'john.doe@example.com' },
        description: 'The product does not work as expected.'
      });

    const res = await request(app)
      .get('/complaints?customerName=John Doe')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.complaints[0]).toHaveProperty('customerName', 'John Doe');
  });

  it('should get complaints by status', async () => {
    await request(app)
      .post('/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
        customer: { name: 'John Doe', email: 'john.doe@example.com' },
        description: 'The product does not work as expected.'
      });

    const res = await request(app)
      .get('/complaints?status=Open')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.complaints[0]).toHaveProperty('status', 'Open');
  });

  it('should get a complaint by ID', async () => {
    const createRes = await request(app)
      .post('/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
        customer: { name: 'John Doe', email: 'john.doe@example.com' },
        description: 'The product does not work as expected.'
      });
    const complaintId = createRes.body.complaint.id;

    const res = await request(app)
      .get(`/complaints/${complaintId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', complaintId);
  });

  it('should return 404 for a non-existent complaint', async () => {
    const res = await request(app)
      .get('/complaints/999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Complaint not found');
  });

  it('should update a complaint', async () => {
    const createRes = await request(app)
      .post('/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
        customer: { name: 'John Doe', email: 'john.doe@example.com' },
        description: 'The product does not work as expected.'
      });
    const complaintId = createRes.body.complaint.id;

    const res = await request(app)
      .put(`/complaints/${complaintId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'InProgress' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('complaint');
    expect(res.body.complaint.status).toEqual('InProgress');
  });

  it('should log notification on complaint status update', async () => {
    const createRes = await request(app)
      .post('/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
        customer: { name: 'John Doe', email: 'john.doe@example.com' },
        description: 'The product does not work as expected.'
      });
    const complaintId = createRes.body.complaint.id;

    await request(app)
      .put(`/complaints/${complaintId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'InProgress' });

    const notifications = await Notification.findAll({ where: { complaintId } });
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0]).toHaveProperty('message', 'Complaint status updated to InProgress');
  });

  it('should not update a complaint with invalid status transition', async () => {
    const createRes = await request(app)
      .post('/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
        customer: { name: 'John Doe', email: 'john.doe@example.com' },
        description: 'The product does not work as expected.'
      });
    const complaintId = createRes.body.complaint.id;

    // Try to set status directly to Rejected from Open
    const res = await request(app)
      .put(`/complaints/${complaintId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Rejected' });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Cannot update complaint to Rejected unless it is InProgress');
  });

  it('should cancel a complaint', async () => {
    const createRes = await request(app)
      .post('/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
        customer: { name: 'John Doe', email: 'john.doe@example.com' },
        description: 'The product does not work as expected.'
      });
    const complaintId = createRes.body.complaint.id;

    const res = await request(app)
      .delete(`/complaints/${complaintId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Complaint canceled successfully');

    const notifications = await Notification.findAll({ where: { complaintId } });
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0]).toHaveProperty('message', 'Complaint canceled');
  });

  it('should return 404 for canceling a non-existent complaint', async () => {
    const res = await request(app)
      .delete('/complaints/999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Complaint not found');
  });

  it('should return 404 for accessing unknown endpoint', async () => {
    const res = await request(app)
      .get('/unknown')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Endpoint not found');
  });

  it('should handle expired token', async () => {
    // Simulate an expired token
    const expiredToken = jwt.sign({ userId: 1 }, 'your_secret_key', { expiresIn: '1ms' });
    await new Promise(resolve => setTimeout(resolve, 10)); // Wait for the token to expire

    const res = await request(app)
      .get('/complaints')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.statusCode).toEqual(403);
  });

  it('should handle invalid token', async () => {
    const invalidToken = 'invalid.token.here';

    const res = await request(app)
      .get('/complaints')
      .set('Authorization', `Bearer ${invalidToken}`);
    expect(res.statusCode).toEqual(403);
  });

  it('should handle unauthorized complaint management', async () => {
    const anotherUserRes = await request(app)
      .post('/register')
      .send({ username: 'anotheruser', password: 'password123' });
    const anotherUserToken = anotherUserRes.body.token;

    const createRes = await request(app)
      .post('/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
        customer: { name: 'John Doe', email: 'john.doe@example.com' },
        description: 'The product does not work as expected.'
      });
    const complaintId = createRes.body.complaint.id;

    const res = await request(app)
      .put(`/complaints/${complaintId}`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({ status: 'InProgress' });
    expect(res.statusCode).toEqual(403);
  });
});
