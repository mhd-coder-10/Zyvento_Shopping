// Counter model - Shared across all entities that need sequential codes
// Used by: user.model.js (user_code), seller.model.js (seller_code)

const mongoose = require('mongoose');

const counter_schema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        seq: { type: Number, default: 0 },
    },
    { versionKey: false }
);

module.exports =
    mongoose.models.Counter || mongoose.model('Counter', counter_schema);