import React from 'react';
import { Layout, Menu, Typography, Button, Card, Col, Row, } from 'antd';
import {Link} from 'react-router-dom'
import 'antd/dist/reset.css'; // Import Ant Design styles
const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <Layout className="layout">

      <div className="logo">
      <img 
            src="/src/Components/images/vite.png" 
            alt="Logo" 
            style={{ 
              width: '150px', 
              marginBottom: '0px',
              borderRadius: '8px', 
            }} 
          />
        </div>  

      <Content style={{ padding: '0 50px', marginTop: 64 }}>
        <div className="site-layout-content">
          <Title level={1} style={{ textAlign: 'center' }}>Manage, Visualize, Tracking Rice Fields Health</Title>
          <Paragraph style={{ textAlign: 'center' }}>
           A website to visualize Hyperspectral Image and Rice Data with an ease.
          </Paragraph>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Link to="/users/files">
            <Button type="primary" size="large">Get Started</Button>
          </Link>
          </div>
          <Row gutter={16}>
            <Col span={8}>
              <Card title="What the website can do?" bordered={false}>
                <li> Mangage Rice Statistical data files.</li>
                <li> Visualize Satellite Images to PNG.</li>
                <li> Mapping data point with Geographic coordinates of captured images. </li> 
                <li> View graph of data throughout time. </li>  
 
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Why should use the website?" bordered={false}>
                <li> Implement Satellite Image directly in website! </li>
                <li> Manage Statistical Rice Data of area through Recording files. </li>
                <li> </li>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Which data is related?" bordered={false}>
                <li>Hyperspectral data (.hdr, .img) </li>
                <li>Spectral Reflectance Data (.csv) </li>

              </Card>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        ©2024 USTH ICT Lab. All Rights Reserved.
      </Footer>
    </Layout>
  );
};

export default Home;