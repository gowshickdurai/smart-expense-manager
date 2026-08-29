require("dotenv").config();
const express = require("express");
const cors = require("cors");

const expenseRoutes = require("./routes/expenseRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

const {
    initializeDatabase
} = require("./database/database");

const app = express();

const PORT = 5000;


// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());

app.use(express.json());


// ==============================
// BASIC ROUTE
// ==============================

app.get("/", (req, res) => {

    res.json({
        message: "SmartExpense Backend is running!"
    });

});


// ==============================
// API ROUTES
// ==============================

app.use("/api/expenses", expenseRoutes);

app.use("/api/income", incomeRoutes);

app.use("/api/budgets", budgetRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes);


// ==============================
// START SERVER
// ==============================

async function startServer() {

    try {

        await initializeDatabase();

        app.listen(PORT, () => {

            console.log(
                `SmartExpense server running at http://localhost:${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "Unable to start server:",
            error
        );

    }

}

startServer();