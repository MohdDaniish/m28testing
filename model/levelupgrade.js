const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const levelUpgradeSchema = new Schema({
  user: {
    type: String,
    required: true, 

  },
  packageId: {
    type: Number,
    required: true
  },
  amount: {
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

levelUpgradeSchema.index(
  { user: 1, packageId: 1, level:1, txHash: 1 },
  { unique: true }
);

const levelupgrade = mongoose.model('levelupgrade', levelUpgradeSchema);

module.exports = levelupgrade;
