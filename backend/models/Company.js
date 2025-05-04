const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subsidiarySchema = new Schema({
  _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  name: { type: String, required: true },
  location: String,
  type: { type: String, enum: ["building", "department"], default: "building" },
  isChildOf: { type: Schema.Types.ObjectId, default: null },
  workHoursDay: { type: Number, default: 8 },
  approvedHolidayDays: {
    type: Number,
    default: 30,
    min: [0, "Urlaubstage dürfen nicht negativ sein"],
  },
  publicHolidaysYear: {
    type: Number,
    default: 12,
    min: [0, "Feiertage/Jahr dürfen nicht negativ sein"],
  },
  avgSickDaysYear: {
    type: Number,
    default: 10,
    min: [0, "Krankheitstage dürfen nicht negativ sein"],
  },
  workdaysWeek: { type: Number, default: 5 },
  maxLoad: { type: Number, default: 85 },
  country: { type: String, default: "" },
  timezone: { type: String, default: "" },
  currency: { type: String, default: "EUR" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  subsidiaries: [{ type: Schema.Types.Mixed }],
});

const companySchema = new Schema({
  name: { type: String, required: true },
  location: String,
  workHoursDay: { type: Number, default: 8 },
  approvedHolidayDays: {
    type: Number,
    default: 30,
    min: [0, "Urlaubstage dürfen nicht negativ sein"],
  },
  publicHolidaysYear: {
    type: Number,
    default: 12,
    min: [0, "Feiertage/Jahr dürfen nicht negativ sein"],
  },
  avgSickDaysYear: {
    type: Number,
    default: 10,
    min: [0, "Krankheitstage dürfen nicht negativ sein"],
  },
  workdaysWeek: { type: Number, default: 5 },
  maxLoad: { type: Number, default: 85 },
  country: { type: String, default: "" },
  timezone: { type: String, default: "" },
  currency: { type: String, default: "EUR" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  subsidiaries: [subsidiarySchema],
});

companySchema.virtual("workdaysYear").get(function () {
  return (
    (365 / 7) * this.workdaysWeek -
    this.avgSickDaysYear -
    this.approvedHolidayDays -
    this.publicHolidaysYear
  );
});

companySchema.virtual("workHoursYear").get(function () {
  return this.workdaysYear * this.workHoursDay;
});

companySchema.virtual("workHoursYearMaxLoad").get(function () {
  return this.workHoursYear * (this.maxLoad / 100);
});

companySchema.virtual("workHoursDayMaxLoad").get(function () {
  return this.workHoursYearMaxLoad / 365;
});

subsidiarySchema.virtual("workdaysYear").get(function () {
  return (
    (365 / 7) * this.workdaysWeek -
    this.avgSickDaysYear -
    this.approvedHolidayDays -
    this.publicHolidaysYear
  );
});

subsidiarySchema.virtual("workHoursYear").get(function () {
  return this.workdaysYear * this.workHoursDay;
});

subsidiarySchema.virtual("workHoursYearMaxLoad").get(function () {
  return this.workHoursYear * (this.maxLoad / 100);
});

subsidiarySchema.virtual("workHoursDayMaxLoad").get(function () {
  return this.workHoursYearMaxLoad / 365;
});

// Middleware zum Aktualisieren von updatedAt bei jedem Speichern
companySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

subsidiarySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Company = mongoose.model("Company", companySchema);

module.exports = Company;