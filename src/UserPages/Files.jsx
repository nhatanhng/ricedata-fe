import React, { useState, useEffect } from 'react';
import { Upload, Button, List, message, Modal, Input, Progress } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const UploadFileList = () => {
  const [fileList, setFileList] = useState([]);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);  const [currentFile, setCurrentFile] = useState(null);
  const [newFilename, setNewFilename] = useState('');
  const [fileExtension, setFileExtension] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [imageSrc, setImageSrc] = useState('');


  useEffect(() => {
    const storedFileList = localStorage.getItem('uploadedFileList');
    if (storedFileList) {
      setFileList(JSON.parse(storedFileList));
    }
  }, []);

  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://127.0.0.1:5000/uploads/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prevProgress => ({
            ...prevProgress,
            [file.uid]: percentCompleted
          }));
        }
      });
      message.success(`${file.name} file uploaded successfully.`);
      setFileList(prevFileList => {
        const updatedFileList = [...prevFileList, { name: file.name, uid: file.uid }];
        localStorage.setItem('uploadedFileList', JSON.stringify(updatedFileList));
        return updatedFileList;
      });
      setUploadProgress(prevProgress => {
        const { [file.uid]: _, ...rest } = prevProgress;
        return rest;
      });
    } catch (error) {
      message.error(`${file.name} file upload failed.`);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/download/${file.name}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      const errorMsg = error.response && error.response.data && error.response.data.error
        ? error.response.data.error
        : error.message;
      message.error(`Failed to download ${file.name}: ${errorMsg}`);
    }
  };

  const handleDelete = async (file) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/delete/${file.name}`);
      message.success(`${file.name} file deleted successfully.`);
      setFileList(prevFileList => {
        const updatedFileList = prevFileList.filter(item => item.name !== file.name);
        localStorage.setItem('uploadedFileList', JSON.stringify(updatedFileList));
        return updatedFileList;
      });
    } catch (error) {
      message.error(`Failed to delete ${file.name}: ${error.message}`);
    }
  };

  const showRenameModal = (file) => {
    setCurrentFile(file);
    const fileParts = file.name.split('.');
    setNewFilename(fileParts.slice(0, -1).join('.'));
    setFileExtension(fileParts.slice(-1));
    setIsRenameModalVisible(true);
  };

  const handleRename = async () => {
    try {
      const updatedFilename = `${newFilename}.${fileExtension}`;
      await axios.put(`http://127.0.0.1:5000/rename/${currentFile.name}`, { newFilename: updatedFilename });
      message.success(`${currentFile.name} file renamed to ${updatedFilename} successfully.`);
      setFileList(prevFileList => {
        const updatedFileList = prevFileList.map(item => {
          if (item.name === currentFile.name) {
            return { ...item, name: updatedFilename };
          }
          return item;
        });
        localStorage.setItem('uploadedFileList', JSON.stringify(updatedFileList));
        return updatedFileList;
      });
      setIsRenameModalVisible(false);
    } catch (error) {
      message.error(`Failed to rename ${currentFile.name}: ${error.message}`);
    }
  };

  // const clearFileList = () => {
  //   setFileList([]);
  //   localStorage.removeItem('uploadedFileList');
  // };

  const handleView = async (file) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/hyperspectral/${file.name}`, {
        responseType: 'blob',
      });
      const imageUrl = window.URL.createObjectURL(new Blob([response.data]));
      setImageSrc(imageUrl);
      setIsViewModalVisible(true);
    } catch (error) {
      message.error(`Failed to view ${file.name}: ${error.message}`);
    }
  };

  return (
    <div>
      <Upload
        customRequest={handleUpload}
        multiple
        showUploadList={false}
      >
        <Button type='primary' icon={<UploadOutlined />}>Upload Files</Button>
      </Upload>

      {/* <Button type='primary' danger onClick={clearFileList}>Clear localStorage</Button> */}

      <List
        header={<div>Files (season 2 trip 2)</div>}
        bordered
        dataSource={fileList}
        renderItem={item => (
          <List.Item
            actions={[
              <Button
                type="link"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(item)}
              >
                Download
              </Button>,
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(item)}
              >
                Delete
              </Button>,
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => showRenameModal(item)}
              >
                Rename
              </Button>,
              item.name.endsWith('.img') && (
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleView(item)}
                >
                  View
                </Button>
              ),
            ]}
          >
            {item.name}
            {uploadProgress[item.uid] !== undefined && (
              <Progress percent={uploadProgress[item.uid]} />
            )}
          </List.Item>
        )}
      />
      <Modal
        title="View Hyperspectral Image"
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
      >
        <img src={imageSrc} alt="Hyperspectral Visualization" style={{ width: '100%' }} />
      </Modal>
      <Modal
        title="Rename File"
        visible={isRenameModalVisible}
        onOk={handleRename}
        onCancel={() => setIsRenameModalVisible(false)}
      >
        <Input
          value={newFilename}
          onChange={e => setNewFilename(e.target.value)}
          addonAfter={`.${fileExtension}`}
        />
      </Modal>
    </div>
  );
};

export default UploadFileList;
