const express = require("express");
const router = express.Router();

const Expense = require("../models/Expense");
const Income = require("../models/Income");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware to all expense routes
router.use(authMiddleware);

// ==============================
// GET ALL EXPENSES
// ==============================
router.get("/", async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1, _id: -1 });

        res.json({
            success: true,
            count: expenses.length,
            expenses: expenses.map(exp => ({
                id: exp._id,
                amount: exp.amount,
                category: exp.category,
                description: exp.description,
                paymentMethod: exp.paymentMethod,
                date: exp.date.toISOString().split('T')[0]
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to get expenses"
        });
    }
});

// ==============================
// GET ONE EXPENSE
// ==============================
router.get("/:id", async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        res.json({
            success: true,
            expense: {
                id: expense._id,
                amount: expense.amount,
                category: expense.category,
                description: expense.description,
                paymentMethod: expense.paymentMethod,
                date: expense.date.toISOString().split('T')[0]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to get expense"
        });
    }
});

// ==============================
// ADD EXPENSE
// ==============================
router.post("/", async (req, res) => {
    try {
        const {
            amount,
            category,
            description,
            paymentMethod,
            date
        } = req.body;

        if (amount === undefined || !category || !description || !date) {
            return res.status(400).json({
                success: false,
                message: "Amount, category, description and date are required"
            });
        }

        // ==============================
        // CHECK BALANCE
        // ==============================
        const userIdObj = new mongoose.Types.ObjectId(req.userId);

        const incomeResult = await Income.aggregate([
            { $match: { userId: userIdObj } },
            { $group: { _id: null, totalIncome: { $sum: "$amount" } } }
        ]);
        const totalIncome = incomeResult.length > 0 ? incomeResult[0].totalIncome : 0;

        const expenseResult = await Expense.aggregate([
            { $match: { userId: userIdObj } },
            { $group: { _id: null, totalExpenses: { $sum: "$amount" } } }
        ]);
        const totalExpenses = expenseResult.length > 0 ? expenseResult[0].totalExpenses : 0;

        const currentBalance = totalIncome - totalExpenses;

        if (amount > currentBalance) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Your current balance is ${currentBalance}, which is less than the expense amount of ${amount}.`
            });
        }

        const newExpense = await Expense.create({
            userId: req.userId,
            amount,
            category,
            description,
            paymentMethod: paymentMethod || null,
            date: new Date(date)
        });

        res.status(201).json({
            success: true,
            message: "Expense added successfully",
            expense: {
                id: newExpense._id,
                amount: newExpense.amount,
                category: newExpense.category,
                description: newExpense.description,
                paymentMethod: newExpense.paymentMethod,
                date: newExpense.date.toISOString().split('T')[0]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to add expense"
        });
    }
});

// ==============================
// UPDATE EXPENSE
// ==============================
router.put("/:id", async (req, res) => {
    try {
        const {
            amount,
            category,
            description,
            paymentMethod,
            date
        } = req.body;

        const id = req.params.id;

        if (amount === undefined || !category || !description || !date) {
            return res.status(400).json({
                success: false,
                message: "Amount, category, description and date are required"
            });
        }

        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { amount, category, description, paymentMethod: paymentMethod || null, date: new Date(date) },
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        res.json({
            success: true,
            message: "Expense updated successfully",
            expense: {
                id: updatedExpense._id,
                amount: updatedExpense.amount,
                category: updatedExpense.category,
                description: updatedExpense.description,
                paymentMethod: updatedExpense.paymentMethod,
                date: updatedExpense.date.toISOString().split('T')[0]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to update expense"
        });
    }
});

// ==============================
// DELETE EXPENSE
// ==============================
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const deletedExpense = await Expense.findOneAndDelete({ _id: id, userId: req.userId });

        if (!deletedExpense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        res.json({
            success: true,
            message: "Expense deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to delete expense"
        });
    }
});

module.exports = router;