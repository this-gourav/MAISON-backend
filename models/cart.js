const mongoose = require("mongoose");

/* ─────────────────────────────────────────────────────────────
   CART ITEM SCHEMA
   Each document in the `items` array represents one product
   the user has added to their cart.

   Fields:
   ┌─────────────┬──────────┬──────────────────────────────────────────────┐
   │ Field       │ Type     │ Description                                  │
   ├─────────────┼──────────┼──────────────────────────────────────────────┤
   │ productId   │ Number   │ Matches `id` in the frontend PRODUCTS array  │
   │ name        │ String   │ Display name  e.g. "Linen Resort Shirt"      │
   │ price       │ Number   │ Unit price in INR  e.g. 3499                 │
   │ img         │ String   │ Product image URL (shown in email + cart UI) │
   │ category    │ String   │ e.g. "Shirts", "Jeans", "Ethnic Wear"        │
   │ qty         │ Number   │ Quantity the user has added (min 1)          │
   └─────────────┴──────────┴──────────────────────────────────────────────┘
───────────────────────────────────────────────────────────── */
const cartItemSchema = new mongoose.Schema(
    {
        productId: {
            type:     Number,
            required: true,
        },
        name: {
            type:    String,
            required: true,
            trim:    true,
        },
        price: {
            type:    Number,
            required: true,
            min:     0,
        },
        img: {
            type:    String,
            default: "",
        },
        category: {
            type:    String,
            trim:    true,
            default: "",
        },
        qty: {
            type:    Number,
            default: 1,
            min:     1,       // never allow 0 — frontend removes item instead
        },
    },
    { _id: false }  // no separate _id per item — productId is the key
);

/* ─────────────────────────────────────────────────────────────
   CART SCHEMA
   One cart document per user (userId is unique).
   Re-saved on every add / remove / qty change from the frontend.
───────────────────────────────────────────────────────────── */
const cartSchema = new mongoose.Schema(
    {
        userId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "User",
            required: true,
            unique:   true,   // one cart per user
            index:    true,
        },

        /* Array of cart items — see cartItemSchema above */
        items: {
            type:    [cartItemSchema],
            default: [],
        },

        /* Computed total stored for quick reads (e.g. email sender) */
        total: {
            type:    Number,
            default: 0,
        },
    },
    { timestamps: true }   // createdAt + updatedAt auto-managed
);

/* ── Virtual: item count (sum of all qty values) ── */
cartSchema.virtual("itemCount").get(function () {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
});

/* ── Pre-save hook: keep `total` in sync automatically ── */
cartSchema.pre("save", async function () {
    this.total = this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    
});

module.exports = mongoose.model("Cart", cartSchema);
