const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const m28sponsorIncomeSchema = new Schema({
  sender: {
    type: String,
    required: true, 

  },
  reciever: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  packageId: {
    type: Number,
    required: true
  },
  txHash: { type: String, required: true, },
  block: { type: Number, required: true },
  timestamp: { type: Number, required: true },
});

m28sponsorIncomeSchema.index(
  { sender: 1, reciever: 1, amount: 1, txHash: 1 },
  { unique: true }
);

const m28SponsorIncome = mongoose.model('m28SponsorIncome', m28sponsorIncomeSchema);

module.exports = m28SponsorIncome;
