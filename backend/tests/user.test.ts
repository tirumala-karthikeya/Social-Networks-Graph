import request from 'supertest';
import app from '../src/index';
import { User } from '../src/models/User';
import { UserService } from '../src/services/UserService';

describe('User API Tests', () => {
  describe('POST /api/users', () => {
    it('should create a new user successfully', async () => {
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
      expect(response.body.data.popularityScore).toBe(0);
    });

    it('should return 400 for invalid user data', async () => {
      const invalidUserData = {
        username: 'a', // too short
        age: 10, // too young
        hobbies: [] // empty hobbies
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    it('should return 409 for duplicate username', async () => {
      const userData = {
        username: 'duplicateuser',
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
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Username already exists');
    });
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      // Create test users
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['coding']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['gaming']
      });

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user successfully', async () => {
      const user = await User.create({
        username: 'updateuser',
        age: 25,
        hobbies: ['coding']
      });

      const updateData = {
        username: 'updateduser',
        age: 26,
        hobbies: ['coding', 'gaming']
      };

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(updateData.username);
      expect(response.body.data.age).toBe(updateData.age);
      expect(response.body.data.hobbies).toEqual(updateData.hobbies);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .put(`/api/users/${fakeId}`)
        .send({ username: 'newuser' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user successfully when no friends', async () => {
      const user = await User.create({
        username: 'deleteuser',
        age: 25,
        hobbies: ['coding']
      });

      const response = await request(app)
        .delete(`/api/users/${user.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');
    });

    it('should return 409 when trying to delete user with friends', async () => {
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['coding']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['gaming']
      });

      // Make them friends
      await user1.addFriend(user2.id);

      const response = await request(app)
        .delete(`/api/users/${user1.id}`)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot delete user with existing friendships');
    });
  });

  describe('POST /api/users/:id/link', () => {
    it('should create friendship successfully', async () => {
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['coding']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['gaming']
      });

      const response = await request(app)
        .post(`/api/users/${user1.id}/link`)
        .send({ friendId: user2.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Friendship created successfully');

      // Verify friendship was created
      const updatedUser1 = await User.findOne({ id: user1.id });
      const updatedUser2 = await User.findOne({ id: user2.id });
      
      expect(updatedUser1?.friends).toContain(user2.id);
      expect(updatedUser2?.friends).toContain(user1.id);
    });

    it('should return 409 for self-friendship', async () => {
      const user = await User.create({
        username: 'selfuser',
        age: 25,
        hobbies: ['coding']
      });

      const response = await request(app)
        .post(`/api/users/${user.id}/link`)
        .send({ friendId: user.id })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User cannot be friends with themselves');
    });

    it('should return 409 for duplicate friendship', async () => {
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['coding']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['gaming']
      });

      // Create friendship
      await user1.addFriend(user2.id);

      // Try to create duplicate friendship
      const response = await request(app)
        .post(`/api/users/${user1.id}/link`)
        .send({ friendId: user2.id })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Users are already friends');
    });
  });

  describe('DELETE /api/users/:id/unlink', () => {
    it('should remove friendship successfully', async () => {
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['coding']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['gaming']
      });

      // Create friendship
      await user1.addFriend(user2.id);

      const response = await request(app)
        .delete(`/api/users/${user1.id}/unlink`)
        .send({ friendId: user2.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Friendship removed successfully');

      // Verify friendship was removed
      const updatedUser1 = await User.findOne({ id: user1.id });
      const updatedUser2 = await User.findOne({ id: user2.id });
      
      expect(updatedUser1?.friends).not.toContain(user2.id);
      expect(updatedUser2?.friends).not.toContain(user1.id);
    });

    it('should return 409 for non-existent friendship', async () => {
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['coding']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['gaming']
      });

      const response = await request(app)
        .delete(`/api/users/${user1.id}/unlink`)
        .send({ friendId: user2.id })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Users are not friends');
    });
  });

  describe('GET /api/graph', () => {
    it('should return graph data', async () => {
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['coding']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['gaming']
      });

      // Create friendship
      await user1.addFriend(user2.id);

      const response = await request(app)
        .get('/api/graph')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nodes).toHaveLength(2);
      expect(response.body.data.edges).toHaveLength(1);
      expect(response.body.data.edges[0].source).toBe(user1.id);
      expect(response.body.data.edges[0].target).toBe(user2.id);
    });
  });
});

describe('UserService Tests', () => {
  describe('Popularity Score Calculation', () => {
    it('should calculate popularity score correctly', async () => {
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['coding', 'gaming']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['coding', 'music']
      });

      const user3 = await User.create({
        username: 'user3',
        age: 28,
        hobbies: ['gaming', 'sports']
      });

      // user1 is friends with user2 and user3
      await user1.addFriend(user2.id);
      await user1.addFriend(user3.id);

      // user1 should have:
      // - 2 friends
      // - 1 shared hobby with user2 (coding) = 0.5 points
      // - 1 shared hobby with user3 (gaming) = 0.5 points
      // Total: 2 + 0.5 + 0.5 = 3.0

      const updatedUser1 = await User.findOne({ id: user1.id });
      expect(updatedUser1?.popularityScore).toBe(3);
    });

    it('should update popularity score when hobbies change', async () => {
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['coding']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['coding', 'gaming']
      });

      // Make them friends
      await user1.addFriend(user2.id);

      // Update user1's hobbies to include 'gaming'
      await UserService.updateUser(user1.id, {
        hobbies: ['coding', 'gaming']
      });

      const updatedUser1 = await User.findOne({ id: user1.id });
      // Should have 1 friend + 2 shared hobbies * 0.5 = 2.0
      expect(updatedUser1?.popularityScore).toBe(2);
    });
  });

  describe('Relationship Management', () => {
    it('should prevent circular friendship storage', async () => {
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['coding']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['gaming']
      });

      // Create friendship from user1 to user2
      await user1.addFriend(user2.id);

      // Verify both users have each other as friends
      const updatedUser1 = await User.findOne({ id: user1.id });
      const updatedUser2 = await User.findOne({ id: user2.id });

      expect(updatedUser1?.friends).toContain(user2.id);
      expect(updatedUser2?.friends).toContain(user1.id);
      expect(updatedUser1?.friends).toHaveLength(1);
      expect(updatedUser2?.friends).toHaveLength(1);
    });
  });
});