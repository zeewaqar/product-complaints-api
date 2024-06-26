import { sequelize, User, Complaint } from './models';
import bcrypt from 'bcryptjs';

async function createSampleData() {
  await sequelize.sync({ force: true }); // Reset database

  // Create sample users
  const password = await bcrypt.hash('password123', 10);
  const users = [
    { username: 'user1', password },
    { username: 'user2', password },
    { username: 'user3', password },
  ];

  await User.bulkCreate(users);

  // Create sample complaints
  const complaints = [
    {
      productId: 1,
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      date: new Date(),
      description: 'Product stopped working after one week.',
      status: 'Open'
    },
    {
      productId: 2,
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@example.com',
      date: new Date(),
      description: 'Received the wrong product.',
      status: 'InProgress'
    },
    {
      productId: 1,
      customerName: 'Alice Johnson',
      customerEmail: 'alice.johnson@example.com',
      date: new Date(),
      description: 'Product arrived damaged.',
      status: 'Open'
    },
    {
      productId: 3,
      customerName: 'Bob Brown',
      customerEmail: 'bob.brown@example.com',
      date: new Date(),
      description: 'Product does not match the description.',
      status: 'Rejected'
    }
  ];

  await Complaint.bulkCreate(complaints);

  console.log('Sample data created successfully.');
}

createSampleData().then(() => {
  sequelize.close();
});
