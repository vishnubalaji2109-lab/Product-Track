import React from 'react';
import {
  CheckCircleOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Card, Skeleton } from 'antd';
import { DashboardStats } from '../../types/dashboard';

interface StatCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-sm rounded-xl border border-slate-200">
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <InboxOutlined style={{ fontSize: '24px' }} />,
      color: 'blue',
      bgColor: 'bg-blue-50 text-blue-600',
      badge: '+12% this month',
      suffix: 'units',
    },
    {
      title: 'Total Products Sold',
      value: stats.totalProductsSold,
      icon: <ShoppingCartOutlined style={{ fontSize: '24px' }} />,
      color: 'indigo',
      bgColor: 'bg-indigo-50 text-indigo-600',
      badge: '70.0% conversion',
      suffix: 'sold',
    },
    {
      title: 'Available Products',
      value: stats.availableProducts,
      icon: <CheckCircleOutlined style={{ fontSize: '24px' }} />,
      color: 'emerald',
      bgColor: 'bg-emerald-50 text-emerald-600',
      badge: 'Healthy Buffer',
      suffix: 'in stock',
    },
    {
      title: 'Total Locations',
      value: stats.totalLocations,
      icon: <EnvironmentOutlined style={{ fontSize: '24px' }} />,
      color: 'amber',
      bgColor: 'bg-amber-50 text-amber-600',
      badge: '5 Active Regions',
      suffix: 'centers',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="shadow-sm hover:shadow-md transition-shadow rounded-xl border border-slate-200 overflow-hidden bg-white"
          styles={{ body: { padding: '20px' } }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 m-0 mb-1">
                {card.title}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  {card.value.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-medium">{card.suffix}</span>
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bgColor}`}
            >
              {card.icon}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <RiseOutlined className="text-emerald-500" />
              {card.badge}
            </span>
            <span className="text-slate-400">Live Sync</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatCards;
