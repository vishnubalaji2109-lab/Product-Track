import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClearOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  TableColumnsType,
  Tag,
  message,
} from 'antd';
import { Dayjs } from 'dayjs';
import { ResultDetailsModal } from '../components/results/ResultDetailsModal';
import resultsService from '../services/resultsService';
import { SubmittedResultItem } from '../types/results';

const { RangePicker } = DatePicker;

export const SubmittedResults: React.FC = () => {
  const [results, setResults] = useState<SubmittedResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [productFilter, setProductFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedResult, setSelectedResult] = useState<SubmittedResultItem | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);

  const navigate = useNavigate();

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await resultsService.getSubmittedResults();
      setResults(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load results';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Filter products list for dropdown
  const uniqueProducts = useMemo(() => {
    return Array.from(new Set(results.map((r) => r.productName)));
  }, [results]);

  // Client-side filtering logic
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const q = searchText.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.qrCode.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.productCode.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesProduct = productFilter === 'ALL' || item.productName === productFilter;

      let matchesDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const itemTime = new Date(item.scannedAt).getTime();
        const startTime = dateRange[0].startOf('day').valueOf();
        const endTime = dateRange[1].endOf('day').valueOf();
        matchesDate = itemTime >= startTime && itemTime <= endTime;
      }

      return matchesSearch && matchesStatus && matchesProduct && matchesDate;
    });
  }, [results, searchText, statusFilter, productFilter, dateRange]);

  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('ALL');
    setProductFilter('ALL');
    setDateRange(null);
  };

  const handleViewDetails = (record: SubmittedResultItem) => {
    setSelectedResult(record);
    setDetailsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await resultsService.deleteResult(id);
      message.success('Record removed successfully');
      fetchResults();
    } catch (err: unknown) {
      message.error('Failed to delete record');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredResults.length === 0) {
      message.warning('No records to export');
      return;
    }

    const headers = [
      'S.No,QR Code,Product Name,Product Code,Latitude,Longitude,Accuracy,Scanned Date,Scanned Time,Status',
    ];
    const rows = filteredResults.map((r) =>
      [
        r.sNo,
        `"${r.qrCode}"`,
        `"${r.productName}"`,
        `"${r.productCode}"`,
        r.location.latitude,
        r.location.longitude,
        r.location.accuracy,
        `"${r.scannedDate}"`,
        `"${r.scannedTime}"`,
        r.status,
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `submitted_qr_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Exported CSV successfully');
  };

  const columns: TableColumnsType<SubmittedResultItem> = [
    {
      title: 'S.No',
      dataIndex: 'sNo',
      key: 'sNo',
      width: 70,
      align: 'center',
      render: (val: number) => (
        <span className="font-mono text-xs text-slate-500 font-semibold">{val}</span>
      ),
    },
    {
      title: 'QR Code',
      dataIndex: 'qrCode',
      key: 'qrCode',
      sorter: (a, b) => a.qrCode.localeCompare(b.qrCode),
      render: (code: string) => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
          {code}
        </span>
      ),
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a, b) => a.productName.localeCompare(b.productName),
      render: (name: string, record: SubmittedResultItem) => (
        <div>
          <div className="font-semibold text-slate-800 text-sm">{name}</div>
          <div className="text-xs text-slate-400">
            {record.manufacturer || 'Apex Electronics Ltd'}
          </div>
        </div>
      ),
    },
    {
      title: 'Product Code',
      dataIndex: 'productCode',
      key: 'productCode',
      sorter: (a, b) => a.productCode.localeCompare(b.productCode),
      render: (code: string) => (
        <span className="font-mono text-xs font-semibold text-blue-600">{code}</span>
      ),
    },
    {
      title: 'Latitude',
      dataIndex: ['location', 'latitude'],
      key: 'latitude',
      render: (lat: number) => (
        <span className="font-mono text-xs text-slate-600">{lat ? lat.toFixed(4) : 'N/A'}</span>
      ),
    },
    {
      title: 'Longitude',
      dataIndex: ['location', 'longitude'],
      key: 'longitude',
      render: (lng: number) => (
        <span className="font-mono text-xs text-slate-600">{lng ? lng.toFixed(4) : 'N/A'}</span>
      ),
    },
    {
      title: 'Scanned Date & Time',
      key: 'dateTime',
      sorter: (a, b) => new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime(),
      render: (_: unknown, record: SubmittedResultItem) => (
        <div className="text-xs">
          <div className="font-medium text-slate-700">{record.scannedDate}</div>
          <div className="text-slate-400">{record.scannedTime}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'Verified' || status === 'Success') color = 'success';
        if (status === 'Flagged') color = 'error';
        if (status === 'Pending') color = 'warning';
        return (
          <Tag color={color} className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase">
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 140,
      render: (_: unknown, record: SubmittedResultItem) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            className="text-xs rounded-md bg-blue-600 hover:bg-blue-700"
          >
            View Details
          </Button>
          <Popconfirm
            title="Delete Record"
            description="Are you sure you want to delete this scan entry?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, size: 'small' }}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="hover:bg-red-50"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight m-0">
              Submitted QR Scan Results
            </h1>
            <Tag color="cyan" className="rounded-full px-2.5 font-semibold">
              {filteredResults.length} Records
            </Tag>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 m-0 mt-1">
            Historical audit log of all validated barcodes and associated geographic coordinates
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchResults}
            loading={loading}
            className="rounded-lg font-medium"
          >
            Refresh
          </Button>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            className="rounded-lg font-medium"
          >
            Export CSV
          </Button>

          <Button
            type="primary"
            icon={<QrcodeOutlined />}
            onClick={() => navigate('/qr-scan')}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-md shadow-blue-500/20"
          >
            New Scan
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card
        className="shadow-sm rounded-xl border border-slate-200 bg-white"
        styles={{ body: { padding: '16px' } }}
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search by QR code, product name, or code..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="middle"
              className="rounded-lg"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 140 }}
              size="middle"
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'Success', label: 'Success' },
                { value: 'Verified', label: 'Verified' },
                { value: 'Flagged', label: 'Flagged' },
                { value: 'Pending', label: 'Pending' },
              ]}
            />

            {/* Product Filter */}
            <Select
              value={productFilter}
              onChange={setProductFilter}
              style={{ width: 170 }}
              size="middle"
              options={[
                { value: 'ALL', label: 'All Products' },
                ...uniqueProducts.map((p) => ({ value: p, label: p })),
              ]}
            />

            {/* Date Range Filter */}
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
              size="middle"
              style={{ maxWidth: 240 }}
              placeholder={['Start Date', 'End Date']}
            />

            {(searchText || statusFilter !== 'ALL' || productFilter !== 'ALL' || dateRange) && (
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
      </Card>

      {/* Table */}
      <Card
        className="shadow-sm rounded-xl border border-slate-200 bg-white overflow-hidden"
        styles={{ body: { padding: '0' } }}
      >
        <Table<SubmittedResultItem>
          columns={columns}
          dataSource={filteredResults}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 6,
            showSizeChanger: true,
            pageSizeOptions: ['6', '12', '24'],
            showTotal: (total, range) => (
              <span className="text-xs text-slate-500 pl-4">
                Showing {range[0]}-{range[1]} of {total} submitted entries
              </span>
            ),
          }}
          locale={{
            emptyText: (
              <div className="py-12">
                <Empty
                  description={
                    <div>
                      <p className="text-slate-600 font-medium m-0">
                        No submitted scan records found
                      </p>
                      <p className="text-xs text-slate-400 mt-1 mb-3">
                        Scan and submit a product QR code to view logged records here
                      </p>
                      <Button
                        type="primary"
                        onClick={() => navigate('/qr-scan')}
                        className="bg-blue-600"
                      >
                        Start Scanning
                      </Button>
                    </div>
                  }
                />
              </div>
            ),
          }}
        />
      </Card>

      {/* Reusable Result Details Modal */}
      <ResultDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        result={selectedResult}
      />
    </div>
  );
};

export default SubmittedResults;
