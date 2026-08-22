const express = require("express");
const router = express.Router();

const { getDatabase } = require("../database/database");

// ==============================
// GET ALL INCOME
// ==============================
router.get("/", async (req, res) => {
    try {
        const db = getDatabase();
        const income = await db.all(
            "SELECT * FROM income ORDER BY date DESC"
        );

        res.json({
            success: true,
            count: income.length,
            income: income
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
        const db = getDatabase();
        const income = await db.get(
            "SELECT * FROM income WHERE id = ?",
            req.params.id
        );

        if (!income) {
            return res.status(404).json({
                success: false,
                message: "Income not found"
            });
        }

        res.json({
            success: true,
            income: income
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

        const db = getDatabase();
        const result = await db.run(
            `
            INSERT INTO income
            (
                amount,
                source,
                date
            )
            VALUES (?, ?, ?)
            `,
            [
                amount,
                source,
                date
            ]
        );

        const newIncome = await db.get(
            "SELECT * FROM income WHERE id = ?",
            result.lastID
        );

        res.status(201).json({
            success: true,
            message: "Income added successfully",
            income: newIncome
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
        const db = getDatabase();

        // Check if income exists
        const existingIncome = await db.get(
            "SELECT * FROM income WHERE id = ?",
            id
        );

        if (!existingIncome) {
            return res.status(404).json({
                success: false,
                message: "Income not found"
            });
        }

        // Validate input
        if (!amount || !source || !date) {
            return res.status(400).json({
                success: false,
                message: "Amount, source and date are required"
            });
        }

        // Update income
        await db.run(
            `
            UPDATE income
            SET
                amount = ?,
                source = ?,
                date = ?
            WHERE id = ?
            `,
            [
                amount,
                source,
                date,
                id
            ]
        );

        // Get updated income
        const updatedIncome = await db.get(
            "SELECT * FROM income WHERE id = ?",
            id
        );

        res.json({
            success: true,
            message: "Income updated successfully",
            income: updatedIncome
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
        const db = getDatabase();

        // Check if income exists
        const existingIncome = await db.get(
            "SELECT * FROM income WHERE id = ?",
            id
        );

        if (!existingIncome) {
            return res.status(404).json({
                success: false,
                message: "Income not found"
            });
        }

        // Delete income
        await db.run(
            "DELETE FROM income WHERE id = ?",
            id
        );

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