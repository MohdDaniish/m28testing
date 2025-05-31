const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addupgradebalanceSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    default: 0
  },
  txHash : {
    type: String,
    default : null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  timestamp:{
    type: Date,
    default: Date.now
  }
});

addupgradebalanceSchema.index(
  { user: 1, txHash: 1 },
  { unique: true }
);


const addupgradebalance = mongoose.model('addupgradebalance', addupgradebalanceSchema);

module.exports = addupgradebalance;