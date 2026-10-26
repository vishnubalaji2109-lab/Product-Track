import {
  DailyIdentifiedRecord,
  ProductComparisonRecord,
  RecentScanRecord,
  ReportTableRow,
  SalesProductRow,
  SalesSummaryStats,
  StockOverviewStats,
  StockProduct,
} from '../types/stockManager';
import {
  mockDailyIdentifiedRecords,
  mockProductComparisonData,
  mockRecentScans,
  mockReportTableRows,
  mockSalesProductRows,
  mockSalesSummaryStats,
  mockStockOverviewStats,
  mockStockProducts,
} from '../mock/stockManagerData';

const STOCK_STORAGE_KEY = 'stock_manager_products_v2';
const IDENTIFIED_STORAGE_KEY = 'stock_manager_daily_records';
const RECENT_SCANS_STORAGE_KEY = 'stock_manager_recent_scans';

const getStoredProducts = (): StockProduct[] => {
  const data = localStorage.getItem(STOCK_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(mockStockProducts));
    return mockStockProducts;
  }
  try {
    return JSON.parse(data);
  } catch {
    return mockStockProducts;
  }
};

const getStoredDailyRecords = (): DailyIdentifiedRecord[] => {
  const data = localStorage.getItem(IDENTIFIED_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(IDENTIFIED_STORAGE_KEY, JSON.stringify(mockDailyIdentifiedRecords));
    return mockDailyIdentifiedRecords;
  }
  try {
    return JSON.parse(data);
  } catch {
    return mockDailyIdentifiedRecords;
  }
};

export const stockService = {
  // Get all stock products
  async getProducts(): Promise<StockProduct[]> {
    await new Promise((r) => setTimeout(r, 200));
    return getStoredProducts();
  },

  // Scan or find product by barcode or code
  async scanProduct(query: string): Promise<StockProduct | null> {
    await new Promise((r) => setTimeout(r, 300));
    const clean = query.trim().toUpperCase();
    const products = getStoredProducts();
    const matched = products.find(
      (p) =>
        p.code.toUpperCase() === clean ||
        p.barcode.toUpperCase() === clean ||
        p.name.toUpperCase().includes(clean)
    );

    return matched || null;
  },

  // Add a new product to stock
  async addProduct(newProduct: Omit<StockProduct, 'id' | 'lastUpdated'>): Promise<StockProduct> {
    await new Promise((r) => setTimeout(r, 400));
    const products = getStoredProducts();
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const product: StockProduct = {
      ...newProduct,
      id: `prod-${Date.now()}`,
      lastUpdated: `${dateFormatted} ${timeFormatted}`,
    };

    const updated = [product, ...products];
    localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(updated));
    return product;
  },

  // Get daily identified records
  async getDailyIdentified(dateString?: string): Promise<DailyIdentifiedRecord[]> {
    await new Promise((r) => setTimeout(r, 250));
    const records = getStoredDailyRecords();
    if (dateString) {
      return records.filter((r) => r.date.toLowerCase().includes(dateString.toLowerCase()));
    }
    return records;
  },

  // Log an identified record
  async logIdentification(record: Omit<DailyIdentifiedRecord, 'sNo' | 'id'>): Promise<DailyIdentifiedRecord> {
    const records = getStoredDailyRecords();
    const newRecord: DailyIdentifiedRecord = {
      ...record,
      id: `rec-${Date.now()}`,
      sNo: records.length + 1,
    };
    const updated = [newRecord, ...records].map((r, i) => ({ ...r, sNo: i + 1 }));
    localStorage.setItem(IDENTIFIED_STORAGE_KEY, JSON.stringify(updated));
    return newRecord;
  },

  // Get product comparison data
  async getProductComparison(productCode: string): Promise<ProductComparisonRecord[]> {
    await new Promise((r) => setTimeout(r, 200));
    const data = mockProductComparisonData[productCode] || mockProductComparisonData['FM001'];
    return data;
  },

  // Get stock overview stats
  async getStockOverview(period: 'Day' | 'Week' | 'Month' = 'Day'): Promise<{
    stats: StockOverviewStats;
    products: StockProduct[];
  }> {
    await new Promise((r) => setTimeout(r, 250));
    const multiplier = period === 'Month' ? 1.4 : period === 'Week' ? 1.15 : 1.0;
    return {
      stats: {
        totalProducts: Math.round(mockStockOverviewStats.totalProducts * multiplier),
        totalStock: Math.round(mockStockOverviewStats.totalStock * multiplier),
        lowStockItems: mockStockOverviewStats.lowStockItems,
      },
      products: getStoredProducts(),
    };
  },

  // Get sales summary
  async getSalesSummary(period: 'Day' | 'Week' | 'Month' = 'Day'): Promise<{
    stats: SalesSummaryStats;
    products: SalesProductRow[];
  }> {
    await new Promise((r) => setTimeout(r, 250));
    const multiplier = period === 'Month' ? 28 : period === 'Week' ? 7 : 1;
    return {
      stats: {
        totalSales: mockSalesSummaryStats.totalSales * multiplier,
        totalItemsSold: mockSalesSummaryStats.totalItemsSold * multiplier,
        avgSaleValue: mockSalesSummaryStats.avgSaleValue,
      },
      products: mockSalesProductRows.map((p) => ({
        ...p,
        itemsSold: p.itemsSold * multiplier,
        salesAmount: p.salesAmount * multiplier,
      })),
    };
  },

  // Get report table rows
  async getReportData(reportType: string, _fromDate?: string, _toDate?: string): Promise<ReportTableRow[]> {
    await new Promise((r) => setTimeout(r, 300));
    if (reportType === 'Stock Report') {
      const products = getStoredProducts();
      return products.map((p, idx) => ({
        key: String(idx + 1),
        date: '22 Aug 2026',
        productName: p.name,
        quantity: p.currentStock,
        salesAmount: p.currentStock * p.mrp,
      }));
    }
    return mockReportTableRows;
  },

  // Get recent scans
  async getRecentScans(): Promise<RecentScanRecord[]> {
    await new Promise((r) => setTimeout(r, 150));
    const data = localStorage.getItem(RECENT_SCANS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(RECENT_SCANS_STORAGE_KEY, JSON.stringify(mockRecentScans));
      return mockRecentScans;
    }
    try {
      return JSON.parse(data);
    } catch {
      return mockRecentScans;
    }
  },

  // Log a new recent scan
  async addRecentScan(product: StockProduct): Promise<RecentScanRecord[]> {
    const existing = await this.getRecentScans();
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newScan: RecentScanRecord = {
      sNo: 1,
      id: `scan-${Date.now()}`,
      dateTime: `${dateFormatted} ${timeFormatted}`,
      productCode: product.code,
      productName: product.name,
      category: product.category,
      quantity: 1,
      price: product.mrp,
      status: product.status,
    };

    const updated = [newScan, ...existing].map((item, index) => ({
      ...item,
      sNo: index + 1,
    }));

    localStorage.setItem(RECENT_SCANS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Export CSV
  exportToCSV(data: ReportTableRow[], filename: string = 'Sales_Report_22Aug2026.csv') {
    const headers = ['Date,Product Name,Quantity,Sales Amount (INR)'];
    const rows = data.map((r) => `"${r.date}","${r.productName}",${r.quantity},${r.salesAmount}`);
    const totalQty = data.reduce((sum, r) => sum + r.quantity, 0);
    const totalSales = data.reduce((sum, r) => sum + r.salesAmount, 0);
    rows.push(`"Total","Total",${totalQty},${totalSales}`);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export default stockService;
