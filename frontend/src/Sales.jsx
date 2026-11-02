import { useEffect, useState } from 'react';
import { Button, DatePicker, Input, Modal, Space, Table, Tag, Typography, message } from 'antd';
import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import api from './api';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { search, per_page: 100 };
      if (range?.[0]) params.from = range[0].format('YYYY-MM-DD');
      if (range?.[1]) params.to = range[1].format('YYYY-MM-DD');
      const r = await api.get('/sales', { params });
      setSales(r.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, range]);

  const expandedRowRender = (record) => (
    <Table
      rowKey="id"
      dataSource={record.items}
      pagination={false}
      size="small"
      columns={[
        { title: 'Produit', dataIndex: ['product', 'name'] },
        { title: 'Quantité', dataIndex: 'quantity' },
        { title: 'Prix unit.', dataIndex: 'unit_price', render: (v) => `${Number(v).toFixed(2)} €` },
        { title: 'Sous-total', dataIndex: 'subtotal', render: (v) => <strong>{Number(v).toFixed(2)} €</strong> },
      ]}
    />
  );

  const columns = [
    { title: 'N°', dataIndex: 'id', width: 70 },
    { title: 'Date', dataIndex: 'sold_at', render: (v) => new Date(v).toLocaleString() },
    { title: 'Client', dataIndex: ['customer', 'name'], render: (_, r) => r.customer?.name || <Tag>Client anonyme</Tag> },
    { title: 'Montant', dataIndex: 'total_amount', render: (v) => <strong style={{ color: '#4f46e5' }}>{Number(v).toFixed(2)} €</strong> },
    {
      title: 'Actions', width: 120,
      render: (_, r) => (
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => {
          Modal.confirm({
            title: 'Supprimer cette vente ?',
            content: 'Le stock sera rétabli.',
            okText: 'Supprimer', okType: 'danger', cancelText: 'Annuler',
            onOk: async () => { await api.delete(`/sales/${r.id}`); message.success('Vente supprimée'); load(); },
          });
        }}>Supprimer</Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>Historique des ventes</Typography.Title>
          <Typography.Text type="secondary">Consultez et gérez les ventes enregistrées</Typography.Text>
        </div>
        <Link to="/sales/new"><Button type="primary" icon={<PlusOutlined />}>Nouvelle vente</Button></Link>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input prefix={<SearchOutlined />} placeholder="Client..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320 }} allowClear />
        <DatePicker.RangePicker value={range} onChange={setRange} />
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={sales}
        columns={columns}
        expandable={{ expandedRowRender }}
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
}