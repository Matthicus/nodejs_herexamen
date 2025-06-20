# Task Management API

A Node.js REST API with TypeScript for managing tasks, built with Express, MongoDB, and EJS dashboard.

## Features

- Complete REST API with CRUD operations for tasks
- MongoDB database with Mongoose ODM
- TypeScript with strict typing (no any/unknown)
- EJS dashboard with filtering, pagination, and full CRUD functionality
- Comprehensive error handling and validation
- Database seeding and clearing scripts
- Responsive design with modern UI

## API Endpoints

### Tasks

- `POST /api/tasks` - Create new task
- `GET /api/tasks` - Get all tasks with filtering, pagination, and sorting
- `GET /api/tasks/:id` - Get single task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Dashboard

- `GET /` - Task dashboard with filtering and pagination
- `GET /task/:id` - View and edit individual task
- `POST /task/:id/edit` - Update task via dashboard
- `POST /task/:id/delete` - Delete task via dashboard

## Query Parameters

### GET /api/tasks

- `category` - Filter by category (case-insensitive)
- `priority` - Filter by priority (low, medium, high)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (default: createdAt)
- `order` - Sort order: asc/desc (default: desc)

## Task Schema

```json
{
  "title": "string (required, max 200 chars)",
  "description": "string (required, max 1000 chars)",
  "category": "string (required, max 100 chars)",
  "priority": "low|medium|high (required)",
  "dueDate": "Date (optional, must be future)",
  "createdAt": "Date (auto-generated)",
  "updatedAt": "Date (auto-generated)"
}
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file:
   ```
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/taskmanagement
   ```
4. Start MongoDB service

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Database Management

```bash
npm run seed    # Add sample data
npm run clear   # Remove all tasks
```

## API Response Format

### Success Response

```json
{
  "tasks": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalTasks": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response

```json
{
  "message": "Error description"
}
```

## Validation Rules

- **Title**: Required, maximum 200 characters
- **Description**: Required, maximum 1000 characters
- **Category**: Required, maximum 100 characters
- **Priority**: Required, must be "low", "medium", or "high"
- **Due Date**: Optional, must be future date if provided
- Expired tasks (past due date) are not returned in API responses

## Example Usage

### Create Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish the task management API",
    "category": "Development",
    "priority": "high",
    "dueDate": "2026-12-31T10:00:00Z"
  }'
```

### Get Tasks with Filtering

```bash
curl "http://localhost:3000/api/tasks?category=Development&priority=high&page=1&limit=5"
```

### Update Task

```bash
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"priority": "low"}'
```

### Delete Task

```bash
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID
```

## Project Structure

```
├── src/
│   ├── controllers/         # Request handlers
│   ├── models/              # Database schemas
│   ├── routes/              # API routes
│   ├── scripts/             # Database utilities
│   └── server.ts            # Main application
├── views/                   # EJS templates
├── public/                  # Static files (CSS, JS)
├── dist/                    # Compiled output
└── package.json
```

## Dashboard Features

- View all tasks in a responsive table
- Filter tasks by category and priority
- Pagination with navigation controls
- Create, edit, and delete tasks via web interface
- Smart sorting by due date and creation time
- Form validation with error messages

## Technologies

- Node.js with TypeScript
- Express.js framework
- MongoDB with Mongoose ODM
- EJS template engine
- Modern CSS with responsive design

## Error Handling

The API handles various error scenarios:

- Missing required fields
- Invalid date formats
- Past due dates
- Invalid task IDs
- Database connection issues
- Validation errors

## Deployment

### Environment Variables

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanagement
PORT=3000
```

### Build Commands

- Build: `npm install && npm run build`
- Start: `npm start`

-> gemaakt door chatgpt (might have some inconsistencies), ben zeer moe
