import express from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import { sequelize } from './models';
import complaintRoutes from './routes/complaints';
import authRoutes from './routes/auth';
import * as swaggerDocument from '../swagger.json'; // Adjust the path if necessary

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/complaints', complaintRoutes);
app.use('/', authRoutes);

// Catch-all route for unknown endpoints
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export default app;
