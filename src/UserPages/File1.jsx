import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, notification, Space, Table, Spin } from 'antd';
import { Link } from 'react-router-dom';

const File1 = () => {
    const [hdrFile, setHdrFile] = useState(null);
    const [imgFile, setImgFile] = useState(null);
    const [data, setData] = useState([]);
    const [selectedData, setSelectedData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const addFileButtonStyle = {
        display: 'flex',
        gap: '5px',
        marginBottom: '16px',
        justifyContent: 'flex-end',
    };

    const loadingOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)', // Darker background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };

    const loadingOverlaySpinStyle = {
        fontSize: '36px', // Larger spinner size
    };

    const showDeleteModal = (selectedItem) => {
        setSelectedData(selectedItem);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteOk = async () => {
        setIsDeleteModalOpen(false);
        await deleteImageFile(selectedData);
    };

    const showUploadModal = () => {
        setIsUploadModalOpen(true);
    };

    const handleUploadOk = async () => {
        setIsUploading(true);
        setIsUploadModalOpen(false);

        try {
            await handleUploadFiles();

        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        setIsDeleteModalOpen(false);
        setIsUploadModalOpen(false);
        setSelectedData(null);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        const fileType = file.name.split('.').pop().toLowerCase();

        if (fileType === 'hdr') {
            setHdrFile(file);
        } else if (fileType === 'img') {
            setImgFile(file);
        } else {
            notification.error({
                message: 'Error',
                description: 'Unsupported file type. Please choose an HDR (.hdr) or IMG (.img) file.',
            });
        }
    };

    const handleUploadFiles = async () => {
        try {
            if (!hdrFile || !imgFile) {
                notification.error({
                    message: 'Error',
                    description: 'Please choose both an HDR (.hdr) and an IMG (.img) file to upload.',
                });
                return;
            }

            const formData = new FormData();
            formData.append('header', hdrFile);
            formData.append('image', imgFile);

            const response = await axios.post('http://127.0.0.1:5000/uploads/images', formData) 
            // {
            //     headers: {
            //         'Content-Type': 'multipart/form-data'
            //         // Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            //         // UserId: localStorage.getItem('userId'),
            //     },
            // });

            notification.success({
                message: 'Success',
                description: 'Files uploaded successfully.',
            });

            await fetchImageFile();
        } catch (error) {
            console.error('Error uploading files:', error.response?.data || error.message);

            notification.error({
                message: 'Error',
                description: 'Failed to upload files. Please try again.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const fetchImageFile = async () => {
        try {
            // const config = {

            //     headers: {
            //         Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            //         UserId: localStorage.getItem('userId'),
            //     },
            // };
            const response = await axios.get(`http://127.0.0.1:5000/uploads/images`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const deleteImageFile = async (selectedItem) => {
        try {
            // const configHeader = {
            //     headers: {
            //         Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            //     },
            // };
            await axios.delete(`http://127.0.0.1:5000/uploads/images/${selectedItem.id}`);
            await fetchImageFile();
            notification.success({
                message: 'Data deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting file:', error);
            notification.error({
                message: 'Error deleting file',
            });
        }
    };

    const viewImage = async (values) => {
        localStorage.setItem('id', values.id);
    };

    useEffect(() => {
        fetchImageFile();
    }, []);

    const columns = [
        {
            title: 'File',
            width: 100,
            dataIndex: 'path',
            fixed: 'left',
            render: (text) => {
                const fileName = text.split('/').pop(``);
                return <span>{fileName}</span>;
            },
        },
        {
            title: 'Type',
            dataIndex: 'type',
            width: 120,
        },
        {
            title: 'Action',
            fixed: 'right',
            width: 100,
            render: (text, record) => (
                <Space size="middle">
                    <a style={{ color: 'red' }} onClick={() => showDeleteModal(record)}>
                        Delete
                    </a>
                    {record.type === 'header' && (
                        <Link to={`/users/image`}>
                            <a style={{ color: 'blue' }} onClick={() => viewImage(record)}>
                                View
                            </a>
                        </Link>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <>
            <div style={addFileButtonStyle}>
                <Button onClick={showUploadModal} type="primary">
                    Upload Files
                </Button>
            </div>

            <Table columns={columns} dataSource={data} scroll={{ x: 1500 }} sticky={{ offsetHeader: 64 }} />

            {isUploading && (
                <div style={loadingOverlayStyle}>
                    <Spin tip="Uploading..." style={loadingOverlaySpinStyle} />
                </div>
            )}

            {selectedData && (
                <Modal
                    title="Confirm Delete"
                    visible={isDeleteModalOpen}
                    onOk={handleDeleteOk}
                    onCancel={handleCancel}
                >
                    <p>Are you sure you want to delete this file?</p>
                </Modal>
            )}

            <Modal
                title="Confirm Upload"
                visible={isUploadModalOpen}
                onOk={handleUploadOk}
                onCancel={handleCancel}
            >
                <p>HDR file</p>
                <input type="file" accept=".hdr" onChange={handleFileChange} />
                <p>IMG file</p>
                <input type="file" accept=".img" onChange={handleFileChange} />
            </Modal>
        </>
    );
};

export default File1;
