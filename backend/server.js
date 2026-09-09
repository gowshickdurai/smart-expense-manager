const dns = require("dns");
dns.setServers(["8.8.8.8"]);

require("dotenv").config();

const express = require("express");

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

const PORT = process.env.PORT || 5000;


// ==============================
// CORS + MIDDLEWARE
// ==============================

const allowedOrigin =
    "https://smart-expense-manager-taupe.vercel.app";

app.use((req, res, next) => {

    res.header(
        "Access-Control-Allow-Origin",
        allowedOrigin
    );

    res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,PATCH,OPTIONS"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    // Handle browser CORS preflight request
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();

});

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

app.use(
    "/api/expenses",
    expenseRoutes
);

app.use(
    "/api/income",
    incomeRoutes
);

app.use(
    "/api/budgets",
    budgetRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/profile",
    profileRoutes
);


// ==============================
// CHECK JWT SECRET
// ==============================

if (!process.env.JWT_SECRET) {

    console.error(
        "FATAL ERROR: JWT_SECRET is not defined in the environment variables."
    );

    process.exit(1);

}


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