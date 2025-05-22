const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const m28buySchema = new Schema({
  user: {
    type: String,
    required: true
  },
  packageId: {
    type: Number,
    default : null
  },
  expiry: {
    type: Number,
    default : null
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

m28buySchema.index(
  { user: 1, packageId: 1, expiry: 1, txHash: 1 },
  { unique: true }
);

const m28buy = mongoose.model('m28buy', m28buySchema);

module.exports = m28buy;
