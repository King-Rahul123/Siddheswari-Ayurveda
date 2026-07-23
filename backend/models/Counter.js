const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  lastId: { type: Number, default: 0 }
});

const Counter = mongoose.model("Counter", counterSchema);

const getNextSequence = async (sequenceName) => {
  const counter = await Counter.findOneAndUpdate(
    { name: sequenceName },
    { $inc: { lastId: 1 } },
    { new: true, upsert: true }
  );
  return counter.lastId;
};

const getCurrentSequence = async (sequenceName) => {
  const counter = await Counter.findOne({ name: sequenceName });
  return counter ? counter.lastId : 0;
};

module.exports = { Counter, getNextSequence, getCurrentSequence };
