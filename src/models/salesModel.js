const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customer: String,
  carModel: String,
  proposalNumber: Number,
  yearMonthDay: String,
  salesPrice: Number,
  cost: Number,
  bonus: Number,
  totalCost: Number,
  parentUser: String,
});

module.exports = mongoose.model('sale', saleSchema);
