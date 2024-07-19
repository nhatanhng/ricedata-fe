import React, { useState, useEffect } from 'react';
import { Dropdown, Space, Button, message, Modal } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import axios from 'axios';

const Images = () => {
  const [items, setItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFilename, setSelectedFilename] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
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
    const baseFilename = file.replace('.png', '');
    setSelectedFilename(`${baseFilename}.img`);
    setSelectedImage(`http://127.0.0.1:5000/visualized/${file}`);
    axios.get(`http://127.0.0.1:5000/get_points/${baseFilename}.img`)
      .then(response => {
        setPoints(response.data.map((point, index) => ({ ...point, id: index + 1 }))); // Ensure points have unique IDs
      })
      .catch(error => {
        message.error('Failed to fetch points');
      });
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleImageClick = (e) => {
    if (isEditMode && selectedImage) {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newPoint = { x, y, id: points.length + 1 };
      const newPoints = [...points, newPoint];
      axios.post(`http://127.0.0.1:5000/save_points/${selectedFilename}`, { points: newPoints })
        .then(() => {
          setPoints(newPoints);
          message.success('Points saved successfully');
        })
        .catch(error => {
          message.error('Failed to save points');
        });
    }
  };

  const handlePointClick = (point) => {
    setSelectedPoint(point);
    setIsModalVisible(true);
  };

  const handleDeletePoint = () => {
    if (!selectedPoint || !selectedPoint.id) {
      message.error('No point selected or invalid point ID');
      return;
    }

    axios.delete(`http://127.0.0.1:5000/delete_point/${selectedPoint.id}`)
      .then(() => {
        setPoints(points.filter(p => p.id !== selectedPoint.id));
        setIsModalVisible(false);
        message.success('Point deleted successfully');
      })
      .catch(error => {
        message.error('Failed to delete point');
      });
  };

  return (
    <div>
      <Dropdown menu={{ items }} trigger={['click']}>
        <Button>
          <Space>
            Hyperspectral Images
            <FileImageOutlined />
          </Space>
        </Button>
      </Dropdown>
      {selectedImage && (
        <div style={{ marginTop: 20, position: 'absolute'}}>
          <img 
            src={selectedImage} 
            alt="Selected" 
            style={{ maxWidth: '100%', cursor: isEditMode ? 'crosshair' : 'default' }} 
            onClick={handleImageClick} 
          />
          {points.map((point) => (
            <div 
              key={point.id} 
              style={{
                position: 'absolute',
                left: point.x,
                top: point.y,
                width: '10px',
                height: '10px',
                backgroundColor: 'red',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer'
              }} 
              onClick={() => handlePointClick(point)}
            />
          ))}
        </div>
      )}
      <Button onClick={toggleEditMode} style={{ marginTop: 10 }}>
        {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
      </Button>
      <Modal
        title="Point Options"
        visible={isModalVisible}
        onOk={handleDeletePoint}
        onCancel={() => setIsModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
      >
        <p>Do you want to delete this point?</p>
      </Modal>
    </div>
  );
}

export default Images;
