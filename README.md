# User Management System (NestJS)

### Features

- User registration and login with JWT
- Role-based access control (Admin, User)
- Profile management (get, update, delete)
- Protected routes with NestJS Guards
- Error handling and input validation
- Swagger API docs

### Architecture

- Framework: NestJS (modular, scalable)
- DB: PostgreSQL
- ORM: Prisma
- Auth: JWT (with access token)
- Role Guard: Custom decorators + guards
- Structure:
  - auth/
  - user/
  - common/
  - prisma/

### API Endpoints

POST /auth/signup  
POST /auth/login  
GET /users/me  
PATCH /users/update  
DELETE /users/delete  
GET /users/all (Admin only)

### Database Models

User:

- id (UUID)
- email
- password
- name
- role (enum: admin/user)
- createdAt
- updatedAt

Role: (optional — could just use enum for now)
