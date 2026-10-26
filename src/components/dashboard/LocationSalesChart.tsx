import React from 'react';
import { CrownOutlined } from '@ant-design/icons';
import { Card, Skeleton, Tag } from 'antd';
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
import { LocationSalesData, TopLocationInsight } from '../../types/dashboard';

interface LocationSalesChartProps {
  data: LocationSalesData[];
  insight: TopLocationInsight | null;
  loading: boolean;
}

export const LocationSalesChart: React.FC<LocationSalesChartProps> = ({
  data,
  insight,
  loading,
}) => {
  if (loading) {
    return (
      <Card className="shadow-sm rounded-xl border border-slate-200 h-[400px]">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  // Determine top sales count to highlight
  const maxSales = Math.max(...data.map((d) => d.salesCount), 0);

  return (
    <Card
      className="shadow-sm rounded-xl border border-slate-200 bg-white"
      styles={{ body: { padding: '20px' } }}
      title={
        <div className="flex items-center justify-between py-1">
          <div>
            <h3 className="text-base font-bold text-slate-800 m-0 leading-tight">
              Location-Wise Sales Distribution
            </h3>
            <p className="text-xs text-slate-400 font-normal m-0 mt-0.5">
              Regional sales distribution across key distribution hubs
            </p>
          </div>
          <Tag
            color="gold"
            icon={<CrownOutlined />}
            className="px-2.5 py-0.5 rounded-full font-medium"
          >
            Regional Analysis
          </Tag>
        </div>
      }
    >
      {/* Top Location Insight Banner */}
      {insight && (
        <div className="mb-4 p-3.5 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/80 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <CrownOutlined style={{ fontSize: '20px' }} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Top Performing Regional Hub
              </span>
              <span className="text-sm font-extrabold text-slate-800">{insight.location} Hub</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-amber-600">
              {insight.salesCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium">
              Sales ({insight.sharePercentage}% total share)
            </span>
          </div>
        </div>
      )}

      {/* Horizontal Bar Chart */}
      <div className="h-[235px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              type="category"
              dataKey="location"
              tick={{ fill: '#334155', fontSize: 13, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              width={85}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
              formatter={(value: number, _name: string, props: { payload?: LocationSalesData }) => {
                const isTop = props.payload?.salesCount === maxSales;
                return [
                  `${value.toLocaleString()} units ${isTop ? '🏆 (Top Hub)' : ''}`,
                  'Volume Sold',
                ];
              }}
            />
            <Bar dataKey="salesCount" radius={[0, 6, 6, 0]} barSize={22}>
              {data.map((entry, index) => {
                const isTop = entry.salesCount === maxSales;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isTop ? '#f59e0b' : '#3b82f6'} // Golden amber for top location (Mumbai 720)
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default LocationSalesChart;
