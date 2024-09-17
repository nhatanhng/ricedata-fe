import React, { useEffect, useState } from 'react';
import { Table, message, Input } from 'antd';
import axios from 'axios';
import { SearchOutlined } from '@ant-design/icons';

const StatisticalDataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(''); 

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:5000/statistical_data_table');
      setData(response.data);
    } catch (error) {
      message.error('Error fetching data');
    } 
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Filter the data based on search text
  const filteredData = data.filter((item) =>
    item.point_id.toLowerCase().includes(searchText.toLowerCase()) ||
    item.date.includes(searchText)
  );

  // Define the columns for Ant Design Table
  const columns = [
    {
      title: 'Point ID',
      dataIndex: 'point_id',
      key: 'point_id',
    },
    {
      title: 'Easting',
      dataIndex: 'x',
      key: 'x',
    },
    {
      title: 'Northing',
      dataIndex: 'y',
      key: 'y',
    },
    {
      title: 'Elevation',
      dataIndex: 'h',
      key: 'h',
    },
    {
      title: 'Chlorophyll',
      dataIndex: 'chlorophyll',
      key: 'chlorophyll',
    },
    {
      title: 'Rice Height',
      dataIndex: 'rice_height',
      key: 'rice_height',
    },
    {
      title: 'Spectral Number',
      dataIndex: 'spectral_num',
      key: 'spectral_num',
    },
    {
      title: 'Digesion',
      dataIndex: 'digesion',
      key: 'digesion',
    },
    {
      title: 'P Concentration',
      dataIndex: 'p_conc',
      key: 'p_conc',
    },
    {
      title: 'K Concentration',
      dataIndex: 'k_conc',
      key: 'k_conc',
    },
    {
      title: 'N Concentration',
      dataIndex: 'n_conc',
      key: 'n_conc',
    },
    {
      title: 'Chlorophyll A',
      dataIndex: 'chlorophyll_a',
      key: 'chlorophyll_a',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },  
  ];

  return (
    <div>
      <h2>Statistical Data</h2>
      {/* Search bar */}
      <Input
        placeholder="Search by Point ID or Date"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={handleSearch}
        style={{ marginBottom: 20, width: 300 }}
      />
      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData} 
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default StatisticalDataTable;
