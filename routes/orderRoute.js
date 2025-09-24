const express = require("express");
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrder,
    updateOrderStatus,
    deleteOrder,
    completeOrder,

} = require("../controllers/orderController");

const { protect, restrictTo } = require("../controllers/authController");
const restrictToOwner = require("../middlewares/restrictToOwner");
const { validateBody, validateParams } = require("../middlewares/validationMiddleware");
const {
    createOrderSchema,
    orderIdSchema,
    updateOrderStatusSchema
} = require("../validators/orderValidator");
const Order = require("../models/orderModel");

// All routes require login
router.use(protect);

router.route("/")
    .get(getMyOrders)
    .post(validateBody(createOrderSchema), createOrder)

router.route("/:id")
    .get(
        validateParams(orderIdSchema),
        restrictToOwner(Order, "id", "user"),
        getOrder
    )
    .delete(
        validateParams(orderIdSchema),
        restrictToOwner(Order, "id", "user"),
        deleteOrder
    )

// Admin only - update order status
router.patch(
    "/:id/status",
    restrictTo("admin"),
    validateParams(orderIdSchema),
    validateBody(updateOrderStatusSchema),
    updateOrderStatus
);

module.exports = router;