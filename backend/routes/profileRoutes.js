const express = require("express");
const { getDatabase } = require("../database/database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All profile routes are protected
router.use(authMiddleware);

// ==============================
// GET PROFILE
// ==============================
router.get("/", async (req, res) => {
    try {
        const db = getDatabase();
        
        const user = await db.get("SELECT id, name, email, created_at FROM users WHERE id = ?", [req.userId]);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load profile"
        });
    }
});

// ==============================
// UPDATE PROFILE
// ==============================
router.put("/", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        const db = getDatabase();
        
        await db.run("UPDATE users SET name = ? WHERE id = ?", [name, req.userId]);

        const updatedUser = await db.get("SELECT id, name, email, created_at FROM users WHERE id = ?", [req.userId]);

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to update profile"
        });
    }
});

module.exports = router;
