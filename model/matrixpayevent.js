const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matrixpaySchema = new Schema({
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

matrixpaySchema.index(
  { fromID: 1, toID: 1, txHash: 1 },
  { unique: true }
);


const matrixpay = mongoose.model('matrixpay', matrixpaySchema);

module.exports = matrixpay;
