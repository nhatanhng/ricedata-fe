import React, { useState, useEffect } from 'react';
import { Dropdown, Space, Button, message, Menu } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import axios from 'axios';

const Images = () => {
  const [items, setItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    // Fetch the list of visualized files from the server
    axios.get('http://127.0.0.1:5000/visualized_files')
      .then(response => {
        const files = response.data;
        const menuItems = files.map((file, index) => ({
          key: index.toString(),
          label: (
            <a onClick={() => handleMenuClick(file)}>
              {file}
            </a>
          ),
        }));
        setItems(menuItems);
      })
      .catch(error => {
        message.error('Failed to fetch visualized files');
      });
  }, []);

  const handleMenuClick = (file) => {
    setSelectedImage(`http://127.0.0.1:5000/visualized/${file}`);
  };

  const menuProps = {
    items,
  };

  return (
    <div>
      <Dropdown menu={menuProps} trigger={['click']}>
        <Button>
          <Space>
            Images
            <FileImageOutlined />
          </Space>
        </Button>
      </Dropdown>
      {selectedImage && (
        <div style={{ marginTop: 20 }}>
          <img src={selectedImage} alt="Selected" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
}

export default Images;
