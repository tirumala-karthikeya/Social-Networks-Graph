import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/index';
import { User } from '../src/models/User';

describe('User Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        age: 25,
        hobbies: ['coding', 'gaming']
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(userData.username);
      expect(response.body.data.age).toBe(userData.age);
      expect(response.body.data.hobbies).toEqual(userData.hobbies);
      expect(response.body.data.friends).toEqual([]);
      expect(response.body.data.popularityScore).toBe(0);
    });

    it('should return 400 for invalid user data', async () => {
      const invalidData = {
        username: 'a', // too short
        age: 10, // too young
        hobbies: [] // empty hobbies
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for duplicate username', async () => {
      const userData = {
        username: 'duplicate',
        age: 25,
        hobbies: ['coding']
      };

      // Create first user
      await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      // Try to create second user with same username
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      // Create test users
      const users = [
        { username: 'user1', age: 25, hobbies: ['coding'] },
        { username: 'user2', age: 30, hobbies: ['gaming'] }
      ];

      for (const user of users) {
        await request(app).post('/api/users').send(user);
      }

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('POST /api/users/:id/link', () => {
    it('should create friendship between two users', async () => {
      // Create two users
      const user1 = await request(app)
        .post('/api/users')
        .send({ username: 'user1', age: 25, hobbies: ['coding'] })
        .expect(201);

      const user2 = await request(app)
        .post('/api/users')
        .send({ username: 'user2', age: 30, hobbies: ['gaming'] })
        .expect(201);

      // Create friendship
      const response = await request(app)
        .post(`/api/users/${user1.body.data.id}/link`)
        .send({ friendId: user2.body.data.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('successfully');

      // Verify friendship was created
      const updatedUser1 = await request(app)
        .get(`/api/users/${user1.body.data.id}`)
        .expect(200);

      const updatedUser2 = await request(app)
        .get(`/api/users/${user2.body.data.id}`)
        .expect(200);

      expect(updatedUser1.body.data.friends).toContain(user2.body.data.id);
      expect(updatedUser2.body.data.friends).toContain(user1.body.data.id);
    });

    it('should return 400 when trying to create duplicate friendship', async () => {
      // Create two users
      const user1 = await request(app)
        .post('/api/users')
        .send({ username: 'user1', age: 25, hobbies: ['coding'] })
        .expect(201);

      const user2 = await request(app)
        .post('/api/users')
        .send({ username: 'user2', age: 30, hobbies: ['gaming'] })
        .expect(201);

      // Create friendship first time
      await request(app)
        .post(`/api/users/${user1.body.data.id}/link`)
        .send({ friendId: user2.body.data.id })
        .expect(200);

      // Try to create friendship again
      const response = await request(app)
        .post(`/api/users/${user1.body.data.id}/link`)
        .send({ friendId: user2.body.data.id })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when user tries to befriend themselves', async () => {
      const user = await request(app)
        .post('/api/users')
        .send({ username: 'user1', age: 25, hobbies: ['coding'] })
        .expect(201);

      const response = await request(app)
        .post(`/api/users/${user.body.data.id}/link`)
        .send({ friendId: user.body.data.id })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user with no friends', async () => {
      const user = await request(app)
        .post('/api/users')
        .send({ username: 'user1', age: 25, hobbies: ['coding'] })
        .expect(201);

      const response = await request(app)
        .delete(`/api/users/${user.body.data.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 400 when trying to delete user with friends', async () => {
      // Create two users
      const user1 = await request(app)
        .post('/api/users')
        .send({ username: 'user1', age: 25, hobbies: ['coding'] })
        .expect(201);

      const user2 = await request(app)
        .post('/api/users')
        .send({ username: 'user2', age: 30, hobbies: ['gaming'] })
        .expect(201);

      // Create friendship
      await request(app)
        .post(`/api/users/${user1.body.data.id}/link`)
        .send({ friendId: user2.body.data.id })
        .expect(200);

      // Try to delete user with friends
      const response = await request(app)
        .delete(`/api/users/${user1.body.data.id}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('friends');
    });
  });

  describe('Popularity Score Calculation', () => {
    it('should calculate popularity score correctly', async () => {
      // Create users with shared hobbies
      const user1 = await request(app)
        .post('/api/users')
        .send({ username: 'user1', age: 25, hobbies: ['coding', 'gaming'] })
        .expect(201);

      const user2 = await request(app)
        .post('/api/users')
        .send({ username: 'user2', age: 30, hobbies: ['coding', 'music'] })
        .expect(201);

      const user3 = await request(app)
        .post('/api/users')
        .send({ username: 'user3', age: 28, hobbies: ['gaming', 'music'] })
        .expect(201);

      // Create friendships
      await request(app)
        .post(`/api/users/${user1.body.data.id}/link`)
        .send({ friendId: user2.body.data.id })
        .expect(200);

      await request(app)
        .post(`/api/users/${user1.body.data.id}/link`)
        .send({ friendId: user3.body.data.id })
        .expect(200);

      // Check popularity scores
      const updatedUser1 = await request(app)
        .get(`/api/users/${user1.body.data.id}`)
        .expect(200);

      // user1 has 2 friends + shared hobbies: coding (1) + gaming (1) = 2 * 0.5 = 1
      // Total: 2 + 1 = 3
      expect(updatedUser1.body.data.popularityScore).toBe(3);
    });
  });
});