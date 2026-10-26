import axiosInstance from '../api/axiosInstance';
import { STORAGE_KEYS } from '../constants/authConstants';
import { initialSubmittedResults, mockCatalogProducts } from '../mock/qrData';
import { LocationData, QRScanResult } from '../types/qr';
import { SubmittedResultItem } from '../types/results';

const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK_QR_API ?? import.meta.env.VITE_USE_MOCK_API) !== 'false';

// Helper to get stored results or seed them
export const getStoredSubmittedResults = (): SubmittedResultItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SUBMITTED_RESULTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SUBMITTED_RESULTS, JSON.stringify(initialSubmittedResults));
    return initialSubmittedResults;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialSubmittedResults;
  }
};

export const qrService = {
  /**
   * Resolves a scanned QR code into product details and attaches location.
   * Can call backend POST /qr/scan or resolve from mock catalog.
   */
  async scanQRCode(qrCode: string, location: LocationData): Promise<QRScanResult> {
    if (!USE_MOCK) {
      const response = await axiosInstance.post<QRScanResult>('/qr/scan', {
        qrCode,
        location,
      });
      return response.data;
    }

    // Mock processing latency
    await new Promise((r) => setTimeout(r, 600));

    const cleanCode = qrCode.trim();
    const matchedProduct = mockCatalogProducts.find(
      (p) => p.qrCode.toUpperCase() === cleanCode.toUpperCase()
    );

    const now = new Date();

    if (matchedProduct) {
      return {
        id: `scan_${Date.now()}`,
        qrCode: matchedProduct.qrCode,
        productName: matchedProduct.productName,
        productCode: matchedProduct.productCode,
        batchNumber: matchedProduct.batchNumber,
        manufacturer: matchedProduct.manufacturer,
        location,
        scannedAt: now.toISOString(),
        status: 'Success',
        message: 'Product identity confirmed and matched in central catalog',
      };
    }

    // If it's a dynamic or custom QR code scanned
    return {
      id: `scan_${Date.now()}`,
      qrCode: cleanCode,
      productName: `Registered Asset - ${cleanCode.slice(0, 8)}`,
      productCode: `PRD-EXT-${cleanCode.slice(-4).toUpperCase()}`,
      batchNumber: `BATCH-EXT-${now.getFullYear()}`,
      manufacturer: 'Enterprise Logistics Network',
      location,
      scannedAt: now.toISOString(),
      status: 'Success',
      message: 'Barcode parsed and catalog record generated',
    };
  },

  /**
   * Submits the confirmed QR result into storage / backend
   */
  async submitQRResult(
    scanResult: QRScanResult,
    submittedBy?: string
  ): Promise<SubmittedResultItem> {
    if (!USE_MOCK) {
      const response = await axiosInstance.post<SubmittedResultItem>('/qr/submit', {
        ...scanResult,
        submittedBy,
      });
      return response.data;
    }

    // Simulated network submit latency
    await new Promise((r) => setTimeout(r, 700));

    const existingResults = getStoredSubmittedResults();
    const dateObj = new Date(scanResult.scannedAt || Date.now());

    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newItem: SubmittedResultItem = {
      id: scanResult.id || `sub_${Date.now()}`,
      sNo: existingResults.length + 1,
      qrCode: scanResult.qrCode,
      productName: scanResult.productName,
      productCode: scanResult.productCode,
      location: scanResult.location,
      scannedAt: scanResult.scannedAt,
      scannedDate: formattedDate,
      scannedTime: formattedTime,
      status: 'Success',
      message: scanResult.message,
      batchNumber: scanResult.batchNumber,
      manufacturer: scanResult.manufacturer,
      submittedBy: submittedBy || 'admin@example.com',
    };

    // Store in localStorage at the beginning of the list
    const updated = [newItem, ...existingResults].map((item, idx) => ({
      ...item,
      sNo: idx + 1,
    }));

    localStorage.setItem(STORAGE_KEYS.SUBMITTED_RESULTS, JSON.stringify(updated));

    return newItem;
  },
};

export default qrService;
