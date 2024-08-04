import React, { useState, useEffect } from 'react';
import { Button, List, message, Modal, Input, Form } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const Files = () => {
  const [fileList, setFileList] = useState([]);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [isInputRGBModalVisible, setIsInputRGBModalVisible] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isImagePreviewModalVisible, setIsImagePreviewModalVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [newFilename, setNewFilename] = useState('');
  const [fileExtension, setFileExtension] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [hdrFile, setHdrFile] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [tifFile, setTifFile] = useState(null);
  const [rValue, setRValue] = useState(0);
  const [gValue, setGValue] = useState(0);
  const [bValue, setBValue] = useState(0);
  const [nfValue, setNfValue] = useState(0);

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
    setCurrentFile(file);
    setImageSrc('');
    try {
      const response = await axios.get(`http://127.0.0.1:5000/recommend_channel/${file.name}`);
      const { R, G, B } = response.data;
      setRValue(R);
      setGValue(G);
      setBValue(B);
      setIsInputRGBModalVisible(true);
    } catch (error) {
      message.error(`Failed to fetch RGB values for ${file.name}: ${error.message}`);
    }
  };

  // const handleView = (file) => {
  //   setCurrentFile(file);
  //   setImageSrc('');
  //   setIsInputRGBModalVisible(true);
  // };


  const handleRGBSubmit = async () => {
    if (rValue < 0 || rValue > 255 || gValue < 0 || gValue > 255 || bValue < 0 || bValue > 255) {
      message.error('RGB values must be between 0 and 255.');
      return;
    }
    try {
      const response = await axios.post('http://127.0.0.1:5000/hyperspectral', {
        filename: currentFile.name,
        R: rValue,
        G: gValue,
        B: bValue,
        // nf: nfValue,
      }, {
        responseType: 'blob'
      });
      const imageUrl = window.URL.createObjectURL(new Blob([response.data]));
      setImageSrc(imageUrl);
      setIsInputRGBModalVisible(false); // Close the RGB input modal
      setIsImagePreviewModalVisible(true); // Open the image preview modal
      message.success('Visualization updated successfully.');
    } catch (error) {
      message.error(`Failed to visualize ${currentFile.name}: ${error.message}`);
    }
  };


  // const deleteFileNameFromLocalStorage = (file) => {
  //   setFileList(prevFileList => {
  //     const updatedFileList = prevFileList.filter(item => item.name !== file.name);
  //     localStorage.setItem('uploadedFileList', JSON.stringify(updatedFileList));
  //     return updatedFileList;
  //   });
  // };


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
            //   <Button
            //   type="link"
            //   danger
            //   icon={<DeleteOutlined />}
            //   onClick={() => deleteFileNameFromLocalStorage(item)}
            // >
            //   Delete item in localstorage
            // </Button>,
              item.name.endsWith('.hdr') && (
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
        title="Input RGB"
        visible={isInputRGBModalVisible}
        onCancel={() => setIsInputRGBModalVisible(false)}
        footer={[
          <Button key="fetch" type="default" onClick={() => handleView(currentFile)}>
            Fetch RGB Values
          </Button>,
          <Button key="submit" type="primary" onClick={handleRGBSubmit}>
            Confirm
          </Button>,
        ]}
      >
        <Form>
          <Form.Item label="R">
            <Input type="number" value={rValue} onChange={e => setRValue(Number(e.target.value))} min={0} max={255} />
          </Form.Item>
          <Form.Item label="G">
            <Input type="number" value={gValue} onChange={e => setGValue(Number(e.target.value))} min={0} max={255} />
          </Form.Item>
          <Form.Item label="B">
            <Input type="number" value={bValue} onChange={e => setBValue(Number(e.target.value))} min={0} max={255} />
          </Form.Item>
          {/* <Form.Item label="nf">
            <Input type="number" value={nfValue} onChange={e => setNfValue(Number(e.target.value))} min={0} max={255} />
          </Form.Item> */}
        </Form>
      </Modal>

      <Modal
        title="Image Preview"
        visible={isImagePreviewModalVisible}
        onCancel={() => setIsImagePreviewModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsImagePreviewModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        {imageSrc && (
          <img src={imageSrc} alt="Hyperspectral/Multispectral Visualization" style={{ width: '100%', marginTop: '20px' }} />
        )}
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
        <p>Note: Please make sure .img is uploaded before .hdr and both files must have the same filename.</p>
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
