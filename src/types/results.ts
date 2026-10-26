import { LocationData } from './qr';

export interface SubmittedResultItem {
  id: string;
  sNo: number;
  qrCode: string;
  productName: string;
  productCode: string;
  location: LocationData;
  scannedAt: string;
  scannedDate: string;
  scannedTime: string;
  status: 'Verified' | 'Pending' | 'Success' | 'Flagged';
  message: string;
  batchNumber?: string;
  manufacturer?: string;
  submittedBy?: string;
}

export interface ResultFilterParams {
  searchQuery?: string;
  status?: string;
  productName?: string;
  startDate?: string;
  endDate?: string;
}
