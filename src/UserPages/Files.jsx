import React, { useState, useEffect } from 'react';
import { Button, List, message, Modal, Input } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const Files = () => {
  const [fileList, setFileList] = useState([]);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [newFilename, setNewFilename] = useState('');
  const [fileExtension, setFileExtension] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [hdrFile, setHdrFile] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [tifFile, setTifFile] = useState(null);

  useEffect(() => {
    const storedFileList = localStorage.getItem('uploadedFileList');
    if (storedFileList) {
      setFileList(JSON.parse(storedFileList));
    }
  }, []);

  const handleUpload = async () => {
    // if (!hdrFile || !imgFile) {
    //   message.error('.img and .hdr files must be uploaded together!');
    //   return;
    // }

    const formData = new FormData();
    if (hdrFile) formData.append('file', hdrFile);
    if (imgFile) formData.append('file', imgFile);
    if (tifFile) formData.append('file', tifFile);

    try {
      await axios.post('http://127.0.0.1:5000/uploads/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });
      message.success('Files uploaded successfully.');
      setFileList(prevFileList => {
        const updatedFileList = [
          ...prevFileList,
          hdrFile ? { name: hdrFile.name, uid: hdrFile.uid } : null,
          imgFile ? { name: imgFile.name, uid: imgFile.uid } : null,
          tifFile ? { name: tifFile.name, uid: tifFile.uid } : null,
        ].filter(file => file !== null);
        localStorage.setItem('uploadedFileList', JSON.stringify(updatedFileList));
        return updatedFileList;
      });
      setIsUploadModalVisible(false);
      setHdrFile(null);
      setImgFile(null);
      setTifFile(null);
    } catch (error) {
      message.error('File upload failed.');
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
      <Button type='primary' icon={<UploadOutlined />} onClick={() => setIsUploadModalVisible(true)}>Upload Files</Button>

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
          </List.Item>
        )}
      />
      <Modal
        title="View Image"
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
      >
        <img src={imageSrc} alt="Hyperspectral/Multispectral Visualization" style={{ width: '100%' }} />
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
      <Modal
        title="Upload Files"
        visible={isUploadModalVisible}
        onOk={handleUpload}
        onCancel={() => setIsUploadModalVisible(false)}
      >
        <div>
        <p>Note: If you want to use .hdr and .img for visualizing hyperspectral image,
             make sure the .img is uploaded before .hdr and both files must have the same filename  .</p>
            <br></br>
        <p>Choose .hdr file </p>
          <Input
            type="file"
            accept=".hdr"
            title='Choose .hdr file'
            onChange={e => setHdrFile(e.target.files[0])}
          />
        <p>Choose .img file </p>
          <Input
            type="file"
            accept=".img"
            onChange={e => setImgFile(e.target.files[0])}
          />
        <p>Choose .tif file </p>
          <Input
            type="file"
            accept=".tif"
            onChange={e => setTifFile(e.target.files[0])}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Files;
