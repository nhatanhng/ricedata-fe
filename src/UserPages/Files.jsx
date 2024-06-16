import React, { useState, useEffect } from 'react';
import { Upload, Button, List, message, Modal, Input } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';

const UploadFileList = () => {
  const [fileList, setFileList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [newFilename, setNewFilename] = useState('');

  // Load the file list from local storage when the component mounts
  useEffect(() => {
    const storedFileList = localStorage.getItem('uploadedFileList');
    if (storedFileList) {
      setFileList(JSON.parse(storedFileList)); // Parse the JSON string to an array
    }
  }, []);

  // // Function to handle file upload changes
  // const handleUpload = ({ file, fileList }) => {
  //   if (file.status === 'done') {
  //     message.success(`${file.name} file uploaded successfully.`);
  //     const newFiles = fileList.slice(-1); // Get the last uploaded file
  //     const updatedFileList = [...fileList]; // Create a copy of the current file list
  //     // Update the state with the new file list
  //     setFileList(prevFileList => {
  //       const mergedFileList = [...prevFileList, ...newFiles];
  //       // Save the updated file list to local storage
  //       localStorage.setItem('uploadedFileList', JSON.stringify(mergedFileList));
  //       return mergedFileList;
  //     });
  //   } else if (file.status === 'error') {
  //     message.error(`${file.name} file upload failed.`);
  //   }
  // };

  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://127.0.0.1:5000/uploads/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      message.success(`${file.name} file uploaded successfully.`);
      setFileList(prevFileList => {
        const updatedFileList = [...prevFileList, { name: file.name }];
        localStorage.setItem('uploadedFileList', JSON.stringify(updatedFileList));
        return updatedFileList;
      });
    } catch (error) {
      message.error(`${file.name} file upload failed.`);
    }
  };

  // Function to handle file download
  const handleDownload = async (file) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/download/${file.name}`, {
        responseType: 'blob', // Important for file downloads
      });

      // Create a link element, set its href to the object URL, and click it to download the file
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

    // Function to handle file deletion
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
    setNewFilename(file.name);
    setIsModalVisible(true);
  };

  const handleRename = async () => {
    try {
      await axios.put(`http://127.0.0.1:5000/rename/${currentFile.name}`, { newFilename });
      message.success(`${currentFile.name} file renamed to ${newFilename} successfully.`);
      setFileList(prevFileList => {
        const updatedFileList = prevFileList.map(item => {
          if (item.name === currentFile.name) {
            return { ...item, name: newFilename };
          }
          return item;
        });
        localStorage.setItem('uploadedFileList', JSON.stringify(updatedFileList));
        return updatedFileList;
      });
      setIsModalVisible(false);
    } catch (error) {
      message.error(`Failed to rename ${currentFile.name}: ${error.message}`);
    }
  };  

  return (
    <div>
      <Upload
        customRequest={handleUpload}

        // action="http://127.0.0.1:5000/uploads/images" // URL to which the files will be uploaded
        // onChange={handleUpload} // Function to handle upload changes
        multiple // Allow multiple file uploads
        showUploadList={false} // Hide the default upload list
      >
        <Button type='primary' icon={<UploadOutlined />}>Upload Files</Button>
      </Upload>

      {/* <Button type='primary' danger onClick={clearFileList}>Clear Files</Button> */}

      <List
        header={<div>Uploaded Files</div>}
        bordered
        dataSource={fileList} // Use the state as the data source for the list
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

            ]}
          >
            {item.name} {/* Display the name of each file */}
          </List.Item>
        )}
      />
      <Modal
        title="Rename File"
        visible={isModalVisible}
        onOk={handleRename}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          value={newFilename}
          onChange={e => setNewFilename(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default UploadFileList;
