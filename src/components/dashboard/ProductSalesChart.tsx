import React, { useState } from 'react';
import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons';
import { Card, Radio, Skeleton, Tag } from 'antd';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ProductSalesData } from '../../types/dashboard';

interface ProductSalesChartProps {
  data: ProductSalesData[];
  loading: boolean;
}

export const ProductSalesChart: React.FC<ProductSalesChartProps> = ({ data, loading }) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  if (loading) {
    return (
      <Card className="shadow-sm rounded-xl border border-slate-200 h-[400px]">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  // Find top product
  const topProduct = [...data].sort((a, b) => b.salesCount - a.salesCount)[0];

  return (
    <Card
      className="shadow-sm rounded-xl border border-slate-200 bg-white"
      styles={{ body: { padding: '20px' } }}
      title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
          <div>
            <h3 className="text-base font-bold text-slate-800 m-0 leading-tight">
              Product Sales Overview
            </h3>
            <p className="text-xs text-slate-400 font-normal m-0 mt-0.5">
              Unit volume sold across core catalog items
            </p>
          </div>
          <div className="flex items-center gap-2">
            {topProduct && (
              <Tag color="cyan" className="rounded-full px-2.5">
                Top Seller: {topProduct.productName} ({topProduct.salesCount} units)
              </Tag>
            )}
            <Radio.Group
              size="small"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="bar">
                <BarChartOutlined />
              </Radio.Button>
              <Radio.Button value="line">
                <LineChartOutlined />
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>
      }
    >
      <div className="h-[300px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="productName"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value.toLocaleString()} units`, 'Units Sold']}
                labelFormatter={(label) => `Product: ${label}`}
              />
              <Bar
                dataKey="salesCount"
                name="Units Sold"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="productName"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value.toLocaleString()} units`, 'Units Sold']}
              />
              <Line
                type="monotone"
                dataKey="salesCount"
                name="Units Sold"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ProductSalesChart;
