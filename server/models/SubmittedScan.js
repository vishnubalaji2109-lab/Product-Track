import mongoose from 'mongoose';

const submittedScanSchema = new mongoose.Schema(
  {
    qrCode: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    productCode: { type: String, required: true, trim: true },
    location: {
      latitude: { type: Number, required: true, min: -90, max: 90 },
      longitude: { type: Number, required: true, min: -180, max: 180 },
      accuracy: { type: Number, required: true, min: 0 },
      timestamp: { type: String, required: true },
    },
    scannedAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Success', 'Pending', 'Verified', 'Flagged'],
      default: 'Success',
    },
    message: { type: String, required: true },
    batchNumber: { type: String },
    manufacturer: { type: String },
    submittedBy: { type: String },
  },
  { timestamps: true }
);

export const SubmittedScan = mongoose.model('SubmittedScan', submittedScanSchema);
