const mongoose = require("mongoose");

/* ─────────────────────────────────────────────────────────────
   ORDER ITEM SCHEMA
   Snapshot of what was in the cart at the moment of purchase.
   Stored separately so product data changes don't affect history.

   Fields:
   ┌─────────────┬──────────┬──────────────────────────────────────────────┐
   │ Field       │ Type     │ Description                                  │
   ├─────────────┼──────────┼──────────────────────────────────────────────┤
   │ productId   │ Number   │ Original product ID from frontend            │
   │ name        │ String   │ Product name at time of order                │
   │ price       │ Number   │ Unit price at time of order (INR)            │
   │ img         │ String   │ Image URL — used in email confirmation       │
   │ category    │ String   │ Product category                             │
   │ qty         │ Number   │ Quantity ordered                             │
   │ lineTotal   │ Number   │ price × qty  (auto-computed in pre-save)     │
   └─────────────┴──────────┴──────────────────────────────────────────────┘
───────────────────────────────────────────────────────────── */
const orderItemSchema = new mongoose.Schema(
    {
        productId: { type: Number,  required: true },
        name:      { type: String,  required: true, trim: true },
        price:     { type: Number,  required: true, min: 0 },
        img:       { type: String,  default: "" },
        category:  { type: String,  default: "" },
        qty:       { type: Number,  required: true, min: 1 },
        lineTotal: { type: Number,  default: 0 },   // filled by pre-save hook
    },
    { _id: false }
);

/* ─────────────────────────────────────────────────────────────
   DELIVERY ADDRESS SUB-SCHEMA
   Snapshot of the address the user entered at checkout.
───────────────────────────────────────────────────────────── */
const deliverySchema = new mongoose.Schema(
    {
        FullName:    { type: String, required: true },
        PhoneNumber: { type: String, required: true },
        Address:     { type: String, required: true },
        city:        { type: String, required: true },
        State:       { type: String, required: true },
        Pincode:     { type: String, required: true },
    },
    { _id: false }
);

/* ─────────────────────────────────────────────────────────────
   ORDER SCHEMA

   Fields:
   ┌──────────────┬──────────┬──────────────────────────────────────────────┐
   │ Field        │ Type     │ Description                                  │
   ├──────────────┼──────────┼──────────────────────────────────────────────┤
   │ userId       │ ObjectId │ Ref → User._id (who placed the order)        │
   │ email        │ String   │ Email at order time (for quick lookup)       │
   │ items        │ Array    │ Snapshot of cart items — see orderItemSchema │
   │ delivery     │ Object   │ Delivery address snapshot                    │
   │ total        │ Number   │ Grand total INR (auto-computed)              │
   │ status       │ String   │ "pending" → "confirmed" → "shipped" etc.    │
   │ emailSent    │ Boolean  │ Whether confirmation email was delivered     │
   └──────────────┴──────────┴──────────────────────────────────────────────┘
───────────────────────────────────────────────────────────── */
const orderSchema = new mongoose.Schema(
    {
        userId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "User",
            required: true,
            index:    true,
        },

        email: {
            type:     String,
            required: true,
            lowercase: true,
        },

        /* Items purchased — snapshot so history never changes */
        items: {
            type:     [orderItemSchema],
            required: true,
            validate: {
                validator: arr => arr.length > 0,
                message:   "Order must have at least one item",
            },
        },

        /* Delivery address at time of order */
        delivery: {
            type:     deliverySchema,
            required: true,
        },

        /* Grand total — auto-computed by pre-save hook below */
        total: {
            type:    Number,
            default: 0,
        },

        /* Order lifecycle status */
        status: {
            type:    String,
            enum:    ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
            default: "confirmed",
        },

        /* Did the confirmation email reach the user? */
        emailSent: {
            type:    Boolean,
            default: false,
        },
    },
    { timestamps: true }   // createdAt = order placed time, updatedAt = last status change
);

/* ── Pre-save hook: compute lineTotal per item + grand total ── */
orderSchema.pre("save", async function () {
    this.items.forEach(item => { item.lineTotal = item.price * item.qty; });
    this.total = this.items.reduce((sum, i) => sum + i.lineTotal, 0);
    
});

/* ── Virtual: formatted total ── */
orderSchema.virtual("totalFormatted").get(function () {
    return `₹${this.total.toLocaleString("en-IN")}`;
});

module.exports = mongoose.model("Order", orderSchema);
