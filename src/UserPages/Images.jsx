import React from 'react'
import { Dropdown, Space, Button } from 'antd';
import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import {  FileImageOutlined } from '@ant-design/icons' 


const handleMenuClick = (e) => {
  message.info('Click on menu item.');
  console.log('click', e);
}

const items = [
  {
    key: '1',
    label: (
      <a target="_blank" rel="noopener noreferrer">
        1st menu item
      </a>
    ),
  },
  {
    key: '2',
    label: (
      <a target="_blank" rel="noopener noreferrer">
        1st menu item
      </a>
    ),
    
  },
  {
    key: '3',
    label: (
      <a target="_blank" rel="noopener noreferrer">
        1st menu item
      </a>
    ),
    disabled: true,
  },
  {
    key: '4',
    label: (
      <a target="_blank" rel="noopener noreferrer">
        1st menu item
      </a>
    ),
  },
];
const menuProps = {
  items,
  onClick: handleMenuClick,
};



const Images = () => {
  return (
    <Dropdown menu={menuProps}
    trigger={['click']}>
    <Button>
      <Space>
        Images
        <FileImageOutlined />
      </Space>
    </Button>
  </Dropdown>
  )
}

export default Images
