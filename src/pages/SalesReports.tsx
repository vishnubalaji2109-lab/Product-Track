import React, { useCallback, useEffect, useState } from 'react';
import {
  CalendarOutlined,
  DollarCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  TagOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Segmented,
  Spin,
  Table,
  TableColumnsType,
  Tag,
  message,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import stockService from '../services/stockService';
import { SalesProductRow, SalesSummaryStats } from '../types/stockManager';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export const SalesReports: React.FC = () => {
  const [period, setPeriod] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs('2026-08-22'));
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SalesSummaryStats>({
    totalSales: 12480,
    totalItemsSold: 342,
    avgSaleValue: 36.44,
  });
  const [salesProducts, setSalesProducts] = useState<SalesProductRow[]>([]);

  const loadSalesData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await stockService.getSalesSummary(period);
      setStats(res.stats);
      setSalesProducts(res.products);
    } catch {
      message.error('Failed to load sales summary data');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadSalesData();
  }, [loadSalesData]);

  const handleView = () => {
    loadSalesData();
    message.success(
      `Viewing sales for ${selectedDate?.format('DD MMM YYYY') || 'selected date'} (${period})`
    );
  };

  const columns: TableColumnsType<SalesProductRow> = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      render: (text) => (
        <div className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          {text}
        </div>
      ),
    },
    {
      title: 'Items Sold',
      dataIndex: 'itemsSold',
      key: 'itemsSold',
      align: 'right',
      render: (qty) => (
        <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
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

  const totalSold = salesProducts.reduce((acc, curr) => acc + curr.itemsSold, 0);
  const totalAmount = salesProducts.reduce((acc, curr) => acc + curr.salesAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="shadow-sm border-slate-200 rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 m-0">
              Count Sales Product / Items by Day, Week, Month
            </h1>
            <p className="text-slate-500 text-sm mt-1 mb-0">
              Periodical revenue analysis, top selling items, and product sales distributions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Segmented Period Switcher */}
            <Segmented
              value={period}
              onChange={(val) => setPeriod(val as 'Day' | 'Week' | 'Month')}
              options={['Day', 'Week', 'Month']}
              className="bg-slate-100 p-1 font-semibold text-slate-700"
            />

            {/* Date Picker */}
            <DatePicker
              value={selectedDate}
              onChange={(d) => setSelectedDate(d)}
              format="DD MMM YYYY"
              allowClear={false}
              className="w-36 rounded-lg"
              prefix={<CalendarOutlined className="text-slate-400 mr-1" />}
            />

            {/* View Button */}
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={handleView}
              className="bg-blue-600 hover:bg-blue-700 font-medium"
            >
              View
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={loadSalesData}
              title="Refresh Data"
            />
          </div>
        </div>
      </Card>

      {/* 3 Metric Cards as shown in Panel 6 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Sales Card */}
        <Card className="shadow-sm border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Total Sales
              </span>
              <span className="text-3xl font-black text-slate-800 block mt-2">
                ₹ {stats.totalSales.toLocaleString('en-IN')}
              </span>
              <div className="flex items-center gap-1.5 mt-2">
                <Tag color="blue" className="rounded-full text-xs font-medium">
                  {period} aggregate
                </Tag>
                <span className="text-xs text-slate-400">Target 94%</span>
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center text-2xl shadow-inner">
              <DollarCircleOutlined />
            </div>
          </div>
        </Card>

        {/* Total Items Sold Card */}
        <Card className="shadow-sm border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-indigo-50/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Total Items Sold
              </span>
              <span className="text-3xl font-black text-slate-800 block mt-2">
                {stats.totalItemsSold.toLocaleString()}
              </span>
              <div className="flex items-center gap-1.5 mt-2">
                <Tag color="green" className="rounded-full text-xs font-medium">
                  +12% vs last {period.toLowerCase()}
                </Tag>
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center text-2xl shadow-inner">
              <ShoppingOutlined />
            </div>
          </div>
        </Card>

        {/* Avg. Sale Value Card */}
        <Card className="shadow-sm border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Avg. Sale Value
              </span>
              <span className="text-3xl font-black text-slate-800 block mt-2">
                ₹ {stats.avgSaleValue.toFixed(2)}
              </span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs text-slate-500 font-medium">
                  Per item transaction
                </span>
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center text-2xl shadow-inner">
              <TagOutlined />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Sales Table & Recharts Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Column (7 cols) */}
        <div className="lg:col-span-7">
          <Card
            title={
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-slate-800">
                  Product Sales Breakdown
                </span>
                <span className="text-xs text-slate-500 font-normal">
                  Date: {selectedDate?.format('22 Aug 2026')}
                </span>
              </div>
            }
            className="shadow-sm border-slate-200 rounded-xl h-full"
            styles={{ body: { padding: 0 } }}
          >
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={salesProducts}
                pagination={false}
                rowKey="key"
                className="stock-table"
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row className="bg-slate-50 font-bold">
                      <Table.Summary.Cell index={0}>
                        <span className="text-slate-900 font-black">Total</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <span className="text-slate-900 font-black px-2.5 py-1 bg-slate-200 rounded">
                          {totalSold}
                        </span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <span className="text-blue-700 font-black text-base">
                          ₹ {totalAmount.toLocaleString('en-IN')}
                        </span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Spin>
          </Card>
        </div>

        {/* Chart Column (5 cols) */}
        <div className="lg:col-span-5">
          <Card
            title={
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-slate-800">
                  Sales Revenue Distribution
                </span>
                <Tag color="blue">₹ by Product</Tag>
              </div>
            }
            className="shadow-sm border-slate-200 rounded-xl h-full"
          >
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesProducts}
                  margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="productName"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    formatter={(val: number) => [`₹ ${val.toLocaleString('en-IN')}`, 'Sales']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="salesAmount" radius={[4, 4, 0, 0]}>
                    {salesProducts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Top Performer: <b className="text-slate-800">Fresh Milk 1L</b></span>
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => {
                  stockService.exportToCSV(
                    salesProducts.map((s, i) => ({
                      key: String(i + 1),
                      date: selectedDate?.format('DD MMM YYYY') || '22 Aug 2026',
                      productName: s.productName,
                      quantity: s.itemsSold,
                      salesAmount: s.salesAmount,
                    })),
                    `Sales_Summary_${period}.csv`
                  );
                  message.success('Exported sales summary CSV');
                }}
              >
                Quick CSV
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;
