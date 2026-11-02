import { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Typography, message, Checkbox } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import api from './api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(undefined);
  const [lowStock, setLowStock] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/products', { params: { search, category_id: categoryId, low_stock: lowStock || undefined, per_page: 100 } });
      setProducts(r.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    api.get('/categories', { params: { per_page: 100 } }).then((r) => setCategories(r.data.data));
  }, []);

  useEffect(() => { load(); }, [search, categoryId, lowStock]);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); form.setFieldsValue(p); setModalOpen(true); };

  const submit = async () => {
    const values = await form.validateFields();
    const payload = { ...values, category_id: values.category_id || null };
    try {
      if (editing) await api.put(`/products/${editing.id}`, payload);
      else await api.post('/products', payload);
      message.success(editing ? 'Produit modifié' : 'Produit créé');
      setModalOpen(false);
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Erreur');
    }
  };

  const remove = async (id) => {
    Modal.confirm({
      title: 'Supprimer ce produit ?',
      okText: 'Supprimer', okType: 'danger', cancelText: 'Annuler',
      onOk: async () => { await api.delete(`/products/${id}`); message.success('Produit supprimé'); load(); },
    });
  };

  const columns = [
    { title: 'Produit', dataIndex: 'name', render: (v, r) => (<div><strong>{v}</strong><div style={{ fontSize: 12, color: '#8c8c8c' }}>{r.description}</div></div>) },
    { title: 'SKU', dataIndex: 'sku', render: (v) => <Tag>{v}</Tag> },
    { title: 'Catégorie', dataIndex: ['category', 'name'], render: (v) => v || '—' },
    { title: 'Prix', dataIndex: 'price', render: (v) => `${Number(v).toFixed(2)} €`, sorter: (a, b) => a.price - b.price },
    {
      title: 'Stock', dataIndex: 'stock',
      render: (v, r) => <Tag color={v <= r.min_stock ? 'red' : 'green'}>{v}</Tag>,
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: 'Actions', width: 180,
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>Modifier</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => remove(r.id)}>Supprimer</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>Produits</Typography.Title>
          <Typography.Text type="secondary">Gérez le catalogue et les niveaux de stock</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Nouveau produit</Button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input prefix={<SearchOutlined />} placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320 }} allowClear />
        <Select placeholder="Catégorie" value={categoryId} onChange={setCategoryId} allowClear style={{ width: 200 }}
          options={categories.map((c) => ({ value: c.id, label: c.name }))} />
        <Checkbox checked={lowStock} onChange={(e) => setLowStock(e.target.checked)}>Stock faible uniquement</Checkbox>
      </div>

      <Table rowKey="id" loading={loading} dataSource={products} columns={columns} pagination={{ pageSize: 10 }} />

      <Modal title={editing ? 'Modifier le produit' : 'Nouveau produit'} open={modalOpen} onOk={submit} onCancel={() => setModalOpen(false)} okText="Enregistrer" cancelText="Annuler" width={720}>
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="category_id" label="Catégorie">
              <Select allowClear options={categories.map((c) => ({ value: c.id, label: c.name }))} />
            </Form.Item>
            <Form.Item name="price" label="Prix (€)" rules={[{ required: true }]}>
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="min_stock" label="Seuil d'alerte" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}