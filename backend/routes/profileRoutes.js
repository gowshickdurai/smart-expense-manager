const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All profile routes are protected
router.use(authMiddleware);

// ==============================
// GET PROFILE
// ==============================
router.get("/", async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                created_at: user.createdAt
            }
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
        
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { name },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                created_at: updatedUser.createdAt
            }
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
