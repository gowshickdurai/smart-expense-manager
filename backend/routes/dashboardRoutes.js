const express = require("express");

const router = express.Router();

const {
    getDatabase
} = require("../database/database");

const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware
router.use(authMiddleware);


// ==============================
// GET DASHBOARD SUMMARY
// ==============================

router.get("/summary", async (req, res) => {

    try {

        const db = getDatabase();

        // ==============================
        // CURRENT MONTH / YEAR
        // ==============================

        const now = new Date();

        const monthNumber =
            now.getMonth() + 1;

        const monthTwoDigit =
            String(monthNumber).padStart(2, "0");

        const monthName =
            now.toLocaleString("en-US", {
                month: "long"
            });

        const year =
            now.getFullYear();


        // ==============================
        // TOTAL INCOME
        // ==============================

        const incomeResult = await db.get(`
            SELECT COALESCE(SUM(amount), 0) AS totalIncome
            FROM income
            WHERE user_id = ?
        `, [req.userId]);


        // ==============================
        // TOTAL EXPENSES
        // ==============================

        const expenseResult = await db.get(`
            SELECT COALESCE(SUM(amount), 0) AS totalExpenses
            FROM expenses
            WHERE user_id = ?
        `, [req.userId]);


        // ==============================
        // CURRENT MONTH BUDGET
        // ==============================

        const budgetResult = await db.get(`
            SELECT COALESCE(SUM(amount), 0) AS totalBudget
            FROM budgets
            WHERE user_id = ?
            AND year = ?
            AND (
                month = ?
                OR month = ?
                OR LOWER(month) = LOWER(?)
            )
        `, [
            req.userId,
            year,
            String(monthNumber),
            monthTwoDigit,
            monthName
        ]);


        // ==============================
        // CONVERT TO NUMBERS
        // ==============================

        const totalIncome =
            Number(incomeResult.totalIncome) || 0;

        const totalExpenses =
            Number(expenseResult.totalExpenses) || 0;

        const totalBudget =
            Number(budgetResult.totalBudget) || 0;


        // ==============================
        // BALANCE
        // ==============================

        const balance =
            totalIncome - totalExpenses;


        // ==============================
        // BUDGET LEFT
        // ==============================

        const budgetLeft =
            Math.max(
                totalBudget - totalExpenses,
                0
            );


        // ==============================
        // BUDGET USED %
        // ==============================

        let budgetUsedPercentage = 0;

        if (totalBudget > 0) {

            budgetUsedPercentage =
                Math.round(
                    (totalExpenses / totalBudget) * 100
                );
            budgetUsedPercentage = Math.min(budgetUsedPercentage, 100);

        }


        // ==============================
        // RESPONSE
        // ==============================

        res.json({

            success: true,

            summary: {

                totalIncome:
                    totalIncome,

                totalExpenses:
                    totalExpenses,

                balance:
                    balance,

                totalBudget:
                    totalBudget,

                budgetLeft:
                    budgetLeft,

                budgetUsedPercentage:
                    budgetUsedPercentage

            }

        });


    } catch (error) {

        console.error(
            "Dashboard summary error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to load dashboard summary"

        });

    }

});


module.exports = router;