import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppstoreOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilterOutlined,
  InboxOutlined,
  PrinterOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Modal,
  Segmented,
  Select,
  Spin,
  Table,
  TableColumnsType,
  Tabs,
  Tag,
  message,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import stockService from '../services/stockService';
import {
  ReportTableRow,
  StockOverviewStats,
  StockProduct,
} from '../types/stockManager';

const { RangePicker } = DatePicker;

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stock-overview' | 'export-reports'>(
    'export-reports'
  );

  // Panel 5 State (Stock Overview)
  const [stockPeriod, setStockPeriod] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [stockDate, setStockDate] = useState<Dayjs | null>(dayjs('2026-08-22'));
  const [stockLoading, setStockLoading] = useState(false);
  const [stockStats, setStockStats] = useState<StockOverviewStats>({
    totalProducts: 48,
    totalStock: 3250,
    lowStockItems:5,
  });
  const [stockProducts, setStockProducts] = useState<StockProduct[]>([]);

  // Panel 7 State (Export Reports)
  const [reportType, setReportType] = useState('Sales Report');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs('2026-08-15'),
    dayjs('2026-08-22'),
  ]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportTableRow[]>([]);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Load Panel 5 Data
  const loadStockOverview = useCallback(async () => {
    setStockLoading(true);
    try {
      const res = await stockService.getStockOverview(stockPeriod);
      setStockStats(res.stats);
      setStockProducts(res.products);
    } catch {
      message.error('Failed to load stock overview');
    } finally {
      setStockLoading(false);
    }
  }, [stockPeriod]);

  // Load Panel 7 Data
  const loadReportData = useCallback(async () => {
    setReportLoading(true);
    try {
      const res = await stockService.getReportData(reportType);
      setReportData(res);
    } catch {
      message.error('Failed to load report data');
    } finally {
      setReportLoading(false);
    }
  }, [reportType]);

  useEffect(() => {
    loadStockOverview();
  }, [loadStockOverview]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Actions for Export
  const handleExcelExport = () => {
    stockService.exportToCSV(
      reportData,
      `${reportType.replace(/\s+/g, '_')}_15Aug_22Aug_2026.csv`
    );
    message.success('Excel/CSV Export generated and downloaded successfully!');
  };

  const handlePdfExport = () => {
    setPdfModalOpen(true);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // Total calculations for Panel 7
  const totalQty = reportData.reduce((sum, r) => sum + r.quantity, 0);
  const totalSalesAmt = reportData.reduce((sum, r) => sum + r.salesAmount, 0);

  // Table Columns for Panel 5 (Stock Overview)
  const stockColumns: TableColumnsType<StockProduct> = [
    {
      title: 'S.No',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-semibold text-slate-800">{text}</div>
          <div className="text-xs text-slate-400 font-mono">{record.code}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag className="rounded-md font-medium text-slate-600">{cat}</Tag>,
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      align: 'right',
      render: (stock, record) => (
        <span className="font-bold text-slate-800">
          {stock} <span className="text-xs font-normal text-slate-400">{record.unit}</span>
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const isLow = status === 'Low Stock';
        return (
          <Tag
            color={isLow ? 'warning' : 'success'}
            className="font-semibold px-2 py-0.5 rounded-full"
            icon={isLow ? <WarningOutlined /> : <CheckCircleOutlined />}
          >
            {status}
          </Tag>
        );
      },
    },
  ];

  // Table Columns for Panel 7 (Export Reports)
  const reportColumns: TableColumnsType<ReportTableRow> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      render: (text) => <span className="text-slate-600 font-medium">{text}</span>,
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      render: (text) => <span className="font-semibold text-slate-800">{text}</span>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      render: (qty) => (
        <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
          {qty}
        </span>
      ), 
    },
    {
      title: 'Sales Amount',
      dataIndex: 'salesAmount',
      key: 'salesAmount',
      align: 'right',
      render: (amt) => (
        <span className="font-bold text-blue-700">₹ {amt.toLocaleString('en-IN')}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as 'stock-overview' | 'export-reports')}
        type="card"
        className="stock-tabs"
        items={[
          {
            key: 'export-reports',
            label: (
              <span className="font-semibold flex items-center gap-2">
                <FilePdfOutlined className="text-red-500" />
                Panel 7: PDF & Excel Export Reports
              </span>
            ),
          },
          {
            key: 'stock-overview',
            label: (
              <span className="font-semibold flex items-center gap-2">
                <InboxOutlined className="text-blue-500" />
                Panel 5: Overall Stock Management (Day / Week / Month)
              </span>
            ),
          },
        ]}
      />

      {/* ========================================================================= */}
      {/* PANEL 7: PDF & EXCEL EXPORT FOR REPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'export-reports' && (
        <div className="space-y-6">
          {/* Header Card with Controls */}
          <Card className="shadow-sm border-slate-200 rounded-xl">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 m-0">
                  PDF and Excel Export for Reports
                </h1>
                <p className="text-slate-500 text-sm mt-1 mb-0">
                  Filter historical inventory and sales records with instant PDF document and Excel spreadsheet generation
                </p>
              </div>

              {/* Action Buttons: Red PDF and Green Excel */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={handlePdfExport}
                  style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                  className="font-bold hover:brightness-110 shadow-sm"
                  size="middle"
                >
                  PDF Export
                </Button>

                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={handleExcelExport}
                  style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                  className="font-bold hover:brightness-110 shadow-sm"
                  size="middle"
                >
                  Excel Export
                </Button>
              </div>
            </div>

            {/* Filter Row matching Screenshot */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Report Type:</span>
                <Select
                  value={reportType}
                  onChange={(val) => setReportType(val)}
                  style={{ width: 160 }}
                  options={[
                    { value: 'Sales Report', label: 'Sales Report' },
                    { value: 'Stock Report', label: 'Stock Report' },
                    { value: 'Audit Log', label: 'Audit Log' },
                  ]}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Date Range:</span>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) =>
                    setDateRange(dates as [Dayjs | null, Dayjs | null])
                  }
                  format="DD MMM YYYY"
                  allowClear={false}
                  className="w-64"
                />
              </div>

              <Button
                type="primary"
                onClick={loadReportData}
                icon={<FilterOutlined />}
                className="bg-blue-600 hover:bg-blue-700 font-medium"
              >
                Generate
              </Button>
            </div>
          </Card>

          {/* Table with Data and Summary Row */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-slate-800">
                  {reportType} Data Table
                </span>
                <span className="text-xs text-slate-500 font-normal">
                  Period: 15 Aug 2026 - 22 Aug 2026
                </span>
              </div>
            }
            className="shadow-sm border-slate-200 rounded-xl"
            styles={{ body: { padding: 0 } }}
          >
            <Spin spinning={reportLoading}>
              <Table
                columns={reportColumns}
                dataSource={reportData}
                pagination={false}
                rowKey="key"
                className="stock-table"
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row className="bg-slate-100/90 font-bold border-t-2 border-slate-300">
                      <Table.Summary.Cell index={0}>
                        <span className="text-slate-900 font-black">Total</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <span className="text-slate-900 font-black">Total</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <span className="text-slate-900 font-black px-2.5 py-1 bg-slate-200 rounded">
                          {totalQty}
                        </span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <span className="text-blue-700 font-black text-base">
                          ₹ {totalSalesAmt.toLocaleString('en-IN')}
                        </span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Spin>
          </Card>

          {/* Side-by-side Visual Previews: PDF Preview & Excel Spreadsheet */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Document PDF Preview */}
            <Card
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FilePdfOutlined className="text-red-600 text-lg" />
                    <span className="font-bold text-slate-800">Visual PDF Document Preview</span>
                  </div>
                  <Button
                    size="small"
                    icon={<PrinterOutlined />}
                    onClick={handlePdfExport}
                  >
                    Expand
                  </Button>
                </div>
              }
              className="shadow-sm border-slate-200 rounded-xl overflow-hidden"
              style={{ backgroundColor: '#f8fafc' }}
            >
              <div className="bg-white border border-slate-200 shadow-md p-6 rounded-lg font-sans text-xs max-w-lg mx-auto">
                {/* PDF Header */}
                <div className="border-b-2 border-slate-800 pb-3 mb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide m-0">
                      StockManager Inc.
                    </h2>
                    <p className="text-[10px] text-slate-500 m-0">Enterprise Inventory & Sales</p>
                    <p className="text-[10px] text-slate-400 m-0">Date: 22 Aug 2026</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded text-[10px]">
                      OFFICIAL REPORT
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 m-0">Doc ID: RPT-2026-0822</p>
                  </div>
                </div>

                {/* PDF Title */} 
                <div className="text-center my-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase underline decoration-blue-500 underline-offset-4 m-0">
                    {reportType} (15 Aug 2026 - 22 Aug 2026)
                  </h3>
                </div>

                {/* Mini PDF Table */}
                <table className="w-full text-left border-collapse my-3">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50 text-[10px] text-slate-600 font-bold">
                      <th className="py-1 px-2">Date</th>
                      <th className="py-1 px-2">Product</th>
                      <th className="py-1 px-2 text-right">Qty</th>
                      <th className="py-1 px-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row) => (
                      <tr key={row.key} className="border-b border-slate-100 text-[10px]">
                        <td className="py-1 px-2 text-slate-500">{row.date}</td>
                        <td className="py-1 px-2 font-medium text-slate-800">{row.productName}</td>
                        <td className="py-1 px-2 text-right">{row.quantity}</td>
                        <td className="py-1 px-2 text-right font-medium">₹ {row.salesAmount}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-slate-800 font-bold text-[10px] bg-slate-50">
                      <td className="py-1 px-2" colSpan={2}>
                        Grand Total
                      </td>
                      <td className="py-1 px-2 text-right">{totalQty}</td>
                      <td className="py-1 px-2 text-right text-blue-800">₹ {totalSalesAmt}</td>
                    </tr>
                  </tbody>
                </table>

                {/* PDF Sign-off */}
                <div className="mt-5 pt-3 border-t border-slate-200 flex justify-between items-end text-[9px] text-slate-400">
                  <div>Generated by: StockManager Admin Console</div>
                  <div className="text-right">
                    <div className="w-24 border-b border-slate-400 mb-1" />
                    Authorized Signature
                  </div>
                </div>
              </div>
            </Card>

            {/* Right: Excel Spreadsheet Preview */}
            <Card
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileExcelOutlined className="text-emerald-600 text-lg" />
                    <span className="font-bold text-slate-800">Visual Excel Spreadsheet Grid</span>
                  </div>
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={handleExcelExport}
                  >
                    Download .CSV
                  </Button>
                </div>
              }
              className="shadow-sm border-slate-200 rounded-xl overflow-hidden"
              style={{ backgroundColor: '#f8fafc' }}
            >
              {/* Excel Application Frame */}
              <div className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-md font-mono text-[11px]">
                {/* Excel Green Header Ribbon */}
                <div className="bg-[#107c41] text-white px-3 py-1.5 flex items-center justify-between text-xs font-sans font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">XLSX</span>
                    <span>SalesReport_Aug2026.xlsx - Excel</span>
                  </div>
                  <span className="text-[10px] text-emerald-100">Formula Bar Active</span>
                </div>

                {/* Excel Formula Bar */}
                <div className="bg-slate-100 px-3 py-1 border-b border-slate-300 flex items-center gap-2 text-slate-600 text-[11px]">
                  <span className="font-bold text-slate-500">fx</span>
                  <div className="h-3.5 w-px bg-slate-300" />
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 flex-1 font-mono">
                    =SUM(D2:D6) &rarr; 12,480
                  </span>
                </div>

                {/* Spreadsheet Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-200 text-slate-700 text-center font-bold">
                        <th className="w-8 border border-slate-300 py-1 bg-slate-200 text-slate-500 font-normal"></th>
                        <th className="border border-slate-300 py-1 px-3">A</th>
                        <th className="border border-slate-300 py-1 px-3">B</th>
                        <th className="border border-slate-300 py-1 px-3">C</th>
                        <th className="border border-slate-300 py-1 px-3">D</th>
                      </tr>
                      <tr className="bg-slate-100 text-slate-800 font-semibold text-left">
                        <td className="border border-slate-300 text-center bg-slate-200 text-slate-500">1</td>
                        <td className="border border-slate-300 px-2 py-1">Date</td>
                        <td className="border border-slate-300 px-2 py-1">Product Name</td>
                        <td className="border border-slate-300 px-2 py-1 text-right">Quantity</td>
                        <td className="border border-slate-300 px-2 py-1 text-right">Sales Amount</td>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((row, idx) => (
                        <tr key={row.key} className="hover:bg-emerald-50/50">
                          <td className="border border-slate-300 text-center bg-slate-200 text-slate-500">
                            {idx + 2}
                          </td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-600">{row.date}</td>
                          <td className="border border-slate-300 px-2 py-1 font-sans text-slate-800">{row.productName}</td>
                          <td className="border border-slate-300 px-2 py-1 text-right">{row.quantity}</td>
                          <td className="border border-slate-300 px-2 py-1 text-right text-emerald-700 font-semibold">
                            {row.salesAmount}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-emerald-100 font-bold">
                        <td className="border border-slate-300 text-center bg-slate-200 text-slate-500">
                          {reportData.length + 2}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">Total</td>
                        <td className="border border-slate-300 px-2 py-1">Total</td>
                        <td className="border border-slate-300 px-2 py-1 text-right">{totalQty}</td>
                        <td className="border border-slate-300 px-2 py-1 text-right text-emerald-800">
                          {totalSalesAmt}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Sheet Tabs */}
                <div className="bg-slate-100 px-3 py-1 border-t border-slate-300 flex items-center gap-2 text-[10px]">
                  <span className="bg-white border-b-2 border-emerald-600 px-2 py-0.5 font-bold text-slate-800">
                    Sheet1 - Sales
                  </span>
                  <span className="text-slate-400 px-2 py-0.5">Sheet2</span>
                  <span className="text-slate-400 px-1">+</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PANEL 5: OVERALL STOCK MANAGEMENT BY DAY, WEEK, MONTH */}
      {/* ========================================================================= */}
      {activeTab === 'stock-overview' && (  
        <div className="space-y-6">
          {/* Header & Filter Controls */}
          <Card className="shadow-sm border-slate-200 rounded-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 m-0">
                  Overall Stock Management by Day, Week, and Month
                </h1>
                <p className="text-slate-500 text-sm mt-1 mb-0">
                  Real-time warehouse inventory levels, replenishment tracking, and stock status categorization
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Segmented
                  value={stockPeriod}
                  onChange={(val) => setStockPeriod(val as 'Day' | 'Week' | 'Month')}
                  options={['Day', 'Week', 'Month']}
                  className="bg-slate-100 p-1 font-semibold text-slate-700"
                />

                <DatePicker
                  value={stockDate}
                  onChange={(d) => setStockDate(d)}
                  format="DD MMM YYYY"
                  allowClear={false}
                  className="w-36 rounded-lg"
                  prefix={<CalendarOutlined className="text-slate-400 mr-1" />}
                />

                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={loadStockOverview}
                  className="bg-blue-600 hover:bg-blue-700 font-medium"
                >
                  View
                </Button>
          
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadStockOverview}
                  title="Refresh Inventory"
                />
              </div>
            </div>
          </Card>

          {/* 3 Metric Cards as shown in Panel 5 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Total Products */}
            <Card className="shadow-sm border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Total Products
                  </span>
                  <span className="text-3xl font-black text-slate-800 block mt-2">
                    {stockStats.totalProducts}
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Tag color="blue" className="rounded-full text-xs font-medium">
                      Active Catalog
                    </Tag>
                  </div>
                </div>
                <div className="w-13 h-13 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center text-2xl shadow-inner">
                  <AppstoreOutlined />
                </div>
              </div>
            </Card>

            {/* Total Stock */}
            <Card className="shadow-sm border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-emerald-50/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Total Stock
                  </span>
                  <span className="text-3xl font-black text-slate-800 block mt-2">
                    {stockStats.totalStock.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Tag color="green" className="rounded-full text-xs font-medium">
                      Units in Warehouse
                    </Tag>
                  </div>
                </div>
                <div className="w-13 h-13 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center text-2xl shadow-inner">
                  <InboxOutlined />
                </div>
              </div>
            </Card>

            {/* Low Stock */}
            <Card className="shadow-sm border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-amber-50/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Low Stock
                  </span>
                  <span className="text-3xl font-black text-amber-600 block mt-2">
                    {stockStats.lowStockItems}
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Tag color="warning" className="rounded-full text-xs font-medium">
                      Requires Replenishment
                    </Tag>
                  </div>
                </div>
                <div className="w-13 h-13 rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center text-2xl shadow-inner">
                  <WarningOutlined />
                </div>
              </div>
            </Card>
          </div>

          {/* Stock Table */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-slate-800">
                  Warehouse Stock Inventory
                </span>
                <span className="text-xs text-slate-500 font-normal">
                  Showing all active SKU items
                </span>
              </div>
            }
            className="shadow-sm border-slate-200 rounded-xl"
            styles={{ body: { padding: 0 } }}
          >
            <Spin spinning={stockLoading}>
              <Table
                columns={stockColumns}
                dataSource={stockProducts}
                rowKey="id"
                pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} items` }}
                className="stock-table"
              />
            </Spin>
          </Card>
        </div>
      )}  

      {/* Printable PDF Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FilePdfOutlined className="text-red-600" />
            <span>Printable Official PDF Report</span>
          </div>
        }
        open={pdfModalOpen}
        onCancel={() => setPdfModalOpen(false)}
        width={750}
        footer={[
          <Button key="close" onClick={() => setPdfModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrintPdf}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Print / Save as PDF
          </Button>,
        ]}
      >
        <div ref={printAreaRef} className="p-4 bg-white font-sans text-xs">
          <div className="border-b-2 border-slate-800 pb-3 mb-4 flex justify-between items-start">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider m-0">
                StockManager Enterprise
              </h2>
              <p className="text-xs text-slate-500 m-0">Warehouse & Retail Inventory Control System</p>
              <p className="text-xs text-slate-400 m-0">Generated: 22 Aug 2026</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded text-xs">
                CONFIDENTIAL
              </span>
              <p className="text-xs text-slate-500 mt-1 m-0">Report: {reportType}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse my-4">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-100 text-xs text-slate-700 font-bold">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Product Name</th>
                <th className="py-2 px-3 text-right">Quantity</th>
                <th className="py-2 px-3 text-right">Sales Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => ( 
                <tr key={row.key} className="border-b border-slate-100 text-xs">
                  <td className="py-2 px-3 text-slate-600">{row.date}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">{row.productName}</td>
                  <td className="py-2 px-3 text-right">{row.quantity}</td>
                  <td className="py-2 px-3 text-right font-semibold text-slate-800">
                    ₹ {row.salesAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-800 font-bold text-xs bg-slate-50">
                <td className="py-2 px-3" colSpan={2}>
                  Total
                </td>
                <td className="py-2 px-3 text-right">{totalQty}</td>
                <td className="py-2 px-3 text-right text-blue-700">
                  ₹ {totalSalesAmt.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

           <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end text-xs text-slate-400">
            <div>
              <p className="m-0">StockManager Automated Report Engine</p>
              <p className="m-0">Verified and sealed electronically</p>
            </div>
            <div className="text-right">
              <div className="w-36 border-b border-slate-400 mb-1" />
              <p className="m-0 font-medium text-slate-600">Store Manager / Auditor</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reports;
