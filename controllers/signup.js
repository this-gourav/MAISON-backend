const User       = require("../models/user");
const Cart       = require("../models/cart");
const Order      = require("../models/product");
const bcrypt     = require("bcrypt");
const jwt        = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

/* ─────────────────────────────────────────────────────────────
   NODEMAILER TRANSPORTER
   Set MAIL_USER and MAIL_PASS (Gmail App Password) in .env
───────────────────────────────────────────────────────────── */
let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    family: 4,
    port:587,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});


transporter.verify((err, success) => {
     console.log( process.env.MAIL_USER),
     console.log(process.env.MAIL_PASS)

    if (err) {
        console.log("SMTP Error:", err);
    } else {
        console.log("SMTP Server is Ready");
    }
});
/* ─────────────────────────────────────────────────────────────
   EMAIL HELPER
───────────────────────────────────────────────────────────── */
async function sendOrderEmail(order) {
    const { delivery, items, total, email, _id } = order;
    console.log("Hello Jee");
    console.log(order);

    const itemRows = items.map(items => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #f0e8e0;">
            <img src="${items.img}" width="60"
              style="border-radius:4px;vertical-align:middle;margin-right:12px;" alt="${items.name}"/>
            <span style="font-size:14px;color:#1a1714;">${items.name}</span>
            <span style="display:block;font-size:11px;color:#7a7672;margin-top:2px;margin-left:72px;">${items.category}</span>
          </td>
          <td style="padding:12px;border-bottom:1px solid #f0e8e0;text-align:center;font-size:14px;color:#1a1714;">${items.qty}</td>
          <td style="padding:12px;border-bottom:1px solid #f0e8e0;text-align:right;font-size:14px;color:#1a1714;">
            Rs.${items.lineTotal.toLocaleString("en-IN")}
          </td>
        </tr>`).join("");
  console.log("Hello dear");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f9f4ef;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:32px auto;background:#fefefe;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:#1a1714;padding:32px 40px;text-align:center;">
          <h1 style="color:#fefefe;font-family:Georgia,serif;font-weight:300;font-size:2rem;letter-spacing:0.22em;margin:0;">MAISON</h1>
          <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;margin:6px 0 0;">Luxury Fashion</p>
        </div>
        <div style="background:#27ae60;padding:14px 40px;text-align:center;">
          <p style="color:#fff;font-size:14px;margin:0;">Order Confirmed</p>
        </div>
        <div style="padding:36px 40px 28px;">
          <h2 style="font-family:Georgia,serif;font-weight:300;font-size:1.5rem;color:#1a1714;margin:0 0 8px;">Thank you, ${delivery.FullName}!</h2>
          <p style="color:#7a7672;font-size:14px;margin:0 0 6px;">Your order has been placed. We will notify you once it ships.</p>
          <p style="color:#b0aba6;font-size:12px;margin:0 0 28px;">Order ID: <strong style="color:#1a1714;">${_id}</strong></p>
          <p style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#839788;margin:0 0 10px;">Your Items</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e8e0;border-radius:6px;overflow:hidden;margin-bottom:28px;">
            <thead>
              <tr style="background:#faf0e8;">
                <th style="padding:10px 12px;text-align:left;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#7a7672;font-weight:400;">Product</th>
                <th style="padding:10px 12px;text-align:center;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#7a7672;font-weight:400;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#7a7672;font-weight:400;">Amount</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr style="background:#faf0e8;">
                <td colspan="2" style="padding:14px 12px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7672;">Grand Total</td>
                <td style="padding:14px 12px;text-align:right;font-family:Georgia,serif;font-size:1.3rem;color:#1a1714;">Rs.${total.toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>
          <p style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#839788;margin:0 0 10px;">Delivery Address</p>
          <div style="background:#faf0e8;border-radius:6px;padding:20px 22px;margin-bottom:28px;">
            <p style="font-size:14px;color:#1a1714;margin:0;line-height:1.8;">
              <strong>${delivery.FullName}</strong><br/>
              ${delivery.Address}<br/>
              ${delivery.city}, ${delivery.State} - ${delivery.Pincode}<br/>
              Ph: ${delivery.PhoneNumber}
            </p>
          </div>
          <p style="font-size:13px;color:#7a7672;">Questions? Email <a href="mailto:hello@maisonluxury.com" style="color:#839788;">hello@maisonluxury.com</a></p>
        </div>
        <div style="background:#1a1714;padding:20px 40px;text-align:center;">
          <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">© 2025 MAISON · 12 Textile Lane, Mumbai 400001</p>
        </div>
      </div>
    </body></html>`;



     await transporter.sendMail({
        from:    `"MAISON Luxury Fashion" <${process.env.MAIL_USER}>`,
        to:      email,
        subject: `MAISON Order Confirmed - #${_id}`,
        html:html ,
    });
      
}


/* ─────────────────────────────────────────────────────────────
   SIGNUP
───────────────────────────────────────────────────────────── */
exports.signup = async (req, res) => {
    try {
        const { FullName, email, Password } = req.body;
        if (!FullName || !email || !Password)
            return res.status(400).json({ success: false, message: "All fields are required" });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return res.status(400).json({ success: false, message: "Invalid email format" });
        if (Password.length < 6)
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        if (await User.findOne({ email: email.toLowerCase() }))
            return res.status(409).json({ success: false, message: "An account with this email already exists" });

        const hashedPassword = await bcrypt.hash(Password, 10);
        const newUser = await User.create({ FullName: FullName.trim(), email: email.toLowerCase().trim(), Password: hashedPassword });

        // Create an empty Cart document for this user immediately
        await Cart.create({ userId: newUser._id, items: [], total: 0 });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: { id: newUser._id, FullName: newUser.FullName, email: newUser.email },
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ success: false, message: "Server error during signup" });
    }
};

