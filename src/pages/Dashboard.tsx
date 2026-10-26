import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileTextOutlined, ReloadOutlined, ScanOutlined } from '@ant-design/icons';
import { Alert, Button, message } from 'antd';
import { LocationSalesChart } from '../components/dashboard/LocationSalesChart';
import { ProductAvailabilityChart } from '../components/dashboard/ProductAvailabilityChart';
import { ProductSalesChart } from '../components/dashboard/ProductSalesChart';
import { ProductSalesTable } from '../components/dashboard/ProductSalesTable';
import { StatCards } from '../components/dashboard/StatCards';
import dashboardService from '../services/dashboardService';
import {
  DashboardStats,
  LocationSalesData,
  ProductAvailabilityData,
  ProductSalesData,
  ProductSalesTableRow,
  TopLocationInsight,
} from '../types/dashboard';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [productSales, setProductSales] = useState<ProductSalesData[]>([]);
  const [locationSales, setLocationSales] = useState<LocationSalesData[]>([]);
  const [topLocationInsight, setTopLocationInsight] = useState<TopLocationInsight | null>(null);
  const [availability, setAvailability] = useState<ProductAvailabilityData[]>([]);
  const [tableData, setTableData] = useState<ProductSalesTableRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, productSalesRes, locationSalesRes, topLocRes, availabilityRes, tableRes] =
        await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getProductSales(),
          dashboardService.getLocationSales(),
          dashboardService.getTopLocationInsight(),
          dashboardService.getProductAvailability(),
          dashboardService.getSalesTableData(),
        ]);

      setStats(statsRes);
      setProductSales(productSalesRes);
      setLocationSales(locationSalesRes);
      setTopLocationInsight(topLocRes);
      setAvailability(availabilityRes);
      setTableData(tableRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch dashboard data.';
      setError(msg);

      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight m-0">
            Operations & Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 m-0 mt-1">
            Real-time product selling statistics, location telemetry, and inventory availability
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap"> 
          <Button 
            icon={<ReloadOutlined />}
            onClick={fetchDashboardData}
            loading={loading}
            className="rounded-lg font-medium"
          >
            Refresh Data
          </Button>
          
          
          <Button
            type="primary"
            icon={<ScanOutlined />}
            onClick={() => navigate('/qr-scan')}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-md shadow-blue-500/20"
          >
            Scan Product QR
          </Button> 

          <Button
            icon={<FileTextOutlined />}
            onClick={() => navigate('/submitted-results')}
            className="rounded-lg font-medium hidden md:inline-flex" 
          >

            View Submissions
          </Button>
        </div>
         </div>

      {error && (
        <Alert
          message="Data Synchronisation Notice"
          description={error}
          type="warning"
          showIcon
          closable
          onClose={() => setError(null)} 
        />
      )}

      {/* 7 Core Panels Navigation from Reference Screenshot */}
      <div className="bg-gradient-to-r from-[#0c192c] to-[#1e293b] p-5 rounded-2xl shadow-md text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white m-0 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              StockManager System Workflows
            </h2>
            <p className="text-xs text-slate-300 m-0 mt-0.5">
              Direct access to all 7 barcode stock management, product comparison, sales counting, and export modules
            </p>
          </div>
          <span className="text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-1 rounded-full">
            7 Reference Panels Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {/* Panel 1 */}
          <div
            onClick={() => navigate('/stock-management')}
            className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl cursor-pointer border border-white/10 group"
          >
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Panel 1</div>
            <div className="text-xs font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
              Stock Management
            </div>
            <div className="text-[10px] text-slate-300 mt-1">Live Camera & Barcodes</div>
          </div>

          {/* Panel 2 */}
          <div
            onClick={() => navigate('/product-identification')}
            className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl cursor-pointer border border-white/10 group"
          >
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Panel 2</div>
            <div className="text-xs font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
              Product ID
            </div>
            <div className="text-[10px] text-slate-300 mt-1">Single Scan ID Card</div>
          </div>

          {/* Panel 3 */}
          <div
            onClick={() => navigate('/product-identification')}
            className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl cursor-pointer border border-white/10 group"
          >
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Panel 3</div>
            <div className="text-xs font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
              Identified by Day
            </div>
            <div className="text-[10px] text-slate-300 mt-1">22 Aug Daily Logs</div>
          </div>

          {/* Panel 4 */}
          <div
            onClick={() => navigate('/product-identification')}
            className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl cursor-pointer border border-white/10 group"
          >
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Panel 4</div>
            <div className="text-xs font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
              Day Comparison
            </div>
            <div className="text-[10px] text-slate-300 mt-1">Difference & Chart</div>
          </div>

          {/* Panel 5 */}
          <div
            onClick={() => navigate('/reports')}
            className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl cursor-pointer border border-white/10 group"
          >
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Panel 5</div>
            <div className="text-xs font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
              Overall Stock
            </div>
            <div className="text-[10px] text-slate-300 mt-1">Day / Week / Month</div>
          </div>

          {/* Panel 6 */}
          <div
            onClick={() => navigate('/sales-reports')}
            className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl cursor-pointer border border-white/10 group"
          >
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Panel 6</div>
            <div className="text-xs font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
              Count Sales Items
            </div>
            <div className="text-[10px] text-slate-300 mt-1">₹ 12,480 / 342 Sold</div>
          </div>

          {/* Panel 7 */}
          <div
            onClick={() => navigate('/reports')}
            className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl cursor-pointer border border-white/10 group"
          >
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Panel 7</div>
            <div className="text-xs font-bold text-white mt-1 group-hover:text-red-300 transition-colors">
              PDF & Excel Export
            </div>
            <div className="text-[10px] text-slate-300 mt-1">Official Document & Grid</div>
          </div>
        </div>
      </div>

      {/* Summary Statistic Cards */}
      <StatCards stats={stats} loading={loading} />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:  -cols-12 gap-6">
        {/* Chart 1: Product Sales Overview (Takes 7 cols on desktop) */}
        <div className="lg:col-span-7">
          <ProductSalesChart data={productSales} loading={loading} />
        </div>

        {/* Chart 3: Product Availability Donut (Takes 5 cols on desktop) */}
        <div className="lg:col-span-5">
          <ProductAvailabilityChart data={availability} loading={loading} />
        </div>
      </div>

      {/* Chart 2: Location-Wise Sales Distribution (Full Width or 12 cols) */}
      

      {/* Detailed Product Sales & Inventory Table */}
      <div>
        <ProductSalesTable data={tableData} loading={loading} onRefresh={fetchDashboardData} />
      </div>
    </div>
  );
};

export default Dashboard;

