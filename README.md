
# Product Complaints API

## Introduction

This is a RESTful API for managing product complaints. The API allows for creating, viewing, updating, and deleting complaints. Additionally, it includes a Swagger endpoint for documenting the API.

## Instructions for Setting Up and Running Your API

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/zeewaqar/product-complaints-api.git
   cd product-complaints-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add the following:

   ```plaintext
    SECRET_KEY=your_secret_key
    DATABASE_URL=./database.sqlite
    DB_POOL_MAX=10
    DB_POOL_MIN=0
    DB_POOL_ACQUIRE=30000
    DB_POOL_IDLE=10000
    PORT=3000
   ```

4. Run database migrations and seed data:

   ```bash
   npm run sample-data
   ```

5. Start the application:

   ```bash
   npm start
   ```

6. Access the API:

   The API will be available at `http://localhost:3000`.

7. View API Documentation:

   Open your browser and navigate to `http://localhost:3000/swagger` to view the Swagger UI documentation.

## Explanation of Design Decisions and Used Technologies

### Technologies Used

- **Node.js and Express**: Chosen for their simplicity and flexibility in building RESTful APIs.
- **TypeScript**: Used to leverage static typing, which helps catch errors early and improves code quality.
- **Sequelize**: An ORM for managing database interactions, chosen for its ease of use and support for various databases.
- **SQLite**: Used as the database for simplicity and ease of setup. It can be easily replaced with other databases like PostgreSQL.
- **JWT (jsonwebtoken)**: Used for handling authentication securely.
- **Swagger (swagger-ui-express)**: Integrated for API documentation to provide an interactive interface for testing and understanding the API.
- **Jest and Supertest**: Used for writing and running tests to ensure the API works as expected.

## API Documentation

### Endpoints

1. **Register User**
   - **POST /register**
   - Request Body:
     ```json
     {
       "username": "sampleuser",
       "password": "password123"
     }
     ```
   - Response:
     ```json
     {
       "message": "User registered successfully"
     }
     ```

2. **Login User**
   - **POST /login**
   - Request Body:
     ```json
     {
       "username": "sampleuser",
       "password": "password123"
     }
     ```
   - Response:
     ```json
     {
       "token": "jwt-token-here"
     }
     ```

3. **Create Complaint**
   - **POST /complaints**
   - Request Body:
     ```json
     {
       "productId": 1,
       "customer": {
         "name": "John Doe",
         "email": "john.doe@example.com"
       },
       "description": "Product stopped working after one week."
     }
     ```
   - Response:
     ```json
     {
       "message": "Complaint created successfully",
       "complaint": {
         "id": 1,
         "productId": 1,
         "customerName": "John Doe",
         "customerEmail": "john.doe@example.com",
         "description": "Product stopped working after one week.",
         "status": "Open",
         "createdAt": "2023-05-28T14:00:00Z",
         "updatedAt": "2023-05-28T14:00:00Z"
       }
     }
     ```

4. **Get All Complaints**
   - **GET /complaints**
   - Query Parameters: `page`, `pageSize`, `productId`, `customerName`, `status`
   - Response:
     ```json
     {
       "complaints": [
         {
           "id": 1,
           "productId": 1,
           "customerName": "John Doe",
           "customerEmail": "john.doe@example.com",
           "description": "Product stopped working after one week.",
           "status": "Open",
           "createdAt": "2023-05-28T14:00:00Z",
           "updatedAt": "2023-05-28T14:00:00Z"
         },
         {
           "id": 2,
           "productId": 2,
           "customerName": "Jane Smith",
           "customerEmail": "jane.smith@example.com",
           "description": "Received the wrong product.",
           "status": "InProgress",
           "createdAt": "2023-05-29T14:00:00Z",
           "updatedAt": "2023-05-29T14:00:00Z"
         }
       ],
       "total": 2,
       "pages": 1
     }
     ```

5. **Get Complaint by ID**
   - **GET /complaints/{id}**
   - Response:
     ```json
     {
       "id": 1,
       "productId": 1,
       "customerName": "John Doe",
       "customerEmail": "john.doe@example.com",
       "description": "Product stopped working after one week.",
       "status": "Open",
       "createdAt": "2023-05-28T14:00:00Z",
       "updatedAt": "2023-05-28T14:00:00Z"
     }
     ```

6. **Update Complaint**
   - **PUT /complaints/{id}**
   - Request Body:
     ```json
     {
       "description": "Updated description of the problem",
       "status": "InProgress"
     }
     ```
   - Response:
     ```json
     {
       "message": "Complaint updated successfully",
       "complaint": {
         "id": 1,
         "productId": 1,
         "customerName": "John Doe",
         "customerEmail": "john.doe@example.com",
         "description": "Updated description of the problem",
         "status": "InProgress",
         "createdAt": "2023-05-28T14:00:00Z",
         "updatedAt": "2023-05-28T14:00:00Z"
       }
     }
     ```

7. **Cancel Complaint**
   - **DELETE /complaints/{id}**
   - Response:
     ```json
     {
       "message": "Complaint canceled successfully"
     }
     ```

8. **Get All Notifications**
   - **GET /notifications**
   - Response:
     ```json
     [
       {
         "id": 1,
         "complaintId": 1,
         "message": "Complaint status updated to InProgress",
         "date": "2023-05-28T15:00:00Z"
       },
       {
         "id": 2,
         "complaintId": 2,
         "message": "Complaint status updated to Resolved",
         "date": "2023-05-29T16:00:00Z"
       }
     ]
     ```

## Testing Instructions

1. **Run Database Migrations and Seed Data**:

   ```bash
   npm run sample-data
   ```

2. **Run Tests**:

   ```bash
   npm test
   ```

The tests cover various aspects of the API, including user registration and login, complaint creation, retrieval, updating, and cancellation, as well as notification logging.