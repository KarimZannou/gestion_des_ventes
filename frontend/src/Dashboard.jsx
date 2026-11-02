import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Typography, Spin } from 'antd';
import { DollarOutlined, FileTextOutlined, InboxOutlined, TeamOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from './api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then((r) => setData(r.data || null))
      .catch((e) => setError(e.response?.data?.message || e.message || 'Impossible de charger le tableau de bord.'));
  }, []);

  const totals = data?.totals ?? { sales: 0, revenue: 0, products: 0, customers: 0, low_stock_count: 0 };
  const lowStockProducts = Array.isArray(data?.low_stock_products) ? data.low_stock_products : [];
  const recentSales = Array.isArray(data?.recent_sales) ? data.recent_sales : [];
  const salesByDay = Array.isArray(data?.sales_by_day) ? data.sales_by_day : [];

  if (error) return <Typography.Text type="danger">{error}</Typography.Text>;
  if (!data) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 4 }}>Tableau de bord</Typography.Title>
      <Typography.Text type="secondary">Vue d'ensemble de votre activité commerciale</Typography.Text>

      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
            <Statistic title="Ventes" value={totals.sales} prefix={<FileTextOutlined />} valueStyle={{ color: '#4f46e5' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
            <Statistic title="Chiffre d'affaires" value={Number(totals.revenue ?? 0).toFixed(2)} suffix="€" prefix={<DollarOutlined />} valueStyle={{ color: '#059669' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
            <Statistic title="Produits" value={totals.products} prefix={<InboxOutlined />} valueStyle={{ color: '#7c3aed' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
            <Statistic title="Clients" value={totals.customers} prefix={<TeamOutlined />} valueStyle={{ color: '#ea580c' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Produits en stock faible" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
            {lowStockProducts.length === 0 ? (
              <Typography.Text type="secondary">Aucun produit en stock faible.</Typography.Text>
            ) : (
              <Table
                rowKey="id"
                dataSource={lowStockProducts}
                pagination={false}
                size="small"
                columns={[
                  { title: 'Produit', dataIndex: 'name' },
                  { title: 'Stock', dataIndex: 'stock', render: (v) => <Tag color="red">{v}</Tag> },
                  { title: 'Seuil', dataIndex: 'min_stock' },
                ]}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Ventes par jour (7 derniers jours)" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
            {salesByDay.length === 0 ? (
              <Typography.Text type="secondary">Aucune donnée.</Typography.Text>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      <Card title="Ventes récentes" bordered={false} style={{ marginTop: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
        {recentSales.length === 0 ? (
          <Typography.Text type="secondary">Aucune vente enregistrée.</Typography.Text>
        ) : (
          <Table
            rowKey="id"
            dataSource={recentSales}
            pagination={false}
            size="small"
            columns={[
              { title: 'Date', dataIndex: 'sold_at', render: (v) => new Date(v).toLocaleString() },
              { title: 'Client', dataIndex: ['customer', 'name'], render: (_, r) => r.customer?.name || '—' },
              { title: 'Montant', dataIndex: 'total_amount', render: (v) => <strong>{Number(v).toFixed(2)} €</strong> },
            ]}
          />
        )}
      </Card>
    </div>
  );
}