const request = require('supertest');
const app = require('../app');  // Adjust the import according to your project structure
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const { delete_account, update_profile, send_money_post } = require('../controllers/authController');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');

jest.mock('bcrypt');
jest.mock('../models/user');
jest.mock('jsonwebtoken');


describe('authController', () => {
  let mongoServer;
  

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    
});


  afterAll(async () => {
    await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
    
  });
  

  describe('POST /signin', () => {
    const mockUserData = {
      _id: '123456',
      email: 'user@example.com',
      password: 'securePassword123'
    };
  
    it('should authenticate a user and return 200 status code with a JWT', async () => {
      // Setup mocks for successful login and token creation
      User.login.mockResolvedValue(mockUserData);
      jwt.sign.mockReturnValue('validToken123');
  
      const response = await request(app)
        .post('/signin')
        .send({ email: 'user@example.com', password: 'securePassword123' });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ user: mockUserData._id });
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('jwt=validToken123')])
      );
      
    });
  
    it('should handle login failures and return 400 status code', async () => {
      // Mock failure scenario for login
      User.login.mockRejectedValue(new Error('Invalid credentials'));
  
      const response = await request(app)
        .post('/signin')
        .send({ email: 'user@example.com', password: 'wrongPassword' });
  
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      
    });
  });

  describe('GET /logout', () => {
    it('should clear the JWT cookie and redirect to the sign-in page', async () => {
      const response = await request(app)
        .get('/logout');
  
      expect(response.status).toBe(302);
      expect(response.headers['location']).toBe('/signin');
     
  });

  });

  describe('POST /signup', () => {
    it('should create a new user and return 201 status code', async () => {
      const mockUser = {
        _id: '12345',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'User',
        phone: '1234567890'
      };
  
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('fakeToken123');
  
      const response = await request(app)
        .post('/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
          surname: 'User',
          phone: '1234567890'
        });
  
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ user: '12345' });
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('jwt=fakeToken123')])
        
      );
      
    });
  
    it('should handle errors and return 400 status code', async () => {
      User.create.mockRejectedValue(new Error('Failed to create user'));
  
      const response = await request(app)
        .post('/signup')
        .send({
          email: 'invalid@example.com',
          password: 'password',
          name: 'Test',
          surname: 'User',
          phone: '1234567890'
        });
  
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      
    });
  });

  describe('AuthController - delete_account', () => {
   
    let req, res;
  
  beforeEach(() => {
    req = {
      cookies: { jwt: 'dummytoken' }
    };
    res = {
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jwt.verify.mockReturnValue({ id: 'user123' });
  });
    
  
    it('should delete user account successfully', async () => {
      User.findByIdAndDelete.mockResolvedValue(true);
  
      await delete_account(req, res);
  
      expect(jwt.verify).toHaveBeenCalledWith('dummytoken', 'mettel bach secret');
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user123');
      expect(res.clearCookie).toHaveBeenCalledWith('jwt');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Account deleted successfully" });
    });
  
    it('should handle errors when deleting an account', async () => {
      const errorMessage = { message: "An error occurred" };
      User.findByIdAndDelete.mockRejectedValue(errorMessage);
  
      await delete_account(req, res);
  
      expect(jwt.verify).toHaveBeenCalledWith('dummytoken', 'mettel bach secret');
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage.message });
    });
  });

  describe('update_profile', () => {
    let req, res;
  
    beforeEach(() => {
      req = {
        cookies: { jwt: 'validToken123' },
        body: {
          name: 'UpdatedName',
          surname: 'UpdatedSurname',
          phone: '1234567890',
          email: 'update@example.com',
          newPassword: 'newSecurePassword123'
        }
      };
      res = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      jwt.verify.mockReturnValue({ id: '123456' });
    });
  
    it('should update user profile successfully', async () => {
      const mockUser = {
        _id: '123456',
        email: 'user@example.com',
        password: 'securePassword123',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findById.mockResolvedValue(mockUser);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedNewPassword');
  
      await update_profile(req, res);
  
      expect(User.findById).toHaveBeenCalledWith('123456');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Profile updated successfully"
      });
    });
  
    it('should handle errors during profile update', async () => {
      User.findById.mockRejectedValue(new Error('Failed to update profile'));
  
      await update_profile(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('send_money_post', () => {
    let req, res;
  
    beforeEach(() => {
      req = {
        body: {
          email: 'recipient@example.com',
          amount: 100,
          currency: 'USD'
        },
        cookies: { jwt: 'validToken123' }
      };
      res = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      jwt.verify.mockReturnValue({ id: 'sender123' });
    });
  
    it('should transfer money successfully', async () => {
      const sender = {
        _id: 'sender123',
        email: 'sender@example.com',
        wallet: { USD: 500 },
        save: jest.fn().mockResolvedValue(true)
      };
      const recipient = {
        _id: 'recipient123',
        email: 'recipient@example.com',
        wallet: { USD: 400 },
        save: jest.fn().mockResolvedValue(true)
      };
  
      User.findById.mockResolvedValue(sender);
      User.findOne.mockResolvedValue(recipient);
  
      await send_money_post(req, res);
  
      expect(User.findById).toHaveBeenCalledWith('sender123');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'recipient@example.com' });
      expect(sender.wallet.USD).toBe(400); // sendern new balance
      expect(recipient.wallet.USD).toBe(500); // recipient new balance
      expect(sender.save).toHaveBeenCalled();
      expect(recipient.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Money sent successfully!" });
    });
  
    it('should handle errors when recipient does not exist', async () => {
      User.findById.mockResolvedValue({
        _id: 'sender123',
        email: 'sender@example.com',
        wallet: { USD: 500 },
        save: jest.fn()
      });
      User.findOne.mockResolvedValue(null);
  
      await send_money_post(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        "errors":  {"amount": "",
               "email": "User with this email is not registered!",
               "name": "",
              "password": "",
               "phone": "",
               "surname": "",
             },
      });
    });
  });
});
