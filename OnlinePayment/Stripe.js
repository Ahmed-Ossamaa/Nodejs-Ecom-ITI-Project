const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createStripePayment = asyncHandler(async (req, res, next) => {
    const { amount, currency = 'usd' } = req.body;
    
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Amount in cents--- or piasters "EGP"
            currency: currency,
            metadata: {
                userId: req.user._id.toString(),
                orderId: req.body.orderId || ''
            }
        });
        
        res.status(200).json({
            success: true,
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id
        });
    } catch (error) {
        return next(new ApiError(error.message, 400));
    }
});

