const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Income = require("../models/Income");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware
router.use(authMiddleware);

// ==============================
// GET DASHBOARD SUMMARY
// ==============================
router.get("/summary", async (req, res) => {
    try {
        // ==============================
        // CURRENT MONTH / YEAR
        // ==============================
        const now = new Date();
        const monthNumber = now.getMonth() + 1;
        const monthTwoDigit = String(monthNumber).padStart(2, "0");
        const monthName = now.toLocaleString("en-US", { month: "long" });
        const year = now.getFullYear();

        const firstDayOfMonth = new Date(year, monthNumber - 1, 1);
        const lastDayOfMonth = new Date(year, monthNumber, 0, 23, 59, 59, 999);

        // ==============================
        // TOTAL INCOME
        // ==============================
        const userIdObj = new mongoose.Types.ObjectId(req.userId);

        const incomeResult = await Income.aggregate([
            { $match: { userId: userIdObj } },
            { $group: { _id: null, totalIncome: { $sum: "$amount" } } }
        ]);
        const totalIncome = incomeResult.length > 0 ? incomeResult[0].totalIncome : 0;

        // ==============================
        // TOTAL EXPENSES
        // ==============================
        const expenseResult = await Expense.aggregate([
            { $match: { userId: userIdObj } },
            { $group: { _id: null, totalExpenses: { $sum: "$amount" } } }
        ]);
        const totalExpenses = expenseResult.length > 0 ? expenseResult[0].totalExpenses : 0;

        // ==============================
        // CURRENT MONTH BUDGET
        // ==============================
        const budgetResult = await Budget.aggregate([
            { 
                $match: { 
                    userId: userIdObj,
                    year: year,
                    month: { $in: [String(monthNumber), monthTwoDigit, monthName, monthName.toLowerCase()] }
                } 
            },
            { $group: { _id: null, totalBudget: { $sum: "$amount" } } }
        ]);
        const totalBudget = budgetResult.length > 0 ? budgetResult[0].totalBudget : 0;

        // ==============================
        // CURRENT MONTH EXPENSES
        // ==============================
        const currentMonthExpenseResult = await Expense.aggregate([
            { 
                $match: { 
                    userId: userIdObj,
                    date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
                } 
            },
            { $group: { _id: null, currentMonthExpenses: { $sum: "$amount" } } }
        ]);
        const currentMonthExpenses = currentMonthExpenseResult.length > 0 ? currentMonthExpenseResult[0].currentMonthExpenses : 0;

        // ==============================
        // BALANCE
        // ==============================
        const balance = totalIncome - totalExpenses;

        // ==============================
        // BUDGET LEFT
        // ==============================
        const budgetLeft = Math.max(totalBudget - currentMonthExpenses, 0);

        // ==============================
        // BUDGET USED %
        // ==============================
        let budgetUsedPercentage = 0;
        if (totalBudget > 0) {
            budgetUsedPercentage = Number(((currentMonthExpenses / totalBudget) * 100).toFixed(1));
            budgetUsedPercentage = Math.min(budgetUsedPercentage, 100);
        }

        // ==============================
        // RESPONSE
        // ==============================
        res.json({
            success: true,
            summary: {
                totalIncome,
                totalExpenses,
                currentMonthExpenses,
                balance,
                totalBudget,
                budgetLeft,
                budgetUsedPercentage
            }
        });

    } catch (error) {
        console.error("Dashboard summary error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load dashboard summary"
        });
    }
});

module.exports = router;