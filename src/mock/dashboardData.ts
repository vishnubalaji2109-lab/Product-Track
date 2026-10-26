import {
  DashboardStats,
  LocationSalesData,
  ProductAvailabilityData,
  ProductSalesData,
  ProductSalesTableRow,
  TopLocationInsight,
} from '../types/dashboard';

export const mockDashboardStats: DashboardStats = {
  totalProducts: 1250,
  totalProductsSold: 875,
  availableProducts: 375,
  totalLocations: 25,
  salesGrowthPercentage: 14.8,
  inventoryHealthPercentage: 92.4,
};

export const mockProductSales: ProductSalesData[] = [
  { productName: 'Product A', productCode: 'PRD-001', salesCount: 250, revenue: 125000 },
  { productName: 'Product B', productCode: 'PRD-002', salesCount: 180, revenue: 99000 },
  { productName: 'Product C', productCode: 'PRD-003', salesCount: 320, revenue: 192000 },
  { productName: 'Product D', productCode: 'PRD-004', salesCount: 125, revenue: 62500 },
  { productName: 'Product E', productCode: 'PRD-005', salesCount: 210, revenue: 147000 },
];

export const mockLocationSales: LocationSalesData[] = [
  { location: 'Chennai', salesCount: 450 },
  { location: 'Bangalore', salesCount: 620 },
  { location: 'Hyderabad', salesCount: 380 },
  { location: 'Mumbai', salesCount: 720, isTopLocation: true },
  { location: 'Delhi', salesCount: 550 },
];

export const mockTopLocationInsight: TopLocationInsight = {
  location: 'Mumbai',
  salesCount: 720,
  sharePercentage: 26.5,
};

export const mockProductAvailability: ProductAvailabilityData[] = [
  { category: 'Available', count: 375, color: '#10b981' }, // emerald green
  { category: 'Sold', count: 875, color: '#3b82f6' }, // blue
  { category: 'Out of Stock', count: 50, color: '#ef4444' }, // red
];

export const mockProductSalesTable: ProductSalesTableRow[] = [
  {
    key: '1',
    id: 'row-001',
    productName: 'Product A - Eco Smart Sensor',
    productCode: 'PRD-001',
    location: 'Mumbai Hub',
    totalQuantity: 500,
    soldQuantity: 380,
    availableQuantity: 120,
    salesPercentage: 76,
    status: 'In Stock',
    lastUpdated: '2026-09-08 14:32',
  },
  {
    key: '2',
    id: 'row-002',
    productName: 'Product B - Industrial Gateway Pro',
    productCode: 'PRD-002',
    location: 'Bangalore Tech Park',
    totalQuantity: 300,
    soldQuantity: 275,
    availableQuantity: 25,
    salesPercentage: 91.6,
    status: 'Low Stock',
    lastUpdated: '2026-09-09 10:15',
  },
  {
    key: '3',
    id: 'row-003',
    productName: 'Product C - Ultra Beacon TX',
    productCode: 'PRD-003',
    location: 'Delhi Central',
    totalQuantity: 600,
    soldQuantity: 490,
    availableQuantity: 110,
    salesPercentage: 81.6,
    status: 'In Stock',
    lastUpdated: '2026-09-09 17:40',
  },
  {
    key: '4',
    id: 'row-004',
    productName: 'Product D - Optic Reader V2',
    productCode: 'PRD-004',
    location: 'Chennai Harbour',
    totalQuantity: 200,
    soldQuantity: 200,
    availableQuantity: 0,
    salesPercentage: 100,
    status: 'Out of Stock',
    lastUpdated: '2026-09-07 09:20',
  },
  {
    key: '5',
    id: 'row-005',
    productName: 'Product E - Thermal Controller X',
    productCode: 'PRD-005',
    location: 'Hyderabad Zone',
    totalQuantity: 400,
    soldQuantity: 290,
    availableQuantity: 110,
    salesPercentage: 72.5,
    status: 'In Stock',
    lastUpdated: '2026-09-10 11:05',
  },
  {
    key: '6',
    id: 'row-006',
    productName: 'Product F - Wireless Telemetry Unit',
    productCode: 'PRD-006',
    location: 'Mumbai Hub',
    totalQuantity: 350,
    soldQuantity: 340,
    availableQuantity: 10,
    salesPercentage: 97.1,
    status: 'Low Stock',
    lastUpdated: '2026-09-10 12:45',
  },
  {
    key: '7',
    id: 'row-007',
    productName: 'Product G - Digital Barcode Scanner',
    productCode: 'PRD-007',
    location: 'Bangalore Tech Park',
    totalQuantity: 450,
    soldQuantity: 310,
    availableQuantity: 140,
    salesPercentage: 68.8,
    status: 'In Stock',
    lastUpdated: '2026-09-09 16:30',
  },
  {
    key: '8',
    id: 'row-008',
    productName: 'Product H - RFID Tracking Tag',
    productCode: 'PRD-008',
    location: 'Pune Logistic Hub',
    totalQuantity: 800,
    soldQuantity: 800,
    availableQuantity: 0,
    salesPercentage: 100,
    status: 'Out of Stock',
    lastUpdated: '2026-09-08 18:10',
  },
];
