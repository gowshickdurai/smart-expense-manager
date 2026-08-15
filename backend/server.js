const express = require("express");
const cors = require("cors");

const expenseRoutes = require("./routes/expenseRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

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


// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {

    console.log(
        `SmartExpense server running at http://localhost:${PORT}`
    );

});