## Overview
This project is a **User Profile Management application** built with React, TypeScript, and PostgreSQL.  
The assignment involved enhancing the existing app by adding backend database integration, QR code functionality, and additional performance/security/feature improvements.  

## Implementation video

https://github.com/user-attachments/assets/36e61fbc-1776-427d-bcf7-7117b56cef66

I have successfully completed **Task 1, Task 2, and part of Task 3** (details below).

## Current Application State
The application currently includes:
- ✅ Frontend React components for user profile CRUD operations  
- ✅ Mock data replaced with backend PostgreSQL database  
- ✅ Modern UI with Tailwind CSS  
- ✅ TypeScript interfaces and type definitions  
- ✅ Basic form validation and error handling  
- ✅ Responsive design  


## Tasks Completed

### ✅ Task 1: Database Integration
- Set up PostgreSQL database with **users table schema**  
- Implemented backend API with CRUD endpoints:  
  - `GET /api/users` - Retrieve all users  
  - `GET /api/users/:id` - Retrieve a specific user  
  - `POST /api/users` - Create a new user  
  - `PUT /api/users/:id` - Update an existing user  
  - `DELETE /api/users/:id` - Delete a user  
- Integrated frontend with backend API  
- Data persists across browser refreshes  


### ✅ Task 2: QR Code Functionality
- Added "Generate QR Code" button on user profile cards  
- Generated QR codes containing user profile information (JSON format)  
- Displayed QR codes in a modal with **download option**  
- Implemented QR code scanner/reader:  
  - Upload QR code images to read user profile data  
  - Auto-populates profile form  
  - Handles invalid QR codes gracefully  


### 🟡 Task 3: Enhancement (Partially Completed)
I selected **Option A: Performance Optimization**.  

#### Implemented:
- ✅ **Pagination**: User list paginated  
- ✅ **Debounced Search**: Implemented search with debounce for efficiency  

#### In Progress:
- ☁️ **Cloudinary Integration**: Partially done ( code is in my local )

#### Pending:
- Add caching strategies for API responses.

## Database Schema
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    bio TEXT,
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## TechStack
- Frontend: React + Vite + Typescript
- Backend: Node.js
- ORM: Prisma
- Database: Postgres SQL

## Setup

1. Install dependencies:
   ```bash
   npm i
   ```

2. Start the React development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=
DATABASE_URL=
NODE_ENV=
FRONTEND_URL=
VITE_BACKEND_URL=
VITE_CLOUDINARY_CLOUD_NAME=
```

## Database Setup

1. Get your database URL and add it to the `DATABASE_URL` environment variable

2. Generate Prisma client:
   ```bash
   prisma generate
   # or
   npx prisma generate
   ```

3. Run database migrations:
   ```bash
   prisma migrate
   # or
   npm prisma migrate dev
   ```

## Running the Server

To start the backend server:
```bash
npm run start:server
```

