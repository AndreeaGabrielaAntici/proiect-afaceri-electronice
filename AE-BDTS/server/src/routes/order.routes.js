const express = require("express");
const prisma = require("../prisma");
const { getValidationErrors } = require("../utils/validateUtils");
const CreateOrderSchema = require("../dtos/order.dtos/createOrder.dto");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post("/create", async (req, res) => {
  const validation = CreateOrderSchema.safeParse(req.body);

  if (!validation.success) {
    const errors = getValidationErrors(validation);

    if (errors.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: errors.join(", "), data: errors });
    }
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.userId,
    },
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "User not found", data: {} });
  }

  // Create the order in the database
  const orderData = {
    userId: req.userId,
    ...validation.data,
    status: "PENDING",
  };

  const order = await prisma.order.create({ data: orderData });

  // Assume that `validation.data.total` exists and represents the order total in decimal form.
  // Convert total from a decimal to integer cents for Stripe (e.g., 19.99 USD -> 1999 cents)
  const amountInCents = Math.round(order.total * 100);

  try {
    // Create a PaymentIntent for this order
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd", // Adjust currency if needed
      metadata: { orderId: order.id.toString() },
      // In test mode, you can set `automatic_payment_methods` so that you can easily test different payment methods.
      automatic_payment_methods: { enabled: true },
    });

    // Return the order details and the paymentIntent's client_secret to the frontend.
    // The frontend will use client_secret to confirm payment interactively with Stripe.js.
    return res.status(200).json({
      success: true,
      message: "Order created and PaymentIntent created",
      data: {
        order,
        paymentIntentClientSecret: paymentIntent.client_secret,
      },
    });
  } catch (err) {
    console.error("Stripe error: ", err);
    // If PaymentIntent creation fails, consider rolling back or marking order as failed, if needed
    return res
      .status(500)
      .json({ success: false, message: "Failed to create PaymentIntent", data: {} });
  }
});

module.exports = router;
