const express = require("express");
const router  = express.Router();

const {
    signup,
    login,
    delivery,
    saveCart,
    getCart,
    clearCart,
    getOrders,
} = require("../controllers/signup");

/* ── Auth ───────────────────────────────────── */
router.post("/signup",  signup);   // POST  /api/v1/signup
router.post("/login",   login);    // POST  /api/v1/login

/* ── Cart ───────────────────────────────────── */
router.post  ("/cart/save",    saveCart);    // POST   /api/v1/cart/save
router.get   ("/cart/:userId", getCart);     // GET    /api/v1/cart/:userId
router.delete("/cart/:userId", clearCart);   // DELETE /api/v1/cart/:userId

/* ── Orders ─────────────────────────────────── */
router.post("/delivery",          delivery);    // POST  /api/v1/delivery
router.get ("/orders/:userId",    getOrders);   // GET   /api/v1/orders/:userId

module.exports = router;
