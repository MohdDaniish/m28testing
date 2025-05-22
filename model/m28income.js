const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const m28IncomeSchema = new Schema({
  sender: {
    type: String,
    required: true, 

  },
  receiver: {
    type: String,
    required: true
  },
  packageId: {
    type: Number,
    required: true
  },
  usdAmt: {
    type: Number,
    required: true
  },
  polAmt: {
    type: Number,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  txHash: { type: String, required: true, },
  block: { type: Number, required: true },
  timestamp: { type: Number, required: true },
});

m28IncomeSchema.index(
  { sender: 1, receiver: 1, usdAmt: 1, polAmt : 1, txHash: 1 },
  { unique: true }
);

const m28income = mongoose.model('m28income', m28IncomeSchema);

module.exports = m28income;