/* ─────────────────────────────────────────────────────────────
   LOGIN — returns user + their saved cart
───────────────────────────────────────────────────────────── */
exports.login = async (req, res) => {
    try {
        const { email, Password } = req.body;
        if (!email || !Password)
            return res.status(400).json({ success: false, message: "Email and Password are required" });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ success: false, message: "No account found with this email" });
        if (!(await bcrypt.compare(Password, user.Password)))
            return res.status(403).json({ success: false, message: "Incorrect password" });

        const cartDoc = await Cart.findOne({ userId: user._id });
        const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

        res.cookie("token", token, { expires: new Date(Date.now() + 3*24*60*60*1000), httpOnly: true, sameSite: "lax" });

        return res.status(200).json({
            success: true, message: "Logged in successfully", token,
            user: { id: user._id, FullName: user.FullName, email: user.email },
            cart: cartDoc ? cartDoc.items : [],
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Server error during login" });
    }
};

/* ─────────────────────────────────────────────────────────────
   SAVE CART  POST /api/v1/cart/save
───────────────────────────────────────────────────────────── */
exports.saveCart = async (req, res) => {
    try {
        const { userId, cart } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: "userId is required" });
        if (!Array.isArray(cart)) return res.status(400).json({ success: false, message: "cart must be an array" });

        const cartDoc = await Cart.findOneAndUpdate(
            { userId },
            { items: cart },
            { new: true, upsert: true, runValidators: true }
        );
        await cartDoc.save(); // triggers pre-save to recompute total

        return res.status(200).json({ success: true, message: "Cart saved", cart: cartDoc.items, total: cartDoc.total });
    } catch (error) {
        console.error("Save cart error:", error);
        return res.status(500).json({ success: false, message: "Failed to save cart" });
    }
};

