const express = require("express");
const router = express.Router();
// Import controller functions
const {
    getSellerProfile,
    updateSellerProfile,
    getSellerProducts,
} = require("../controllers/sellerController");
const { protect, restrictTo } = require("../controllers/authController");

// Import validation schemas and middleware
const { validateBody } = require("../middlewares/validationMiddleware");
const { updateSellerSchema } = require("../validators/sellerValidator");

// Protected routes
router.use(protect);

// /api/v1/sellers
router.route("/")
    .get(getSellerProfile)
    .patch(validateBody(updateSellerSchema),updateSellerProfile);
///api/v1/sellers/products
router.route("/products")
    .get(getSellerProducts);

module.exports = router;