import React, { useState, useEffect } from 'react';
import { Dropdown, Space, Button, message, Modal, Select, Upload } from 'antd';
import { FileImageOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const Images = () => {
  const [items, setItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFilename, setSelectedFilename] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isPointIDModalVisible, setIsPointIDModalVisible] = useState(false);
  const [isDataModalVisible, setIsDataModalVisible] = useState(false);
  const [pointIDs, setPointIDs] = useState([]);
  const [selectedPointID, setSelectedPointID] = useState(null);
  const [statisticalData, setStatisticalData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // Retaining the delete modal visibility state

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
    setSelectedFilename(`${baseFilename}.png`);
    setSelectedImage(`http://127.0.0.1:5000/visualized/${file}`);
    axios.get(`http://127.0.0.1:5000/get_points/${baseFilename}.png`)
      .then(response => {
        setPoints(response.data); // Load points with assigned point IDs
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

    // If the point already has a point_id, skip the selection and fetch data directly
    if (point.point_id) {
      handleFetchStatisticalData(point.point_id);
    } else {
      // Fetch point IDs using the /get_point_ids endpoint
      axios.get('http://127.0.0.1:5000/get_point_ids')
        .then(response => {
          setPointIDs(response.data.point_ids);
          setIsPointIDModalVisible(true);
        })
        .catch(error => {
          message.error('Failed to fetch point IDs');
        });
    }
  };

  const handlePointIDSelect = (value) => {
    setSelectedPointID(value);
  };

  const handleConfirmPointID = () => {
    if (!selectedPointID) {
      message.error('Please select a Point ID');
      return;
    }

    // Ensure selectedPoint is valid before submitting
    if (!selectedPoint || !selectedPoint.x || !selectedPoint.y || !selectedFilename) {
      message.error('Invalid point selection');
      return;
    }

    const requestData = {
      selected_point: {
        point_id: selectedPointID,
        x: selectedPoint.x,
        y: selectedPoint.y,
        image_id: selectedFilename,
      }
    };

    // Store the selected point ID
    axios.post('http://127.0.0.1:5000/store_point_id', requestData)
      .then(() => {
        message.success('Point ID stored successfully');
        setIsPointIDModalVisible(false);

        // Fetch the statistical data after storing the point ID
        handleFetchStatisticalData(selectedPointID);

        // Update the points state to reflect the stored point ID
        setPoints(prevPoints => prevPoints.map(p =>
          p.id === selectedPoint.id ? { ...p, point_id: selectedPointID } : p
        ));
      })
      .catch(error => {
        message.error('Failed to store point ID');
        console.error('Error details:', error.response?.data || error.message); // Log detailed error for debugging
      });
  };

  const handleFetchStatisticalData = (pointID) => {
    axios.post('http://127.0.0.1:5000/get_statistical_data', { point_id: pointID })
      .then(response => {
        setStatisticalData(response.data.statistical_data); 
        setIsDataModalVisible(true);
      })
      .catch(error => {
        message.error('Failed to fetch statistical data');
        console.error('Error details:', error.response?.data || error.message); // Log detailed error for debugging
      });
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

  const handleCsvUpload = ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image_id', selectedFilename); // Attach the selected image ID

    axios.post('http://127.0.0.1:5000/upload_csv', formData)
      .then(() => {
        message.success('File uploaded and data merged successfully');
      })
      .catch(error => {
        message.error('Failed to upload file');
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

      <Upload
        customRequest={handleCsvUpload}
        showUploadList={false}
        disabled={!selectedFilename}  // Disable if no image is selected
      >
        <Button
          icon={<UploadOutlined />}
          style={{ marginTop: 10 }}
          disabled={!selectedFilename}  // Disable if no image is selected
        >
          Upload CSV
        </Button>
      </Upload>

      <Button onClick={toggleEditMode} 
      style={{ marginTop: 10 }} 
      disabled={!selectedFilename}  // Disable if no image is selected
      >
        {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
      </Button>

      {/* Point ID Selection Modal */}
      <Modal
        title="Select Point ID"
        visible={isPointIDModalVisible}
        onCancel={() => setIsPointIDModalVisible(false)}
        footer={[
          <Button key="confirm" type="primary" onClick={handleConfirmPointID}>
            Confirm
          </Button>
        ]}
      >
        <Select 
          style={{ width: '100%' }} 
          placeholder="Select a Point ID" 
          onChange={handlePointIDSelect}
        >
          {pointIDs.map(id => (
            <Option key={id} value={id}>{id}</Option>
          ))}
        </Select>
      </Modal>

      {/* Statistical Data Modal */}
      <Modal
        title="Statistical Data"
        visible={isDataModalVisible}
        onCancel={() => setIsDataModalVisible(false)}
        footer={null}
      >
        {statisticalData && (
          <div>
            <p><strong>Point ID:</strong> {statisticalData.point_id}</p>
            <p><strong>X:</strong> {statisticalData.x}</p>
            <p><strong>Y:</strong> {statisticalData.y}</p>
            <p><strong>Height:</strong> {statisticalData.h}</p>
            <p><strong>Rice Height:</strong> {statisticalData.rice_height}</p>
            <p><strong>Spectral Number:</strong> {statisticalData.spectral_num}</p>
            <p><strong>Chlorophyll A:</strong> {statisticalData.chlorophyll_a}</p>
            <p><strong>P Conc:</strong> {statisticalData.p_conc}</p>
            <p><strong>K Conc:</strong> {statisticalData.k_conc}</p>
            <p><strong>N Conc:</strong> {statisticalData.n_conc}</p>
            <p><strong>Date:</strong> {statisticalData.date}</p>
          </div>
        )}
      </Modal>

      {/* Original Point Options Modal */}
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
