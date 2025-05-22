const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const withdrawalSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  polamount: {
    type: Number,
    required: true
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


const Withdrawmulti = mongoose.model('Withdrawmulti', withdrawalSchema);

module.exports = Withdrawmulti;