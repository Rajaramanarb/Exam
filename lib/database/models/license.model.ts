import { Schema, model, models } from "mongoose";

const LicenseSchema = new Schema({
  text: String,
  version: { type: Number, default: 1 },
});

const License = models?.License || model('License', LicenseSchema);

export default License;
