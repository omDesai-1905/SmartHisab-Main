# SmartHisab Next.js Backend

Complete Next.js backend API for SmartHisab business management application - converted from Express to Next.js App Router.

## Features

- **User Management**: Registration, login, profile management
- **Customer Management**: CRUD operations with auto-generated credentials
- **Supplier Management**: Complete supplier lifecycle management
- **Transaction Tracking**: Customer and supplier transaction management
- **Cashbook**: Income and expense tracking
- **Messaging System**: User-to-admin and customer-to-user messaging
- **Customer Portal**: Dedicated portal for customers to view transactions
- **Admin Panel**: Complete admin dashboard with analytics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Runtime**: Node.js 18+

## Installation

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas connection string

### Setup Steps

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Create environment file**:

   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** in `.env`:

   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/smarthisab
   JWT_SECRET=your-super-secret-jwt-key-change-this
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ADMIN_EMAIL=admin@smarthisab.com
   ADMIN_PASSWORD=admin123
   ```

4. **Start development server**:

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3001`

## API Endpoints Overview

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `PUT /api/auth/profile` - Update user profile

### Customers

- `GET /api/customers` - Get all customers with balance
- `POST /api/customers` - Create new customer
- `GET /api/customers/analytics` - Get analytics
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer
- Transaction endpoints for each customer

### Suppliers

- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create new supplier
- Transaction management endpoints

### Cashbook

- `GET /api/cashbook` - Get all entries
- `POST /api/cashbook` - Create entry
- `GET /api/cashbook/summary` - Get summary

### Admin

- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- Message management endpoints

### Customer Portal

- `POST /api/customer-portal/login` - Customer login
- `GET /api/customer-portal/transactions` - View transactions
- `POST /api/customer-portal/messages` - Send messages

## Migration from Express

This backend has been completely migrated from Express.js to Next.js App Router with all functionality preserved:

✅ All Express routes converted to Next.js API routes  
✅ Authentication system intact  
✅ Customer auto-generation working  
✅ Admin panel fully functional  
✅ Customer portal operational  
✅ All models and database logic preserved

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

Private - SmartHisab Business Management System
