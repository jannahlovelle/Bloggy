# Bloggy

Bloggy is a blogging platform built to give people a space to talk about what they love.

## Features

- User registration and authentication (JWT-based)
- Admin and regular user roles
- Create, read, update, and delete blog posts
- Comment on blog posts
- Author-only and admin-only permissions for editing/deleting content

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT), bcryptjs

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository
   ```bash
   git clone <repo-url>
   cd server
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory
   ```env
   PORT=4000
   MONGODB_STRING=<your-mongodb-connection-string>
   JWT_SECRET_KEY=<your-secret-key>
   ```
4. Run the server
   ```bash
   npm start
   ```

## User Credentials

Use the following accounts to test the application:

### Admin User

| Field    | Value          |
| -------- | -------------- |
| Email    | admin@mail.com |
| Password | admin123       |

### Dummy Customer

| Field    | Value             |
| -------- | ----------------- |
| Email    | john.doe@mail.com |
| Password | sample123         |
