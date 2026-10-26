import React from 'react';
import { PieChartOutlined } from '@ant-design/icons';
import { Card, Skeleton, Tag } from 'antd';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ProductAvailabilityData } from '../../types/dashboard';

interface ProductAvailabilityChartProps {
  data: ProductAvailabilityData[];
  loading: boolean;
}

export const ProductAvailabilityChart: React.FC<ProductAvailabilityChartProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <Card className="shadow-sm rounded-xl border border-slate-200 h-[380px]">
        <Skeleton active paragraph={{ rows: 7 }} />
      </Card>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card
      className="shadow-sm rounded-xl border border-slate-200 bg-white"
      styles={{ body: { padding: '20px' } }}
      title={
        <div className="flex items-center justify-between py-1">
          <div>
            <h3 className="text-base font-bold text-slate-800 m-0 leading-tight">
              Product Availability Breakdown
            </h3>
            <p className="text-xs text-slate-400 font-normal m-0 mt-0.5">
              Current inventory vs. sold ratio ({total.toLocaleString()} total units)
            </p>
          </div>
          <Tag color="purple" icon={<PieChartOutlined />} className="px-2.5 py-0.5 rounded-full">
            Inventory Health
          </Tag>
        </div>
      }
    >
      <div className="h-[280px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()} units (${((value / total) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, entry: { payload?: { value?: number } }) => (
                <span className="text-xs text-slate-600 font-medium px-1">
                  {value}:{' '}
                  <strong className="text-slate-800">
                    {entry.payload?.value?.toLocaleString() ?? ''}
                  </strong>
                </span>
              )}
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="45%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label for Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-xs font-semibold uppercase text-slate-400">Total</span>
          <span className="text-xl font-extrabold text-slate-800">{total.toLocaleString()}</span>
        </div>
      </div>
    </Card>
  );
};

export default ProductAvailabilityChart;
