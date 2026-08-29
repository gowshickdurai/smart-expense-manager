const express = require("express");

const router = express.Router();

const {
    getDatabase
} = require("../database/database");

const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware to all expense routes
router.use(authMiddleware);


// ==============================
// GET ALL EXPENSES
// ==============================

router.get("/", async (req, res) => {

    try {

        const db = getDatabase();

        const expenses = await db.all(
            "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, id DESC",
            [req.userId]
        );

        res.json({

            success: true,

            count: expenses.length,

            expenses: expenses

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

        const db = getDatabase();

        const expense = await db.get(
            "SELECT * FROM expenses WHERE id = ? AND user_id = ?",
            [req.params.id, req.userId]
        );

        if (!expense) {

            return res.status(404).json({

                success: false,

                message: "Expense not found"

            });

        }

        res.json({

            success: true,

            expense: expense

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


        if (
            amount === undefined ||
            !category ||
            !description ||
            !date
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Amount, category, description and date are required"

            });

        }


        const db = getDatabase();


        const result = await db.run(
            `
            INSERT INTO expenses
            (
                user_id,
                amount,
                category,
                description,
                paymentMethod,
                date
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                req.userId,
                amount,
                category,
                description,
                paymentMethod || null,
                date
            ]
        );


        const newExpense = await db.get(
            "SELECT * FROM expenses WHERE id = ?",
            result.lastID
        );


        res.status(201).json({

            success: true,

            message: "Expense added successfully",

            expense: newExpense

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

        const db = getDatabase();


        const existingExpense = await db.get(
            "SELECT * FROM expenses WHERE id = ? AND user_id = ?",
            [id, req.userId]
        );


        if (!existingExpense) {

            return res.status(404).json({

                success: false,

                message: "Expense not found"

            });

        }


        if (
            amount === undefined ||
            !category ||
            !description ||
            !date
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Amount, category, description and date are required"

            });

        }


        await db.run(
            `
            UPDATE expenses

            SET
                amount = ?,
                category = ?,
                description = ?,
                paymentMethod = ?,
                date = ?

            WHERE id = ? AND user_id = ?
            `,
            [
                amount,
                category,
                description,
                paymentMethod || null,
                date,
                id,
                req.userId
            ]
        );


        const updatedExpense = await db.get(
            "SELECT * FROM expenses WHERE id = ?",
            id
        );


        res.json({

            success: true,

            message: "Expense updated successfully",

            expense: updatedExpense

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

        const db = getDatabase();


        const existingExpense = await db.get(
            "SELECT * FROM expenses WHERE id = ? AND user_id = ?",
            [id, req.userId]
        );


        if (!existingExpense) {

            return res.status(404).json({

                success: false,

                message: "Expense not found"

            });

        }


        await db.run(
            "DELETE FROM expenses WHERE id = ? AND user_id = ?",
            [id, req.userId]
        );


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