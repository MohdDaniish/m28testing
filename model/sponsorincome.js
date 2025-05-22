const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sponsorIncomeSchema = new Schema({
  sender: {
    type: String,
    required: true, 

  },
  reciever: {
    type: String,
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
  txHash: { type: String, required: true, },
  block: { type: Number, required: true },
  timestamp: { type: Number, required: true },
});

sponsorIncomeSchema.index(
  { sender: 1, reciever: 1, usdAmt: 1, polAmt : 1, txHash: 1 },
  { unique: true }
);

const SponsorIncome = mongoose.model('SponsorIncome', sponsorIncomeSchema);

module.exports = SponsorIncome;
