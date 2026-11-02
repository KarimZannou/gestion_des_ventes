import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Space, Table, Tag, Typography, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import api from './api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/customers', { params: { search, per_page: 100 } });
      setCustomers(r.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); form.setFieldsValue(c); setModalOpen(true); };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) await api.put(`/customers/${editing.id}`, values);
      else await api.post('/customers', values);
      message.success(editing ? 'Client modifié' : 'Client créé');
      setModalOpen(false);
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Erreur');
    }
  };

  const remove = async (id) => {
    Modal.confirm({
      title: 'Supprimer ce client ?',
      okText: 'Supprimer', okType: 'danger', cancelText: 'Annuler',
      onOk: async () => { await api.delete(`/customers/${id}`); message.success('Client supprimé'); load(); },
    });
  };

  const columns = [
    { title: 'Nom', dataIndex: 'name', render: (v) => <strong>{v}</strong> },
    { title: 'Email', dataIndex: 'email', render: (v) => v || <Tag>—</Tag> },
    { title: 'Téléphone', dataIndex: 'phone', render: (v) => v || '—' },
    { title: 'Adresse', dataIndex: 'address', render: (v) => v || '—' },
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
          <Typography.Title level={3} style={{ margin: 0 }}>Clients</Typography.Title>
          <Typography.Text type="secondary">Gérez votre portefeuille clients</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Nouveau client</Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input prefix={<SearchOutlined />} placeholder="Rechercher un client..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 360 }} allowClear />
      </div>

      <Table rowKey="id" loading={loading} dataSource={customers} columns={columns} pagination={{ pageSize: 10 }} />

      <Modal title={editing ? 'Modifier le client' : 'Nouveau client'} open={modalOpen} onOk={submit} onCancel={() => setModalOpen(false)} okText="Enregistrer" cancelText="Annuler">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email"><Input /></Form.Item>
          <Form.Item name="phone" label="Téléphone"><Input /></Form.Item>
          <Form.Item name="address" label="Adresse"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}