# Cybernauts API Documentation

## Overview

The Cybernauts API is a RESTful service that manages users and their relationships in a social network graph. It provides endpoints for user management, relationship handling, and graph data visualization.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently, the API does not require authentication. In a production environment, you would implement JWT-based authentication.

## Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation error |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Business logic violation |
| 500 | Internal Server Error |

## Endpoints

### Users

#### GET /users
Get all users in the system.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "alice",
      "age": 25,
      "hobbies": ["coding", "gaming", "music"],
      "friends": ["550e8400-e29b-41d4-a716-446655440002"],
      "createdAt": "2023-12-01T10:00:00.000Z",
      "popularityScore": 1.5
    }
  ],
  "message": "Users fetched successfully"
}
```

#### GET /users/:id
Get a specific user by ID.

**Parameters:**
- `id` (string, required): User UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "username": "alice",
    "age": 25,
    "hobbies": ["coding", "gaming", "music"],
    "friends": ["550e8400-e29b-41d4-a716-446655440002"],
    "createdAt": "2023-12-01T10:00:00.000Z",
    "popularityScore": 1.5
  },
  "message": "User fetched successfully"
}
```

#### POST /users
Create a new user.

**Request Body:**
```json
{
  "username": "alice",
  "age": 25,
  "hobbies": ["coding", "gaming", "music"]
}
```

**Validation Rules:**
- `username`: Required, 2-50 characters
- `age`: Required, 13-120
- `hobbies`: Required, at least 1 hobby

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "username": "alice",
    "age": 25,
    "hobbies": ["coding", "gaming", "music"],
    "friends": [],
    "createdAt": "2023-12-01T10:00:00.000Z",
    "popularityScore": 0
  },
  "message": "User created successfully"
}
```

#### PUT /users/:id
Update an existing user.

**Parameters:**
- `id` (string, required): User UUID

**Request Body:**
```json
{
  "username": "alice_updated",
  "age": 26,
  "hobbies": ["coding", "gaming", "music", "reading"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "username": "alice_updated",
    "age": 26,
    "hobbies": ["coding", "gaming", "music", "reading"],
    "friends": [],
    "createdAt": "2023-12-01T10:00:00.000Z",
    "popularityScore": 0
  },
  "message": "User updated successfully"
}
```

#### DELETE /users/:id
Delete a user.

**Parameters:**
- `id` (string, required): User UUID

**Business Rule:** User cannot be deleted if they have friends.

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### GET /users/search
Search users by username or hobbies.

**Query Parameters:**
- `q` (string, required): Search query

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "alice",
      "age": 25,
      "hobbies": ["coding", "gaming", "music"],
      "friends": [],
      "createdAt": "2023-12-01T10:00:00.000Z",
      "popularityScore": 0
    }
  ],
  "message": "Search results fetched successfully"
}
```

#### GET /users/stats
Get user statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 5,
    "totalFriendships": 3,
    "averagePopularityScore": 2.1,
    "topUsers": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "username": "alice",
        "age": 25,
        "hobbies": ["coding", "gaming", "music"],
        "friends": ["550e8400-e29b-41d4-a716-446655440002"],
        "createdAt": "2023-12-01T10:00:00.000Z",
        "popularityScore": 3.5
      }
    ]
  },
  "message": "User statistics fetched successfully"
}
```

### Relationships

#### POST /users/:id/link
Create a friendship between two users.

**Parameters:**
- `id` (string, required): User UUID

**Request Body:**
```json
{
  "friendId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Business Rules:**
- Users cannot be friends with themselves
- Friendships are bidirectional
- Duplicate friendships are prevented

**Response:**
```json
{
  "success": true,
  "message": "Friendship created successfully"
}
```

#### DELETE /users/:id/unlink
Remove a friendship between two users.

**Parameters:**
- `id` (string, required): User UUID

**Request Body:**
```json
{
  "friendId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Friendship removed successfully"
}
```

### Graph Data

#### GET /graph
Get graph data for visualization.

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "data": {
          "label": "alice (25)",
          "username": "alice",
          "age": 25,
          "hobbies": ["coding", "gaming", "music"],
          "popularityScore": 1.5
        },
        "position": {
          "x": 100,
          "y": 200
        },
        "type": "LowScoreNode"
      }
    ],
    "edges": [
      {
        "id": "edge-550e8400-e29b-41d4-a716-446655440001-550e8400-e29b-41d4-a716-446655440002",
        "source": "550e8400-e29b-41d4-a716-446655440001",
        "target": "550e8400-e29b-41d4-a716-446655440002",
        "type": "smoothstep"
      }
    ]
  },
  "message": "Graph data fetched successfully"
}
```

### Hobbies

#### GET /hobbies
Get all unique hobbies in the system.

**Response:**
```json
{
  "success": true,
  "data": [
    "coding",
    "gaming",
    "music",
    "sports",
    "cooking",
    "art",
    "photography",
    "reading",
    "hiking",
    "dancing"
  ],
  "message": "Hobbies fetched successfully"
}
```

### Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "success": true,
  "message": "Cybernauts API is running",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "version": "1.0.0"
}
```

## Business Logic

### Popularity Score Calculation

The popularity score is calculated using the following formula:

```
popularityScore = number of friends + (shared hobbies with friends × 0.5)
```

**Example:**
- User has 2 friends
- User shares 1 hobby with friend A and 2 hobbies with friend B
- Total shared hobbies score: (1 + 2) × 0.5 = 1.5
- Popularity score: 2 + 1.5 = 3.5

### Node Types

Based on popularity score:
- **HighScoreNode**: popularityScore > 5
- **LowScoreNode**: popularityScore ≤ 5

### Relationship Rules

1. **Bidirectional**: When A becomes friends with B, B automatically becomes friends with A
2. **No Self-Friendship**: Users cannot be friends with themselves
3. **No Duplicates**: The same friendship cannot be created twice
4. **Deletion Constraint**: Users with friends cannot be deleted

## Rate Limiting

The API implements rate limiting:
- **General API**: 100 requests per 15 minutes per IP
- **User Creation**: 5 requests per 15 minutes per IP
- **Relationship Operations**: 50 requests per 15 minutes per IP

## CORS

The API supports CORS for the following origins:
- `http://localhost:3000` (development)
- Configured via `CORS_ORIGIN` environment variable

## Examples

### Creating a User and Friendship

```bash
# Create user Alice
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "age": 25,
    "hobbies": ["coding", "gaming"]
  }'

# Create user Bob
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "age": 30,
    "hobbies": ["gaming", "sports"]
  }'

# Make Alice and Bob friends
curl -X POST http://localhost:5000/api/users/{alice_id}/link \
  -H "Content-Type: application/json" \
  -d '{
    "friendId": "{bob_id}"
  }'
```

### Getting Graph Data

```bash
curl http://localhost:5000/api/graph
```

## Error Handling

### Validation Error Example

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "username",
      "message": "Username must be at least 2 characters long"
    },
    {
      "field": "age",
      "message": "Age must be at least 13"
    }
  ]
}
```

### Business Logic Error Example

```json
{
  "success": false,
  "message": "Cannot delete user with existing friendships. Please remove all friendships first."
}
```

## Testing

The API includes comprehensive tests covering:
- User CRUD operations
- Relationship management
- Popularity score calculations
- Business rule validation
- Error handling

Run tests with:
```bash
cd backend
npm test
```