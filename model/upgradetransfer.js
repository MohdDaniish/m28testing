const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const upgradetransferSchema = new Schema({
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

upgradetransferSchema.index(
  { user: 1, txHash: 1 },
  { unique: true }
);


const upgradetransfer = mongoose.model('upgradetransfer', upgradetransferSchema);

module.exports = upgradetransfer;