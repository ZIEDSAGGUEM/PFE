const router = require("express").Router();
const Order = require("../models/Orders");
const Story = require("../models/Story");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// signup

router.post("/signup", async (req, res) => {
  const { name, email, password, picture, phone, address } = req.body;

  try {
    const user = await User.create({
      name,
      email,
      password,
      picture,
      phone,
      address,
    });
    res.json(user);
  } catch (e) {
    if (e.code === 11000) return res.status(400).send("Email déja existe");
    res.status(400).send(e.message);
  }
});

// login

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    res.json(user);
  } catch (e) {
    res.status(400).send("Vérifier Votre Données");
  }
});

//update
router.post("/update/:id", async (req, res) => {
  const userId = req.params.id;
  const userData = req.body;

  try {
    // Find the user by id and update
    const user = await User.findByIdAndUpdate(userId, userData, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get users;

router.get("/", async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).populate("orders");
    res.json(users);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// get user orders

router.get("/:id/orders", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate("orders");
    res.json(user.orders);
  } catch (e) {
    res.status(400).send(e.message);
  }
});
// update user notifcations
router.post("/:id/updateNotifications", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.notifications.forEach((notif) => {
      notif.status = "read";
    });
    user.markModified("notifications");
    await user.save();

    res.status(200).send();
  } catch (error) {
    console.error("Error updating notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/orders/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).populate("orders");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ orders: user.orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete all orders associated with the user
    await Order.deleteMany({ owner: userId });

    // Delete all stories created by the user
    await Story.deleteMany({ createdBy: userId });

    // Delete all Coupons created by the user
    await Coupon.deleteMany({ userId: userId });

    // Delete the user's account
    // Delete the user by ID
    const result = await User.deleteOne({ _id: userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:userId/order/:orderId", async (req, res) => {
  const { userId, orderId } = req.params;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find and delete the order by ID
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Return a success response
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/allCoupons", async (req, res) => {
  try {
    // Find all coupons
    const coupons = await Coupon.find().populate("userId");

    // Return the coupons
    res.status(200).json(coupons);
  } catch (error) {
    console.error("Error getting Coupons:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
