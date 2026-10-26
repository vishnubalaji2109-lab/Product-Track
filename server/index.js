import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { SubmittedScan } from './models/SubmittedScan.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!mongoUri) {
  throw new Error('MONGODB_URI must be configured before starting the API server.');
}

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

const formatTime = (date) =>
  new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);

const toResult = (scan, sNo = 1) => {
  const scannedAt = new Date(scan.scannedAt);
  return {
    id: scan._id.toString(),
    sNo,
    qrCode: scan.qrCode,
    productName: scan.productName,
    productCode: scan.productCode,
    location: scan.location,
    scannedAt: scannedAt.toISOString(),
    scannedDate: formatDate(scannedAt),
    scannedTime: formatTime(scannedAt),
    status: scan.status,
    message: scan.message,
    batchNumber: scan.batchNumber,
    manufacturer: scan.manufacturer,
    submittedBy: scan.submittedBy,
  };
};

const isValidLocation = (location) =>
  location &&
  Number.isFinite(location.latitude) &&
  location.latitude >= -90 &&
  location.latitude <= 90 &&
  Number.isFinite(location.longitude) &&
  location.longitude >= -180 &&
  location.longitude <= 180 &&
  Number.isFinite(location.accuracy) &&
  location.accuracy >= 0 &&
  typeof location.timestamp === 'string';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.post('/api/qr/scan', (request, response) => {
  const qrCode = typeof request.body?.qrCode === 'string' ? request.body.qrCode.trim() : '';
  const { location } = request.body || {};

  if (qrCode.length < 3 || !isValidLocation(location)) {
    return response.status(400).json({ message: 'A valid QR code and location are required.' });
  }

  const now = new Date();
  return response.json({
    id: `scan_${now.getTime()}`,
    qrCode,
    productName: `Registered Asset - ${qrCode.slice(0, 8)}`,
    productCode: `PRD-EXT-${qrCode.slice(-4).toUpperCase()}`,
    batchNumber: `BATCH-EXT-${now.getFullYear()}`,
    manufacturer: 'Enterprise Logistics Network',
    location,
    scannedAt: now.toISOString(),
    status: 'Success',
    message: 'Barcode parsed and catalog record generated',
  });
});

app.post('/api/qr/submit', async (request, response) => {
  const scan = request.body || {};
  const qrCode = typeof scan.qrCode === 'string' ? scan.qrCode.trim() : '';
  const scannedAt = new Date(scan.scannedAt);

  if (
    qrCode.length < 3 ||
    typeof scan.productName !== 'string' ||
    !scan.productName.trim() ||
    typeof scan.productCode !== 'string' ||
    !scan.productCode.trim() ||
    !isValidLocation(scan.location) ||
    !Number.isFinite(scannedAt.getTime())
  ) {
    return response.status(400).json({ message: 'The submitted scan is incomplete or invalid.' });
  }

  const saved = await SubmittedScan.create({
    qrCode,
    productName: scan.productName.trim(),
    productCode: scan.productCode.trim(),
    location: scan.location,
    scannedAt,
    status: scan.status || 'Success',
    message: typeof scan.message === 'string' ? scan.message : 'Scan submitted',
    batchNumber: scan.batchNumber,
    manufacturer: scan.manufacturer,
    submittedBy: scan.submittedBy,
  });

  return response.status(201).json(toResult(saved));
});

app.get('/api/qr/results', async (request, response) => {
  const query = {};
  const searchQuery = String(request.query.searchQuery || '').trim();
  const productName = String(request.query.productName || '').trim();

  if (searchQuery) {
    const search = new RegExp(escapeRegex(searchQuery), 'i');
    query.$or = [{ qrCode: search }, { productName: search }, { productCode: search }];
  }

  if (request.query.status && request.query.status !== 'All') {
    query.status = request.query.status;
  }

  if (productName && productName !== 'All') {
    query.productName = new RegExp(escapeRegex(productName), 'i');
  }

  if (request.query.startDate || request.query.endDate) {
    query.scannedAt = {};
    if (request.query.startDate) {
      const startDate = new Date(String(request.query.startDate));
      if (!Number.isFinite(startDate.getTime())) {
        return response.status(400).json({ message: 'Invalid startDate filter.' });
      }
      query.scannedAt.$gte = startDate;
    }
    if (request.query.endDate) {
      const endDate = new Date(String(request.query.endDate));
      if (!Number.isFinite(endDate.getTime())) {
        return response.status(400).json({ message: 'Invalid endDate filter.' });
      }
      query.scannedAt.$lte = endDate;
    }
  }

  const scans = await SubmittedScan.find(query).sort({ scannedAt: -1, _id: -1 }).lean();
  return response.json(scans.map((scan, index) => toResult(scan, index + 1)));
});

app.get('/api/qr/results/:id', async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ message: 'Invalid scan ID.' });
  }

  const scan = await SubmittedScan.findById(request.params.id).lean();
  if (!scan) {
    return response.status(404).json({ message: 'Scan result not found.' });
  }
  return response.json(toResult(scan));
});

app.delete('/api/qr/results/:id', async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ message: 'Invalid scan ID.' });
  }

  const deleted = await SubmittedScan.findByIdAndDelete(request.params.id);
  if (!deleted) {
    return response.status(404).json({ message: 'Scan result not found.' });
  }
  return response.status(204).end();
});

app.use((error, _request, response, _next) => {
  console.error('API request failed:', error);
  const status = error instanceof mongoose.Error.ValidationError ? 400 : 500;
  return response.status(status).json({
    message:
      status === 400 ? 'The submitted data is invalid.' : 'An unexpected API error occurred.',
  });
});

try {
  await mongoose.connect(mongoUri);
  app.listen(port, '0.0.0.0', () => {
    console.log(`ProductTrack API listening on port ${port}`);
  });
} catch (error) {
  console.error('Could not connect to MongoDB:', error);
  process.exitCode = 1;
}
