const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const globaldownlineSchema = new Schema({
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default : 0
    },
    level: {
        type: Number,
        default : 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    txHash: { type: String, required: true,},
    block: { type: Number, required: true },
    timestamp: { type: Number, required: true },
});

globaldownlineSchema.index(
    { sender: 1, receiver : 1,amount :1, level : 1, txHash: 1 },
    { unique: true }
  );

const globaldownline = mongoose.model('globaldownlineincome', globaldownlineSchema);

module.exports = globaldownline;
