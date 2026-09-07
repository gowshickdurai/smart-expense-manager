# Smart Expense Manager

## Overview
Smart Expense Manager is a full-stack personal finance management application that empowers users to track their expenses, monitor income, and set monthly budgets. The application features a comprehensive dashboard that provides insights into financial health through dynamic metrics and category-wise spending analysis. This project represents the final capstone for a comprehensive web development internship module.

## Features
- **User Registration**: Create a new account seamlessly.
- **Secure Login**: Authentication with encrypted sessions.
- **JWT Authentication**: JSON Web Tokens used for secure API requests.
- **Password Hashing**: Passwords securely hashed with `bcryptjs`.
- **Expense Management**: Add, edit, delete, and categorize expenses.
- **Income Management**: Record and track various income sources.
- **Budget Management**: Set and track monthly spending limits.
- **Dynamic Dashboard**: Real-time summary of total income, expenses, available balance, and budget usage.
- **Transaction Search & Filtering**: Quickly find specific transactions by category, payment method, or keyword.
- **Profile Management**: View logged-in user profile details securely.
- **User-Specific Data**: Strict isolation ensures users can only access their own financial records.
- **Logout**: Secure session termination.

## Technology Stack

**Frontend:**
- HTML5
- CSS3 (Vanilla)
- JavaScript (Vanilla)

**Backend:**
- Node.js
- Express.js

**Database:**
- MongoDB

**Authentication:**
- JWT (JSON Web Tokens)
- bcryptjs

## Project Structure
The project is divided into frontend and backend directories:
```
Smart Expense Manager/
├── frontend/             # Client-side static files
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side logic
│   ├── index.html        # Landing page
│   ├── login.html        # Login portal
│   ├── register.html     # Registration portal
│   └── dashboard.html    # Main user dashboard
├── backend/              # Server-side application
│   ├── database/         # MongoDB database initialization
│   ├── middleware/       # JWT authentication middleware
│   ├── routes/           # Express API route handlers
│   ├── server.js         # Main Express server entry point
│   └── .env              # Environment variables
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher recommended)
- npm (Node Package Manager)

### Step-by-Step Guide
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/smart-expense-manager.git
   cd "smart-expense-manager"
   ```

2. **Navigate to the backend directory and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_key_here
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart-expense
   ```

4. **Start the backend server:**
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000`.

5. **Open the Frontend:**
   You can serve the frontend directory using any static file server (e.g., Live Server extension in VS Code) or simply open `frontend/index.html` in your browser to get started!

## API Overview
The backend exposes the following RESTful API endpoints. All endpoints (except Auth) require a valid `Authorization: Bearer <token>` header.

### Authentication
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate and receive a JWT

### Expenses
- `GET /api/expenses` - Retrieve all expenses for the user
- `POST /api/expenses` - Add a new expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

### Income
- `GET /api/income` - Retrieve all income records
- `POST /api/income` - Add a new income record
- `PUT /api/income/:id` - Update an income record
- `DELETE /api/income/:id` - Delete an income record

### Budgets
- `GET /api/budgets` - Retrieve monthly budgets
- `POST /api/budgets` - Add a monthly budget
- `PUT /api/budgets/:id` - Update a budget
- `DELETE /api/budgets/:id` - Delete a budget

### Dashboard
- `GET /api/dashboard/summary` - Get total income, expenses, and budget usage metrics

### Profile
- `GET /api/profile` - Get logged-in user profile details
- `PUT /api/profile` - Update profile information

## Security
- **Authentication**: JWT is used to issue stateless secure tokens.
- **Hashing**: User passwords are encrypted using `bcryptjs` before storage; no plaintext passwords exist in the database.
- **Protected Routes**: Custom authentication middleware protects endpoints from unauthorized access.
- **Data Isolation**: Database queries always filter by `user_id` mapped from the JWT payload, ensuring users cannot view or manipulate others' data.

## Screenshots

*(Add screenshots here after deployment)*
- **Landing Page**: `![Landing Page](placeholder)`
- **Dashboard**: `![Dashboard](placeholder)`
- **Transactions**: `![Transactions](placeholder)`
- **Profile**: `![Profile](placeholder)`

## Deployment

### Strategy
The application architecture comprises a static frontend and a Node.js backend. 

- **Frontend**: Can be hosted on Vercel, Netlify, or GitHub Pages.
- **Backend**: Can be hosted on Render, Railway, or Heroku.

### Important Note regarding Database
This application uses **MongoDB**. Free-tier deployment platforms like Render and Heroku are perfectly suited for this backend because data persistence is handled externally by your MongoDB cluster (e.g., MongoDB Atlas).

### Deployment Steps
1. **Deploy Backend (Render example)**:
   - Create a new Web Service on Render and link your repository.
   - Set the root directory to `backend`.
   - Set the start command to `npm start`.
   - Add the Environment Variables: `PORT=5000`, `MONGO_URI=...`, and `JWT_SECRET=your_production_secret`.
2. **Deploy Frontend (Vercel/Netlify example)**:
   - Create a new site and link your repository.
   - Set the publish directory to `frontend`.
   - Open `frontend/js/script.js` and ensure the `API_URL` logic targets your newly deployed backend URL instead of `localhost`.

## Future Improvements
- **Advanced Analytics**: Generate detailed historical charts and graphical trends.
- **Export Capabilities**: Allow users to export transactions to PDF or Excel format.
- **Recurring Transactions**: Automatically log recurring monthly subscriptions.
- **Mobile Application**: Build a React Native app connecting to the same API.
