const express = require("express");
const router = express.Router();

const Income = require("../models/Income");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware to all income routes
router.use(authMiddleware);

// ==============================
// GET ALL INCOME
// ==============================
router.get("/", async (req, res) => {
    try {
        const income = await Income.find({ userId: req.userId }).sort({ date: -1 });

        res.json({
            success: true,
            count: income.length,
            income: income.map(inc => ({
                id: inc._id,
                amount: inc.amount,
                source: inc.source,
                date: inc.date.toISOString().split('T')[0] // Format date to string for frontend
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to get income"
        });
    }
});

// ==============================
// GET ONE INCOME
// ==============================
router.get("/:id", async (req, res) => {
    try {
        const income = await Income.findOne({ _id: req.params.id, userId: req.userId });

        if (!income) {
            return res.status(404).json({
                success: false,
                message: "Income not found"
            });
        }

        res.json({
            success: true,
            income: {
                id: income._id,
                amount: income.amount,
                source: income.source,
                date: income.date.toISOString().split('T')[0]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to get income"
        });
    }
});

// ==============================
// ADD INCOME
// ==============================
router.post("/", async (req, res) => {
    try {
        const {
            amount,
            source,
            date
        } = req.body;

        if (!amount || !source || !date) {
            return res.status(400).json({
                success: false,
                message: "Amount, source and date are required"
            });
        }

        const newIncome = await Income.create({
            userId: req.userId,
            amount,
            source,
            date: new Date(date)
        });

        res.status(201).json({
            success: true,
            message: "Income added successfully",
            income: {
                id: newIncome._id,
                amount: newIncome.amount,
                source: newIncome.source,
                date: newIncome.date.toISOString().split('T')[0]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to add income"
        });
    }
});

// ==============================
// UPDATE INCOME
// ==============================
router.put("/:id", async (req, res) => {
    try {
        const {
            amount,
            source,
            date
        } = req.body;
        
        const id = req.params.id;

        // Validate input
        if (!amount || !source || !date) {
            return res.status(400).json({
                success: false,
                message: "Amount, source and date are required"
            });
        }

        const updatedIncome = await Income.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { amount, source, date: new Date(date) },
            { new: true }
        );

        if (!updatedIncome) {
            return res.status(404).json({
                success: false,
                message: "Income not found"
            });
        }

        res.json({
            success: true,
            message: "Income updated successfully",
            income: {
                id: updatedIncome._id,
                amount: updatedIncome.amount,
                source: updatedIncome.source,
                date: updatedIncome.date.toISOString().split('T')[0]
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to update income"
        });
    }
});

// ==============================
// DELETE INCOME
// ==============================
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const deletedIncome = await Income.findOneAndDelete({ _id: id, userId: req.userId });

        if (!deletedIncome) {
            return res.status(404).json({
                success: false,
                message: "Income not found"
            });
        }

        res.json({
            success: true,
            message: "Income deleted successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to delete income"
        });
    }
});

module.exports = router;