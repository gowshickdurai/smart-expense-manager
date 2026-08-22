const express = require("express");

const router = express.Router();

const {
    getDatabase
} = require("../database/database");


// ==============================
// GET ALL BUDGETS
// ==============================

router.get("/", async (req, res) => {

    try {

        const db = getDatabase();

        const budgets = await db.all(
            "SELECT * FROM budgets ORDER BY year DESC, id DESC"
        );

        res.json({
            success: true,
            count: budgets.length,
            budgets: budgets
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

        const db = getDatabase();

        const budget = await db.get(
            "SELECT * FROM budgets WHERE id = ?",
            req.params.id
        );

        if (!budget) {

            return res.status(404).json({
                success: false,
                message: "Budget not found"
            });

        }

        res.json({
            success: true,
            budget: budget
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

        if (
            !month ||
            !year ||
            amount === undefined ||
            amount <= 0 ||
            year < 2000
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Month, valid year (> 2000) and amount (> 0) are required"

            });

        }

        const db = getDatabase();

        const result = await db.run(
            `
            INSERT INTO budgets
            (
                month,
                year,
                amount
            )
            VALUES (?, ?, ?)
            `,
            [
                month,
                year,
                amount
            ]
        );

        res.status(201).json({

            success: true,

            message:
                "Budget added successfully",

            budget: {

                id: result.lastID,

                month,

                year,

                amount

            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Unable to add budget"

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

        const db = getDatabase();

        // Check if budget exists

        const existingBudget = await db.get(
            "SELECT * FROM budgets WHERE id = ?",
            id
        );

        if (!existingBudget) {

            return res.status(404).json({

                success: false,

                message: "Budget not found"

            });

        }

        // Validate input

        if (
            !month ||
            !year ||
            amount === undefined ||
            amount <= 0 ||
            year < 2000
        ) {

            return res.status(400).json({

                success: false,

                message: "Month, valid year (> 2000) and amount (> 0) are required"

            });

        }

        // Update budget

        await db.run(
            `
            UPDATE budgets

            SET
                month = ?,
                year = ?,
                amount = ?

            WHERE id = ?
            `,
            [
                month,
                year,
                amount,
                id
            ]
        );

        // Get updated budget

        const updatedBudget = await db.get(
            "SELECT * FROM budgets WHERE id = ?",
            id
        );

        res.json({

            success: true,

            message: "Budget updated successfully",

            budget: updatedBudget

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

        const db = getDatabase();

        // Check if budget exists

        const existingBudget = await db.get(
            "SELECT * FROM budgets WHERE id = ?",
            id
        );

        if (!existingBudget) {

            return res.status(404).json({

                success: false,

                message: "Budget not found"

            });

        }

        // Delete budget

        await db.run(
            "DELETE FROM budgets WHERE id = ?",
            id
        );

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