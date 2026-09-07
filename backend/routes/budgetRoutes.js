const express = require("express");
const router = express.Router();

const Budget = require("../models/Budget");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware to all budget routes
router.use(authMiddleware);

// ==============================
// GET ALL BUDGETS
// ==============================
router.get("/", async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.userId }).sort({ year: -1, _id: -1 });

        res.json({
            success: true,
            count: budgets.length,
            budgets: budgets.map(b => ({
                id: b._id,
                month: b.month,
                year: b.year,
                amount: b.amount
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to get budgets"
        });
    }
});

// ==============================
// GET ONE BUDGET
// ==============================
router.get("/:id", async (req, res) => {
    try {
        const budget = await Budget.findOne({ _id: req.params.id, userId: req.userId });

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found"
            });
        }

        res.json({
            success: true,
            budget: {
                id: budget._id,
                month: budget.month,
                year: budget.year,
                amount: budget.amount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to get budget"
        });
    }
});

// ==============================
// ADD BUDGET
// ==============================
router.post("/", async (req, res) => {
    try {
        const {
            month,
            year,
            amount
        } = req.body;

        if (!month || !year || amount === undefined || amount <= 0 || year < 2000) {
            return res.status(400).json({
                success: false,
                message: "Month, valid year (> 2000) and amount (> 0) are required"
            });
        }

        const newBudget = await Budget.create({
            userId: req.userId,
            month,
            year,
            amount
        });

        res.status(201).json({
            success: true,
            message: "Budget added successfully",
            budget: {
                id: newBudget._id,
                month: newBudget.month,
                year: newBudget.year,
                amount: newBudget.amount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to add budget"
        });
    }
});

// ==============================
// UPDATE BUDGET
// ==============================
router.put("/:id", async (req, res) => {
    try {
        const {
            month,
            year,
            amount
        } = req.body;

        const id = req.params.id;

        if (!month || !year || amount === undefined || amount <= 0 || year < 2000) {
            return res.status(400).json({
                success: false,
                message: "Month, valid year (> 2000) and amount (> 0) are required"
            });
        }

        const updatedBudget = await Budget.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { month, year, amount },
            { new: true }
        );

        if (!updatedBudget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found"
            });
        }

        res.json({
            success: true,
            message: "Budget updated successfully",
            budget: {
                id: updatedBudget._id,
                month: updatedBudget.month,
                year: updatedBudget.year,
                amount: updatedBudget.amount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to update budget"
        });
    }
});

// ==============================
// DELETE BUDGET
// ==============================
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const deletedBudget = await Budget.findOneAndDelete({ _id: id, userId: req.userId });

        if (!deletedBudget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found"
            });
        }

        res.json({
            success: true,
            message: "Budget deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to delete budget"
        });
    }
});

module.exports = router;