const express = require("express");

const router = express.Router();

const data = require("../data/data");


// ==============================
// GET ALL EXPENSES
// ==============================

router.get("/", (req, res) => {

    res.json({
        success: true,
        count: data.expenses.length,
        expenses: data.expenses
    });

});


// ==============================
// GET ONE EXPENSE
// ==============================

router.get("/:id", (req, res) => {

    const id = Number(req.params.id);

    const expense = data.expenses.find(
        item => item.id === id
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

});


// ==============================
// ADD EXPENSE
// ==============================

router.post("/", (req, res) => {

    const {
        amount,
        category,
        description,
        paymentMethod,
        date
    } = req.body;


    if (!amount || !category || !description || !date) {

        return res.status(400).json({
            success: false,
            message: "Please provide all required fields"
        });

    }


    const newExpense = {

        id:
            data.expenses.length > 0
                ? data.expenses[data.expenses.length - 1].id + 1
                : 1,

        amount: Number(amount),

        category,

        description,

        paymentMethod: paymentMethod || "UPI",

        date

    };


    data.expenses.push(newExpense);


    res.status(201).json({

        success: true,

        message: "Expense added successfully",

        expense: newExpense

    });

});


module.exports = router;