const express = require("express");

const router = express.Router();

const data = require("../data/data");


// GET BUDGET

router.get("/", (req, res) => {

    res.json({

        success: true,

        budgets: data.budgets

    });

});


// CREATE BUDGET

router.post("/", (req, res) => {

    const {
        month,
        year,
        amount
    } = req.body;


    if (!month || !year || !amount) {

        return res.status(400).json({

            success: false,

            message: "Month, year and amount are required"

        });

    }


    const newBudget = {

        id:
            data.budgets.length > 0
                ? data.budgets[data.budgets.length - 1].id + 1
                : 1,

        month,

        year: Number(year),

        amount: Number(amount)

    };


    data.budgets.push(newBudget);


    res.status(201).json({

        success: true,

        message: "Budget created successfully",

        budget: newBudget

    });

});


module.exports = router;