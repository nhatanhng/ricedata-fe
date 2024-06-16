import React, { useState, useEffect } from 'react';
import { Upload, Button, List, message } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const UploadFileList = () => {
  const [fileList, setFileList] = useState([]);

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
      const response = await axios.get(`/download/${file.name}`, {
        responseType: 'blob', // Important for file downloads
      });

      // Create a link element, set its href to the object URL, and click it to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name); // or use file.name to preserve the original file name
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
  
  // // Function to clear all files from the file list
  // const clearFileList = () => {
  //   setFileList([]); // Clear the file list in the state
  //   localStorage.removeItem('uploadedFileList'); // Remove the file list from local storage
  // };

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
            ]}
          >
            {item.name} {/* Display the name of each file */}
          </List.Item>
        )}
      />
    </div>
  );
};

export default UploadFileList;
