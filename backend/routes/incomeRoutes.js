const express = require("express");

const router = express.Router();

const data = require("../data/data");


// GET ALL INCOME

router.get("/", (req, res) => {

    res.json({

        success: true,

        count: data.income.length,

        income: data.income

    });

});


// ADD INCOME

router.post("/", (req, res) => {

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


    const newIncome = {

        id:
            data.income.length > 0
                ? data.income[data.income.length - 1].id + 1
                : 1,

        amount: Number(amount),

        source,

        date

    };


    data.income.push(newIncome);


    res.status(201).json({

        success: true,

        message: "Income added successfully",

        income: newIncome

    });

});


module.exports = router;