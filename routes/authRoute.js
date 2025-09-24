const express = require("express");
const router = express.Router();
// Import controller functions
const {
    register,
    login,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");
// Import validation schemas and middleware
const { validateBody } = require("../middlewares/validationMiddleware");
const {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} = require("../validators/authValidator");

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);

router.get("/reset-password/:token", (req, res) => {
    res.send("send new PW in body with patch request to reset PW");
});//just for testing

router.patch("/reset-password/:token", validateBody(resetPasswordSchema), resetPassword);

module.exports = router;
