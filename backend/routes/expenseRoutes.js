const express = require("express");

const router = express.Router();

const {
    getDatabase
} = require("../database/database");


// ==============================
// GET ALL EXPENSES
// ==============================

router.get("/", async (req, res) => {

    try {

        const db = getDatabase();

        const expenses = await db.all(
            "SELECT * FROM expenses ORDER BY date DESC"
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
            "SELECT * FROM expenses WHERE id = ?",
            req.params.id
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
            !amount ||
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
                amount,
                category,
                description,
                paymentMethod,
                date
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                amount,
                category,
                description,
                paymentMethod || "UPI",
                date
            ]
        );


        const newExpense = await db.get(
            "SELECT * FROM expenses WHERE id = ?",
            result.lastID
        );


        res.status(201).json({

            success: true,

            message:
                "Expense added successfully",

            expense: newExpense

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Unable to add expense"

        });

    }

});


module.exports = router;