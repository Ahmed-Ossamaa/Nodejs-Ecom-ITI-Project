const express = require("express");
const router = express.Router();
const {
    getProfile,
    updateProfile,
    deleteAccount,
    getAllUsers
} = require("../controllers/userController");

const { protect, restrictTo } = require("../controllers/authController");
const { validateBody } = require("../middlewares/validationMiddleware");
const { updateProfileSchema } = require("../validators/userValidator");

// Protected routes (require login)
router.use(protect);

router.get("/profile", getProfile);
router.patch("/profile", validateBody(updateProfileSchema), updateProfile);
router.delete("/account", deleteAccount);

// Admin only routes
router.get("/", restrictTo("admin"), getAllUsers);

module.exports = router;