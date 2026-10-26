export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface QRScanResult {
  id: string;
  qrCode: string;
  productName: string;
  productCode: string;
  location: LocationData;
  scannedAt: string;
  status: 'Success' | 'Pending' | 'Verified' | 'Failed';
  message: string;
  batchNumber?: string;
  manufacturer?: string;
}

export interface QRSubmitPayload {
  qrCode: string;
  location: LocationData;
  operatorNotes?: string;
}
