const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const newuserplaceSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    default : null
  },
  poolId: {
    type: Number,
    default : 0
  },
  packageId: {
    type: Number,
    default: 0
  },
  place: {
    type: Number,
    default: 0
  },
  directs : {
    type: Number,
    default: 0
  },
  cycle: {
    type: Number,
    default: 0
  },
  status : {
    type: Number,
    default: 0
  },
  reentry : {
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
  // block: { type: Number, required: true },
  // timestamp: { type: Number, required: true },
});

// newuserplaceSchema.index(
//   { user: 1, packageId: 1,place:1,cycle:1, txHash: 1 },
//   { unique: true }
// );

newuserplaceSchema.plugin(AutoIncrement, { inc_field: 'uid' });


const newuserplace = mongoose.model('newuserplace', newuserplaceSchema);

module.exports = newuserplace;
