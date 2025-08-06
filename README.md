# 🛠️ User Management System (Microservices Architecture)

This project is a **User Management System** built using a microservices architecture with **Node.js**, **NestJS**, and **PostgreSQL**. It includes features like authentication, user profiles, role-based access control (RBAC), and notifications.

## 📦 Monorepo Structure

user-management/
├── auth_service/ # Handles user registration, login, JWT
├── user_service/ # Manages user profiles, updates
├── notification_service/ # Sends notifications (email, etc.)
├── gateway_api/ # API gateway (optional)
└── shared/ # Shared interfaces, DTOs, utilities
## 🚀 Tech Stack

- Node.js
- NestJS (per service)
- PostgreSQL (via Prisma ORM)
- RabbitMQ (microservice communication)
- Docker (service containers)
- GitHub Actions (CI/CD)

## 📁 Each Microservice Includes:

- REST APIs (NestJS)
- Prisma + PostgreSQL
- Environment-based config
- Logging and error handling
- Unit + integration testing (Jest)
- Docker support

## 🔐 Auth Flow

- ✅ JWT-based login & registration
- ✅ Password hashing (bcrypt)
- ✅ Role-based access using guards
- ✅ Inter-service auth via RabbitMQ events

## 📦 Installation (for development)

```bash
# Clone repo
git clone https://github.com/<your-username>/user-management.git
cd user-management

# Install dependencies for each service
cd auth_service
npm install
cd ../user_service
npm install
# Repeat for other services