export interface StockProduct {
  id: string;
  code: string; // e.g. FM001
  name: string; // e.g. Fresh Milk 1L
  category: 'Dairy' | 'Snacks' | 'Bakery' | 'Beverages' | 'Pantry' | 'Personal Care';
  brand: string; // e.g. CrunchyBites
  packSize: string; // e.g. 50 g, 1L
  mrp: number; // in INR
  currentStock: number;
  unit: string; // e.g. Pack, Loaf, Bottle
  minThreshold: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string; // e.g. 22 Aug 2026 10:24 AM
  barcode: string;
  imageUrl: string;
  batchNo?: string;
  mfgDate?: string;
  expiryDate?: string;
}

export interface RecentScanRecord {
  sNo: number;
  id: string;
  dateTime: string;
  productCode: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface DailyIdentifiedRecord {
  sNo: number;
  id: string;
  date: string;
  productCode: string;
  productName: string;
  quantity: number;
  time: string;
  operator: string;
}

export interface ProductComparisonRecord {
  date: string;
  quantity: number;
  difference: number | null; // null for base day, positive/negative number
}

export interface StockOverviewStats {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
}

export interface SalesSummaryStats {
  totalSales: number;
  totalItemsSold: number;
  avgSaleValue: number;
}

export interface SalesProductRow {
  key: string;
  productName: string;
  itemsSold: number;
  salesAmount: number;
}

export interface ReportTableRow {
  key: string;
  date: string;
  productName: string;
  quantity: number;
  salesAmount: number;
}
