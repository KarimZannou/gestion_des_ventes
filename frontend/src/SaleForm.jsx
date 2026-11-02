import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Select, Space, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from './api';

export default function SaleForm() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const items = Form.useWatch('items', form) || [];

  useEffect(() => {
    api.get('/products', { params: { per_page: 100 } }).then((r) => setProducts(r.data.data));
    api.get('/customers', { params: { per_page: 100 } }).then((r) => setCustomers(r.data.data));
    form.setFieldsValue({ items: [{ product_id: undefined, quantity: 1 }] });
  }, []);

  const productById = (id) => products.find((p) => p.id === id);

  const total = items.reduce((sum, it) => {
    const p = productById(it?.product_id);
    if (!p) return sum;
    return sum + Number(p.price) * Number(it?.quantity || 0);
  }, 0);

  const submit = async (values) => {
    setSubmitting(true);
    try {
      await api.post('/sales', {
        customer_id: values.customer_id || null,
        items: values.items.map((it) => ({ product_id: it.product_id, quantity: it.quantity })),
      });
      message.success('Vente enregistrée');
      navigate('/sales');
    } catch (e) {
      message.error(e.response?.data?.message || e.response?.data?.errors?.items?.[0] || 'Erreur lors de la vente');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Nouvelle vente</Typography.Title>
        <Typography.Text type="secondary">Enregistrez une vente et mettez à jour le stock</Typography.Text>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={submit} initialValues={{ items: [{ quantity: 1 }] }}>
          <Form.Item name="customer_id" label="Client (optionnel)">
            <Select allowClear placeholder="Client anonyme"
              options={customers.map((c) => ({ value: c.id, label: c.name }))} />
          </Form.Item>

          <Form.List name="items" rules={[{ validator: async (_, value) => { if (!value || value.length < 1) throw new Error('Au moins un article'); } }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  const it = items[name] || {};
                  const p = productById(it.product_id);
                  return (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: '2fr 100px 120px auto', gap: 12, alignItems: 'start', marginBottom: 12 }}>
                      <Form.Item {...restField} name={[name, 'product_id']} rules={[{ required: true, message: 'Produit requis' }]} style={{ marginBottom: 0 }}>
                        <Select placeholder="Choisir un produit"
                          options={products.map((pr) => ({ value: pr.id, label: `${pr.name} — stock: ${pr.stock} — ${Number(pr.price).toFixed(2)} €` }))} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                        <Input type="number" min={1} />
                      </Form.Item>
                      <div style={{ padding: '8px 0', fontWeight: 600, color: '#4f46e5' }}>
                        {p ? (Number(p.price) * Number(it.quantity || 0)).toFixed(2) + ' €' : '—'}
                      </div>
                      <Button danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                    </div>
                  );
                })}
                <Button type="dashed" onClick={() => add({ quantity: 1 })} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
                  Ajouter un article
                </Button>
              </>
            )}
          </Form.List>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, padding: '12px 0', borderTop: '1px solid #f0f0f0' }}>
            <Typography.Text strong style={{ fontSize: 18 }}>Total :</Typography.Text>
            <Typography.Text strong style={{ fontSize: 22, color: '#4f46e5' }}>{total.toFixed(2)} €</Typography.Text>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} size="large">
              Enregistrer la vente
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}