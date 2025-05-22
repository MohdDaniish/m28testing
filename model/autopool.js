const mongoose = require("mongoose");

const autoPoolSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    referrer: { type: String, required: true },
    userId : { type: String, required: true },
    referrerId : { type: String, required: true },
    directs : { type: Number, default : 0 },
    cycle: { type: Number, default: 0 },
    poolId: { type: Number, default : 1 }, 
    status: { type: Number, default : 0 }, 
  },
  { timestamps: true, collection: "AutoPool" }
);


module.exports = mongoose.model("AutoPool", autoPoolSchema);