const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const m28userplaceSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    default : null
  },
  place: {
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
   txHash: { type: String, required: true },
   block: { type: Number, required: true },
   timestamp: { type: Number, required: true },
});

m28userplaceSchema.index(
  { user: 1, referrer : 1, place:1, txHash: 1 },
  { unique: true }
);

const m28userplace = mongoose.model('m28userplace', m28userplaceSchema);

module.exports = m28userplace;
