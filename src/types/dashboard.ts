export interface DashboardStats {
  totalProducts: number;
  totalProductsSold: number;
  availableProducts: number;
  totalLocations: number;
  salesGrowthPercentage: number;
  inventoryHealthPercentage: number;
}

export interface ProductSalesData {
  productName: string;
  productCode: string;
  salesCount: number;
  revenue: number;
}

export interface LocationSalesData {
  location: string;
  salesCount: number;
  isTopLocation?: boolean;
}

export interface TopLocationInsight {
  location: string;
  salesCount: number;
  sharePercentage: number;
}

export interface ProductAvailabilityData {
  category: 'Available' | 'Sold' | 'Out of Stock';
  count: number;
  color: string;
}

export interface ProductSalesTableRow {
  key: string;
  id: string;
  productName: string;
  productCode: string;
  location: string;
  totalQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  salesPercentage: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}
