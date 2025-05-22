const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const createwalletfundSchema = new Schema({
  
  packageId: {
    type: Number,
    required: true
  },
  usdAmount: {
    type: Number,
    default: 0
  },
  POLCoinAmt: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  txHash: { type: String, required: true }
});

createwalletfundSchema.index(
  { user: 1, packageId: 1, txHash: 1 },
  { unique: true }
);

const createwalletfund = mongoose.model('createwalletfund', createwalletfundSchema);

module.exports = createwalletfund;
