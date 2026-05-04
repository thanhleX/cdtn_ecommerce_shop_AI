import { Layout, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import CustomerLoginForm from './components/CustomerLoginForm';

const { Header, Content } = Layout;

const CustomerLoginPage = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      
      {/* Header tối giản */}
      <Header style={{ 
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        
        {/* Logo */}
        <Link to="/" style={{ fontWeight: 'bold', fontSize: 18 }}>
          VietTech Store
        </Link>

        {/* Nút quay lại */}
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/")}
        >
          Quay lại
        </Button>
      </Header>

      {/* Form login */}
      <Content style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <CustomerLoginForm />
      </Content>

    </Layout>
  );
};

export default CustomerLoginPage;