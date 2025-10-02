import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    provider: { type: String, default: 'razorpay' },

    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
    orderId:   { type: String, index: true },
    // removed index: true here to avoid duplicate index warning
    paymentId: { type: String },  

    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
    },

    /** Store integer paise (raw from Razorpay) */
    amountPaise: { type: Number, required: true, min: 1 },

    /** Convenience: rupees (derived from paise, float with 2 decimals) */
    amount: { type: Number, required: true, min: 0.01 },

    currency: { type: String, default: 'INR', uppercase: true },
    method:   { type: String },
    email:    { type: String, lowercase: true, trim: true },
    contact:  { type: String, trim: true },

    /** Keep full payload for audits/debugging */
    raw: { type: Object },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Keep `amount` & `amountPaise` in sync
 */
paymentSchema.pre('validate', function (next) {
  if (this.amountPaise != null && (this.amount == null || this.amount === 0)) {
    this.amount = +(this.amountPaise / 100).toFixed(2);
  }
  if (this.amount != null && (this.amountPaise == null || this.amountPaise === 0)) {
    this.amountPaise = Math.round(this.amount * 100);
  }
  next();
});

/**
 * Optional: Alias to always get rupees
 */
paymentSchema.virtual('amountRupees').get(function () {
  return this.amount;
});

/**
 * === NEW ===
 * Ensure no duplicate Payment records for the same paymentId
 */
paymentSchema.index({ paymentId: 1 }, { unique: true });

export default mongoose.model('Payment', paymentSchema);
