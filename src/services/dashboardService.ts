import axiosInstance from '../api/axiosInstance';
import {
  mockDashboardStats,
  mockLocationSales,
  mockProductAvailability,
  mockProductSales,
  mockProductSalesTable,
  mockTopLocationInsight,
} from '../mock/dashboardData';
import {
  DashboardStats,
  LocationSalesData,
  ProductAvailabilityData,
  ProductSalesData,
  ProductSalesTableRow,
  TopLocationInsight,
} from '../types/dashboard';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    if (!USE_MOCK) {
      const response = await axiosInstance.get<DashboardStats>('/dashboard/stats');
      return response.data;
    }
    await new Promise((r) => setTimeout(r, 350));
    return { ...mockDashboardStats };
  },

  async getProductSales(): Promise<ProductSalesData[]> {
    if (!USE_MOCK) {
      const response = await axiosInstance.get<ProductSalesData[]>('/dashboard/product-sales');
      return response.data;
    }
    await new Promise((r) => setTimeout(r, 400));
    return [...mockProductSales];
  },

  async getLocationSales(): Promise<LocationSalesData[]> {
    if (!USE_MOCK) {
      const response = await axiosInstance.get<LocationSalesData[]>('/dashboard/location-sales');
      return response.data;
    }
    await new Promise((r) => setTimeout(r, 400));
    return [...mockLocationSales];
  },

  async getTopLocationInsight(): Promise<TopLocationInsight> {
    if (!USE_MOCK) {
      const response = await axiosInstance.get<TopLocationInsight>('/dashboard/top-location');
      return response.data;
    }
    await new Promise((r) => setTimeout(r, 200));
    return { ...mockTopLocationInsight };
  },

  async getProductAvailability(): Promise<ProductAvailabilityData[]> {
    if (!USE_MOCK) {
      const response = await axiosInstance.get<ProductAvailabilityData[]>(
        '/dashboard/product-availability'
      );
      return response.data;
    }
    await new Promise((r) => setTimeout(r, 300));
    return [...mockProductAvailability];
  },

  async getSalesTableData(): Promise<ProductSalesTableRow[]> {
    if (!USE_MOCK) {
      const response = await axiosInstance.get<ProductSalesTableRow[]>('/dashboard/sales-table');
      return response.data;
    }
    await new Promise((r) => setTimeout(r, 450));
    return [...mockProductSalesTable];
  },
};

export default dashboardService;
