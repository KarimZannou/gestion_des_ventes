import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Space, Table, Tag, Typography, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import api from './api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/categories', { params: { search, per_page: 100 } });
      setCategories(r.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); form.setFieldsValue(c); setModalOpen(true); };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) await api.put(`/categories/${editing.id}`, values);
      else await api.post('/categories', values);
      message.success(editing ? 'Catégorie modifiée' : 'Catégorie créée');
      setModalOpen(false);
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Erreur');
    }
  };

  const remove = async (id) => {
    Modal.confirm({
      title: 'Supprimer cette catégorie ?',
      okText: 'Supprimer', okType: 'danger', cancelText: 'Annuler',
      onOk: async () => {
        await api.delete(`/categories/${id}`);
        message.success('Catégorie supprimée');
        load();
      },
    });
  };

  const columns = [
    { title: 'Nom', dataIndex: 'name', render: (v) => <strong>{v}</strong> },
    { title: 'Description', dataIndex: 'description', render: (v) => v || <Tag>—</Tag> },
    {
      title: 'Actions', width: 160,
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
          <Typography.Title level={3} style={{ margin: 0 }}>Catégories</Typography.Title>
          <Typography.Text type="secondary">Gérez les catégories de produits</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Nouvelle catégorie</Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input prefix={<SearchOutlined />} placeholder="Rechercher une catégorie..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 360 }} allowClear />
      </div>

      <Table rowKey="id" loading={loading} dataSource={categories} columns={columns} pagination={{ pageSize: 10 }} />

      <Modal title={editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'} open={modalOpen} onOk={submit} onCancel={() => setModalOpen(false)} okText="Enregistrer" cancelText="Annuler">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Nom requis' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}