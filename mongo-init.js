// MongoDB initialization script
db = db.getSiblingDB('cybernauts');

// Create collections
db.createCollection('users');

// Create indexes for better performance
db.users.createIndex({ "id": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "popularityScore": -1 });
db.users.createIndex({ "createdAt": -1 });
db.users.createIndex({ "hobbies": 1 });

// Insert sample data for development
db.users.insertMany([
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    username: "alice",
    age: 25,
    hobbies: ["coding", "gaming", "music"],
    friends: [],
    createdAt: new Date(),
    popularityScore: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    username: "bob",
    age: 30,
    hobbies: ["gaming", "sports", "cooking"],
    friends: [],
    createdAt: new Date(),
    popularityScore: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    username: "charlie",
    age: 28,
    hobbies: ["music", "art", "photography"],
    friends: [],
    createdAt: new Date(),
    popularityScore: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    username: "diana",
    age: 32,
    hobbies: ["coding", "reading", "hiking"],
    friends: [],
    createdAt: new Date(),
    popularityScore: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    username: "eve",
    age: 26,
    hobbies: ["gaming", "music", "dancing"],
    friends: [],
    createdAt: new Date(),
    popularityScore: 0
  }
]);

print('✅ Cybernauts database initialized with sample data');