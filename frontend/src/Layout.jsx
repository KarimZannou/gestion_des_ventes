import { useState } from 'react';
import { Layout as AntLayout, Menu, Typography } from 'antd';
import {
  DashboardOutlined, ShoppingOutlined, TagsOutlined,
  TeamOutlined, FileTextOutlined, PlusCircleOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';

const { Sider, Content, Header } = AntLayout;

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const items = [
    { key: '/', icon: <DashboardOutlined />, label: <Link to="/">Tableau de bord</Link> },
    { key: '/products', icon: <ShoppingOutlined />, label: <Link to="/products">Produits</Link> },
    { key: '/categories', icon: <TagsOutlined />, label: <Link to="/categories">Catégories</Link> },
    { key: '/customers', icon: <TeamOutlined />, label: <Link to="/customers">Clients</Link> },
    { key: '/sales', icon: <FileTextOutlined />, label: <Link to="/sales">Ventes</Link> },
    { key: '/sales/new', icon: <PlusCircleOutlined />, label: <Link to="/sales/new">Nouvelle vente</Link> },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={240}
        style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}
      >
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700,
          }}>G</div>
          {!collapsed && <Typography.Text style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Gestion Ventes</Typography.Text>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <AntLayout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: 18, marginRight: 16 }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
          <Typography.Title level={4} style={{ margin: 0 }}>Application de gestion commerciale</Typography.Title>
        </Header>
        <Content style={{ margin: 24, minHeight: 'calc(100vh - 112px)' }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}