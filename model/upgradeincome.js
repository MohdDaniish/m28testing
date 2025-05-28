const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const upgradeIncomeSchema = new Schema({
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
  amount: {
    type: Number,
    required: true
  },
  txHash: { type: String, required: true, },
  block: { type: Number, required: true },
  timestamp: { type: Number, required: true },
});

upgradeIncomeSchema.index(
  { sender: 1, receiver: 1, amount: 1, txHash: 1 },
  { unique: true }
);

const upgradeincome = mongoose.model('upgradeincome', upgradeIncomeSchema);

module.exports = upgradeincome;
