const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Référence vers le modèle d'utilisateur
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true, // Assure que chaque code de coupon est unique
  },

  discountValue: {
    type: Number,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false, // Par défaut, le coupon est actif
  },
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
