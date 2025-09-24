// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const {
    createPaymentIntent,
    confirmPayment,
    stripeWebhook
} = require("../controllers/OnlinePaymentControllers/stripePayment");

const { protect } = require("../controllers/authController");



// Webhook route 
router.post("/webhook", stripeWebhook);

// All other routes require login
router.use(protect);

router.post('/create-payment-intent', createPaymentIntent); 
router.post('/confirm-payment', confirmPayment);


module.exports = router;