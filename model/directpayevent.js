const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const directpaySchema = new Schema({
  fromID: {
    type: Number,
    required: true
  },
  toID: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }, 
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  txHash: { type: String, required: true },
  block: { type: Number, required: true },
  timestamp: { type: Number, required: true },
});

directpaySchema.index(
  { fromID: 1, toID: 1, txHash: 1 },
  { unique: true }
);


const directpay = mongoose.model('directpay', directpaySchema);

module.exports = directpay;
