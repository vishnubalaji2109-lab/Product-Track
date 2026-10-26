import React, { useMemo, useState } from 'react';
import { ClearOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Progress, Select, Table, TableColumnsType, Tag } from 'antd';
import { ProductSalesTableRow } from '../../types/dashboard';

interface ProductSalesTableProps {
  data: ProductSalesTableRow[];
  loading: boolean;
  onRefresh?: () => void;
}

export const ProductSalesTable: React.FC<ProductSalesTableProps> = ({
  data,
  loading,
  onRefresh,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');

  // Distinct locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.location)));
  }, [data]);

  // Client-side filtering
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.productCode.toLowerCase().includes(searchText.toLowerCase());

      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchLocation = selectedLocation === 'ALL' || item.location === selectedLocation;

      return matchSearch && matchStatus && matchLocation;
    });
  }, [data, searchText, selectedStatus, selectedLocation]);

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedStatus('ALL');
    setSelectedLocation('ALL');
  };

  const columns: TableColumnsType<ProductSalesTableRow> = [
    {
      title: 'Product Details',
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a, b) => a.productName.localeCompare(b.productName),
      render: (text: string, record: ProductSalesTableRow) => (
        <div>
          <div className="font-semibold text-slate-800 text-sm">{text}</div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Location Hub',
      dataIndex: 'location',
      key: 'location',
      sorter: (a, b) => a.location.localeCompare(b.location),
      render: (location: string) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
          {location}
        </span>
      ),
    },
    {
      title: 'Total Qty',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
      align: 'right',
      render: (val: number) => (
        <span className="font-semibold text-slate-700">{val.toLocaleString()}</span>
      ),
    },
    {
      title: 'Sold Qty',
      dataIndex: 'soldQuantity',
      key: 'soldQuantity',
      sorter: (a, b) => a.soldQuantity - b.soldQuantity,
      align: 'right',
      render: (val: number) => (
        <span className="font-semibold text-blue-600">{val.toLocaleString()}</span>
      ),
    },
    {
      title: 'Available Qty',
      dataIndex: 'availableQuantity',
      key: 'availableQuantity',
      sorter: (a, b) => a.availableQuantity - b.availableQuantity,
      align: 'right',
      render: (val: number) => (
        <span
          className={`font-semibold ${
            val === 0 ? 'text-red-500' : val <= 25 ? 'text-amber-500' : 'text-emerald-600'
          }`}
        >
          {val.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Sales %',
      dataIndex: 'salesPercentage',
      key: 'salesPercentage',
      sorter: (a, b) => a.salesPercentage - b.salesPercentage,
      width: 170,
      render: (percent: number) => {
        let strokeColor = '#10b981';
        if (percent >= 90) strokeColor = '#2563eb';
        if (percent === 100) strokeColor = '#6366f1';
        return (
          <div className="flex items-center gap-2">
            <Progress
              percent={percent}
              size="small"
              strokeColor={strokeColor}
              format={(p) => `${p}%`}
            />
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'In Stock', value: 'In Stock' },
        { text: 'Low Stock', value: 'Low Stock' },
        { text: 'Out of Stock', value: 'Out of Stock' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: 'In Stock' | 'Low Stock' | 'Out of Stock') => {
        let color = 'success';
        if (status === 'Low Stock') color = 'warning';
        if (status === 'Out of Stock') color = 'error';
        return (
          <Tag color={color} className="rounded-full px-2.5 py-0.5 text-xs font-medium">
            {status}
          </Tag>
        );
      },
    },
  ];

  return (
    <Card
      className="shadow-sm rounded-xl border border-slate-200 bg-white"
      styles={{ body: { padding: '20px' } }}
      title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
          <div>
            <h3 className="text-base font-bold text-slate-800 m-0 leading-tight">
              Product & Location Inventory Performance
            </h3>
            <p className="text-xs text-slate-400 font-normal m-0 mt-0.5">
              Live breakdown of quantities, sales metrics, and stock thresholds
            </p>
          </div>
          {onRefresh && (
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
              className="text-xs"
            >
              Refresh
            </Button>
          )}
        </div>
      }
    >
      {/* Table Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <div className="flex-1 max-w-md">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search by product name or code..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="middle"
            className="rounded-lg"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: 140 }}
            size="middle"
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'In Stock', label: 'In Stock' },
              { value: 'Low Stock', label: 'Low Stock' },
              { value: 'Out of Stock', label: 'Out of Stock' },
            ]}
          />

          {/* Location Filter */}
          <Select
            value={selectedLocation}
            onChange={setSelectedLocation}
            style={{ width: 160 }}
            size="middle"
            options={[
              { value: 'ALL', label: 'All Locations' },
              ...uniqueLocations.map((loc) => ({ value: loc, label: loc })),
            ]}
          />

          {(searchText || selectedStatus !== 'ALL' || selectedLocation !== 'ALL') && (
            <Button
              icon={<ClearOutlined />}
              onClick={handleResetFilters}
              size="middle"
              className="text-xs"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Ant Design Responsive Table */}
      <Table<ProductSalesTableRow>
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20'],
          showTotal: (total, range) => (
            <span className="text-xs text-slate-500">
              Showing {range[0]}-{range[1]} of {total} products
            </span>
          ),
        }}
        scroll={{ x: 800 }}
        rowKey="key"
        className="rounded-lg overflow-hidden border border-slate-100"
      />
    </Card>
  );
};

export default ProductSalesTable;
