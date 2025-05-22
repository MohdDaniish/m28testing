const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);


const Registration = new mongoose.Schema(
  {
    user: { type: String, required: true, unique: true },
    referrerId: { type: String, required: true,trim:true },
    referrer: { type: String, required: true },
    id: {type: Number,},
    userId: {
      type: String,
      index: { unique: true },
    },
    uId: { type: Number, required: true },
    rId: { type: Number, required: true },
    wallet_income: {type: Number, default : 0},
    txHash: { type: String, required: true},
    block: { type: Number, required: true },
    timestamp: { type: Number, required: true },
    cal_status:{type:Number,default:0},
    teamBusinessnew:{
    type:Number,default:0
    }
  },
  { timestamps: true, collection: "Registration" }
);

Registration.index(
  { user: 1, referrer: 1, txHash: 1 },
  { unique: true }
);

Registration.plugin(AutoIncrement, { inc_field: 'id' });


module.exports = mongoose.model("Registration", Registration);