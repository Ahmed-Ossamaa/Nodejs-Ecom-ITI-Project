const express = require("express");
//import controller functions
const router = express.Router();
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require("../controllers/cartController");
const { protect, restrictTo } = require("../controllers/authController");
// const restrictToOwner = require("../middlewares/restrictToOwner");
const { validateBody, validateParams } = require("../middlewares/validationMiddleware");
const {
    addToCartSchema,
    updateCartItemSchema,
    cartItemIdSchema
} = require("../validators/cartValidator");
const Cart = require("../models/cartModel");

// only loged-in users
router.use(protect);

router.route("/")
    .get(restrictTo("admin", "user"),getCart)
    .post(validateBody(addToCartSchema), addToCart)
    .delete(clearCart);
    
//items by id
router.route("/items/:itemId")
    .patch(
        restrictTo("user"),
        validateParams(cartItemIdSchema),
        validateBody(updateCartItemSchema),
        updateCartItem
    )
    .delete(
        restrictTo("admin", "user"),
        validateParams(cartItemIdSchema), 
        removeFromCart
    );

module.exports = router;
