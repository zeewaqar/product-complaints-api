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
const supertest_1 = __importDefault(require("supertest"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const models_1 = require("../src/models");
const server_1 = __importDefault(require("../src/server"));
let server;
let token;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield models_1.sequelize.sync({ force: true });
    const hashedPassword = yield bcryptjs_1.default.hash('password', 10);
    yield models_1.User.create({ username: 'testuser', password: hashedPassword });
    server = server_1.default.listen(4000, () => {
        console.log('Test server is running on port 4000');
    });
    const res = yield (0, supertest_1.default)(server_1.default)
        .post('/login')
        .send({ username: 'testuser', password: 'password' });
    token = res.body.token;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield models_1.sequelize.close();
    server.close();
}));
describe('Complaints API', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield models_1.Complaint.destroy({ where: {} });
    }));
    it('should create a complaint', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post('/complaints')
            .set('Authorization', `Bearer ${token}`)
            .send({
            productId: 1,
            customer: { name: 'John Doe', email: 'john.doe@example.com' },
            description: 'The product does not work as expected.'
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('complaint');
    }));
    it('should not create a complaint with missing fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post('/complaints')
            .set('Authorization', `Bearer ${token}`)
            .send({
            productId: 1,
            customer: { name: 'John Doe' }
        });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Missing required fields');
    }));
    it('should not create a complaint with invalid email', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post('/complaints')
            .set('Authorization', `Bearer ${token}`)
            .send({
            productId: 1,
            customer: { name: 'John Doe', email: 'invalid-email' },
            description: 'The product does not work as expected.'
        });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Invalid email format');
    }));
    it('should get all complaints with pagination', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .get('/complaints?page=1&pageSize=10')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('complaints');
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('pages');
    }));
    it('should get a complaint by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const createRes = yield (0, supertest_1.default)(server_1.default)
            .post('/complaints')
            .set('Authorization', `Bearer ${token}`)
            .send({
            productId: 1,
            customer: { name: 'John Doe', email: 'john.doe@example.com' },
            description: 'The product does not work as expected.'
        });
        const complaintId = createRes.body.complaint.id;
        const res = yield (0, supertest_1.default)(server_1.default)
            .get(`/complaints/${complaintId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id', complaintId);
    }));
    it('should return 404 for a non-existent complaint', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .get('/complaints/999')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Complaint not found');
    }));
    it('should update a complaint', () => __awaiter(void 0, void 0, void 0, function* () {
        const createRes = yield (0, supertest_1.default)(server_1.default)
            .post('/complaints')
            .set('Authorization', `Bearer ${token}`)
            .send({
            productId: 1,
            customer: { name: 'John Doe', email: 'john.doe@example.com' },
            description: 'The product does not work as expected.'
        });
        const complaintId = createRes.body.complaint.id;
        const res = yield (0, supertest_1.default)(server_1.default)
            .put(`/complaints/${complaintId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'InProgress' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('complaint');
        expect(res.body.complaint.status).toEqual('InProgress');
    }));
    it('should not update a complaint with invalid status transition', () => __awaiter(void 0, void 0, void 0, function* () {
        const createRes = yield (0, supertest_1.default)(server_1.default)
            .post('/complaints')
            .set('Authorization', `Bearer ${token}`)
            .send({
            productId: 1,
            customer: { name: 'John Doe', email: 'john.doe@example.com' },
            description: 'The product does not work as expected.'
        });
        const complaintId = createRes.body.complaint.id;
        // Try to set status directly to Rejected from Open
        const res = yield (0, supertest_1.default)(server_1.default)
            .put(`/complaints/${complaintId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'Rejected' });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Cannot update complaint to Rejected unless it is InProgress');
    }));
    it('should cancel a complaint', () => __awaiter(void 0, void 0, void 0, function* () {
        const createRes = yield (0, supertest_1.default)(server_1.default)
            .post('/complaints')
            .set('Authorization', `Bearer ${token}`)
            .send({
            productId: 1,
            customer: { name: 'John Doe', email: 'john.doe@example.com' },
            description: 'The product does not work as expected.'
        });
        const complaintId = createRes.body.complaint.id;
        const res = yield (0, supertest_1.default)(server_1.default)
            .delete(`/complaints/${complaintId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Complaint canceled successfully');
    }));
    it('should return 404 for canceling a non-existent complaint', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .delete('/complaints/999')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Complaint not found');
    }));
    it('should return 404 for accessing unknown endpoint', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .get('/unknown')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Endpoint not found');
    }));
});
