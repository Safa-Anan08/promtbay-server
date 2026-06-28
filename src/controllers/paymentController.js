const Stripe = require("stripe");

const { getDB } = require("../config/db");

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

const createCheckout = async (req, res) => {
  try {
    const plan =
      req.body.plan || "pro";

    const amount =
      plan === "growth"
        ? 500
        : 900;

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        customer_email: req.user.email,

        metadata: {
          email: req.user.email,
          plan,
        },

        line_items: [
          {
            price_data: {
              currency: "usd",

              product_data: {
                name: `PromptBay ${plan.toUpperCase()}`,
              },

              unit_amount: amount,
            },

            quantity: 1,
          },
        ],

        success_url:
          "https://promptbay.vercel.app/payment/success?session_id={CHECKOUT_SESSION_ID}",

        cancel_url:
          "https://promptbay.vercel.app/payment",
      });

    res.json({
      url: session.url,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const sessionId =
      req.params.sessionId;

    console.log(
      "SESSION:",
      sessionId
    );

    const session =
      await stripe.checkout.sessions.retrieve(
        sessionId
      );

    console.log(
      "STRIPE SESSION:",
      session
    );

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (
      session.payment_status !== "paid"
    ) {
      return res.status(400).json({
        message: "Payment incomplete",
      });
    }

    const db = getDB();

    const existingUser =
      await db.collection("users").findOne({
        email: session.customer_email,
      });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const plan =
      session.metadata.plan;

    let duration = 30;

    if (plan === "growth") {
      duration = 90;
    }

    if (plan === "premium") {
      duration = 365;
    }

    const result =
      await db.collection("users").updateOne(
        {
          email: session.customer_email,
        },
        {
          $set: {
            plan,

            subscriptionStatus:
              "active",

            subscription: {
              plan,

              status: "active",

              startDate: new Date(),

              endDate: new Date(
                Date.now() +
                  duration *
                    24 *
                    60 *
                    60 *
                    1000
              ),
            },
          },
        }
      );

    await db
      .collection("payment_history")
      .insertOne({
        email: session.customer_email,

        plan,

        status: "paid",

        amount:
          session.amount_total / 100,

        currency:
          session.currency,

        durationDays:
          duration,

        stripeSessionId:
          session.id,

        createdAt: new Date(),
      });

    console.log(
      "UPDATE RESULT:",
      result
    );

    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(
      "PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};

const getPaymentHistory = async (
  req,
  res
) => {
  try {
    const db = getDB();

    const payments = await db
      .collection("payment_history")
      .find({
        email: req.user.email,
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    res.json(payments);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCheckout,
  confirmPayment,
  getPaymentHistory,
};