import React, { useState, useEffect } from 'react';
import { Dropdown, Space, Button, message, Modal, Upload } from 'antd';
import { FileImageOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const Images = () => {
  const [items, setItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFilename, setSelectedFilename] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statisticalData, setStatisticalData] = useState(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [isDataUploaded, setIsDataUploaded] = useState(false); // New state to track CSV upload success

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
    setPoints([]);
    setSelectedFilename(`${baseFilename}.img`);
    setSelectedImage(`http://127.0.0.1:5000/visualized/${file}`);
    fetchPoints(baseFilename);
  };

  const fetchPoints = (filename) => {
    axios.get(`http://127.0.0.1:5000/get_points/${filename}.png`)
      .then(response => {
        setPoints(response.data.map((point, index) => ({ ...point, id: index + 1 })));
        console.log("Points fetched:", response.data);
        setIsDataUploaded(true); 
      })
      .catch(error => {
        message.error('Unable to fetch points');
        setIsDataUploaded(false);
      });
  };

  const handleImageClick = (e) => {
    if (isEditMode && selectedImage) {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setSelectedPoint({ x, y });
      setIsModalVisible(true);
    }
  };

  const handlePointClick = (point) => {
    axios.post('http://127.0.0.1:5000/get_statistical_data', {
      point_ids: [point.point_id]
    })
    .then(response => {
      setStatisticalData(response.data[0]);
      setIsModalVisible(true);
    })
    .catch(error => {
      message.error('Failed to fetch statistical data');
    });
    setSelectedPoint(point);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setStatisticalData(null);
    setProcessedImage(null); // Clear the processed image on modal close
  };

  const handleImageLoad = (e) => {
    const { width, height } = e.target.getBoundingClientRect();
    setDisplaySize({ width, height });
  };

  const handleCsvUpload = ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image_id', selectedFilename); 
    formData.append('display_width', displaySize.width);  
    formData.append('display_height', displaySize.height);

    axios.post('http://127.0.0.1:5000/upload_csv', formData)
      .then(() => {
        message.success('File uploaded and data merged successfully');
        fetchPoints(selectedFilename.replace('.img', ''));
        setIsDataUploaded(true); 
      })
      .catch(error => {
        message.error('Failed to upload file');
        setIsDataUploaded(false);
      });
  };

  const handleDeleteData = () => {
    axios.post('http://127.0.0.1:5000/delete_data', {
      visualized_filename: selectedFilename.replace('.img', '.png')
    })
    .then(() => {
      message.success('Data deleted successfully');
      setPoints([]);
      setIsDataUploaded(false);
    })
    .catch(error => {
      message.error('Failed to delete data');
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
        <div style={{ marginTop: 20, position: 'absolute' }}>
          <img 
            src={selectedImage} 
            alt="Selected" 
            style={{ maxWidth: '100%', cursor: isEditMode ? 'crosshair' : 'default' }} 
            onClick={handleImageClick}
            onLoad={handleImageLoad}
          />
          {points.map(point => (
            <div 
              key={point.id} 
              style={{ position: 'absolute', left: point.x, top: point.y, width: 10, height: 10, backgroundColor: 'red', cursor: 'pointer' }}
              onClick={() => handlePointClick(point)}
            />
          ))}
        </div>
      )}
      <Upload
        customRequest={handleCsvUpload}
        showUploadList={false}
        disabled={!selectedFilename}
      >
        <Button
          icon={<UploadOutlined />}
          style={{ marginTop: 10 }}
          disabled={!selectedFilename}
        >
          Upload CSV
        </Button>
      </Upload>
      {isDataUploaded && (
        <Button
          icon={<DeleteOutlined />}
          style={{ marginTop: 10 }}
          onClick={handleDeleteData}
          danger
        >
          Delete Data
        </Button>
      )}

      <Modal
        title="Point Statistical Data"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>
        ]}
      >
        {statisticalData ? (
          <div>
            <p><strong>Point ID:</strong> {statisticalData.point_id}</p>
            <p><strong>X:</strong> {statisticalData.x}</p>
            <p><strong>Y:</strong> {statisticalData.y}</p>
            <p><strong>Elevation (H):</strong> {statisticalData.h}</p>
            <p><strong>Replicate:</strong> {statisticalData.replicate}</p>
            <p><strong>Sub Replicate:</strong> {statisticalData.sub_replicate}</p>
            <p><strong>Chlorophyll:</strong> {statisticalData.chlorophyll}</p>
            <p><strong>Rice Height:</strong> {statisticalData.rice_height}</p>
            <p><strong>Spectral Number:</strong> {statisticalData.spectral_num}</p>
            <p><strong>Digestion:</strong> {statisticalData.digesion}</p>
            <p><strong>P Concentration:</strong> {statisticalData.p_conc}</p>
            <p><strong>K Concentration:</strong> {statisticalData.k_conc}</p>
            <p><strong>N Concentration:</strong> {statisticalData.n_conc}</p>
            <p><strong>Chlorophyll A:</strong> {statisticalData.chlorophyll_a}</p>
            <p><strong>Date:</strong> {statisticalData.date}</p>
          </div>
        ) : (
          <p>Loading data...</p>
        )}
      </Modal>
    </div>
  );
};

export default Images;