/* ─────────────────────────────────────────────────────────────
   GET CART  GET /api/v1/cart/:userId
───────────────────────────────────────────────────────────── */
exports.getCart = async (req, res) => {
    try {
        const cartDoc = await Cart.findOne({ userId: req.params.userId });
        return res.status(200).json({ success: true, cart: cartDoc ? cartDoc.items : [], total: cartDoc ? cartDoc.total : 0 });
    } catch (error) {
        console.error("Get cart error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch cart" });
    }
};

/* ─────────────────────────────────────────────────────────────
   CLEAR CART  DELETE /api/v1/cart/:userId
───────────────────────────────────────────────────────────── */
exports.clearCart = async (req, res) => {
    try {
        await Cart.findOneAndUpdate({ userId: req.params.userId }, { items: [], total: 0 }, { new: true });
        return res.status(200).json({ success: true, message: "Cart cleared" });
    } catch (error) {
        console.error("Clear cart error:", error);
        return res.status(500).json({ success: false, message: "Failed to clear cart" });
    }
};

/* ─────────────────────────────────────────────────────────────
   DELIVERY + PLACE ORDER  POST /api/v1/delivery
───────────────────────────────────────────────────────────── */
exports.delivery = async (req, res) => {
    try {
        const { FullName, PhoneNumber, email, Address, city, State, Pincode } = req.body;

        const missing = [];
        if (!FullName?.trim())    missing.push("Full Name");
        if (!PhoneNumber?.trim()) missing.push("Phone Number");
        if (!email?.trim())       missing.push("Email");
        if (!Address?.trim())     missing.push("Address");
        if (!city?.trim())        missing.push("City");
        if (!State?.trim())       missing.push("State");
        if (!Pincode?.trim())     missing.push("Pincode");
        if (missing.length)
            return res.status(400).json({ success: false, message: `Please fill in: ${missing.join(", ")}` });

        if (!/^\d{10}$/.test(PhoneNumber.trim()))
            return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
        if (!/^\d{6}$/.test(Pincode.trim()))
            return res.status(400).json({ success: false, message: "Pincode must be exactly 6 digits" });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ success: false, message: "User not found. Please log in first." });

        const cartDoc = await Cart.findOne({ userId: user._id });
        const cartItems = cartDoc?.items || [];
        if (!cartItems.length)
            return res.status(400).json({ success: false, message: "Your cart is empty." });

        // Save delivery address on user
        Object.assign(user, { FullName: FullName.trim(), PhoneNumber: PhoneNumber.trim(), Address: Address.trim(), city: city.trim(), State: State.trim(), Pincode: Pincode.trim() });
        await user.save();


        

        // Create permanent Order record
       
        const order = await Order.create({
            userId:   user._id,
            email:    email.toLowerCase(),
            items:    cartItems.map(i => ({ productId: i.productId, name: i.name, price: i.price, img: i.img, category: i.category, qty: i.qty})),
            delivery: { FullName: FullName.trim(), PhoneNumber: PhoneNumber.trim(), Address: Address.trim(), city: city.trim(), State: State.trim(), Pincode: Pincode.trim() },
            status:   "confirmed",
        });

        // Clear cart
        cartDoc.items = [];
        cartDoc.total = 0;
        await cartDoc.save();

        // Send email non-blocking
         const plainOrder = order.toObject();
        sendOrderEmail(plainOrder).then(async () => {
            order.emailSent = true;
            console.log("hello");
            await order.save();
        }).catch(err => console.error("Email failed (order still saved):", err));

        return res.status(200).json({
            success: true,
            message: "Order placed! Confirmation email sent.",
            orderId: plainOrder._id,
            total:   plainOrder.total,
        });
    } catch (error) {
        console.error("Delivery error:", error);
        return res.status(500).json({ success: false, message: "Server error while placing order" });
    }
};

/* ─────────────────────────────────────────────────────────────
   GET ORDERS  GET /api/v1/orders/:userId
───────────────────────────────────────────────────────────── */
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 }).lean();
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Get orders error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};
