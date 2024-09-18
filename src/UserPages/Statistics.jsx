import React, { useEffect, useState } from 'react';
import { Table, message, Input } from 'antd';
import axios from 'axios';
import { SearchOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const StatisticalDataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(''); 
  const [chartDataN, setChartDataN] = useState(null); // State for N concentration chart data
  const [chartDataK, setChartDataK] = useState(null); // State for K concentration chart data
  const [chartDataP, setChartDataP] = useState(null); // State for P concentration chart data
  const [chartDataChlA, setChartDataChlA] = useState(null); // State for Chlorophyll A chart data

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

  // Fetch N concentration data
  const fetchNConcentrationData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/n_concentration');
      const data = response.data;
      const labels = []; // Collect unique dates
      const datasets = [];

      Object.keys(data).forEach(pointID => {
        data[pointID].dates.forEach(date => {
          if (!labels.includes(date)) {
            labels.push(date);
          }
        });

        datasets.push({
          label: `Point ID: ${pointID} (N)`,
          data: data[pointID].n_conc_values,
          borderColor: getRandomColor(),
          fill: false
        });
      });

      labels.sort((a, b) => new Date(a) - new Date(b)); // Sort dates in chronological order

      setChartDataN({
        labels: labels,
        datasets: datasets
      });
    } catch (error) {
      message.error('Error fetching N concentration data');
    }
  };

  // Fetch K concentration data
  const fetchKConcentrationData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/k_concentration');
      const data = response.data;
      const labels = []; // Collect unique dates
      const datasets = [];

      Object.keys(data).forEach(pointID => {
        data[pointID].dates.forEach(date => {
          if (!labels.includes(date)) {
            labels.push(date);
          }
        });

        datasets.push({
          label: `Point ID: ${pointID} (K)`,
          data: data[pointID].k_conc_values,
          borderColor: getRandomColor(),
          fill: false
        });
      });

      labels.sort((a, b) => new Date(a) - new Date(b)); // Sort dates in chronological order

      setChartDataK({
        labels: labels,
        datasets: datasets
      });
    } catch (error) {
      message.error('Error fetching K concentration data');
    }
  };

  // Fetch P concentration data
  const fetchPConcentrationData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/p_concentration');
      const data = response.data;
      const labels = []; // Collect unique dates
      const datasets = [];

      Object.keys(data).forEach(pointID => {
        data[pointID].dates.forEach(date => {
          if (!labels.includes(date)) {
            labels.push(date);
          }
        });

        datasets.push({
          label: `Point ID: ${pointID} (P)`,
          data: data[pointID].p_conc_values,
          borderColor: getRandomColor(),
          fill: false
        });
      });

      labels.sort((a, b) => new Date(a) - new Date(b)); // Sort dates in chronological order

      setChartDataP({
        labels: labels,
        datasets: datasets
      });
    } catch (error) {
      message.error('Error fetching P concentration data');
    }
  };

  // Fetch Chlorophyll A concentration data
  const fetchChlorophyllAData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/chlorophyll_a');
      const data = response.data;
      const labels = []; // Collect unique dates
      const datasets = [];

      Object.keys(data).forEach(pointID => {
        data[pointID].dates.forEach(date => {
          if (!labels.includes(date)) {
            labels.push(date);
          }
        });

        datasets.push({
          label: `Point ID: ${pointID} (Chlorophyll A)`,
          data: data[pointID].chlorophyll_a_values,
          borderColor: getRandomColor(),
          fill: false
        });
      });

      labels.sort((a, b) => new Date(a) - new Date(b)); // Sort dates in chronological order

      setChartDataChlA({
        labels: labels,
        datasets: datasets
      });
    } catch (error) {
      message.error('Error fetching Chlorophyll A data');
    }
  };

  // Run once on component mount to fetch the data
  useEffect(() => {
    fetchData(); // Fetch data for the table
    fetchNConcentrationData(); // Fetch N concentration data for the chart
    fetchKConcentrationData(); // Fetch K concentration data for the chart
    fetchPConcentrationData(); // Fetch P concentration data for the chart
    fetchChlorophyllAData(); // Fetch Chlorophyll A data for the chart
  }, []);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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

      {/* N Concentration Chart */}
      <div style={{ marginTop: 50 }}>
        <h3>N Concentration Over Time</h3>
        {chartDataN ? (
          <Line
            data={chartDataN}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'N Concentration'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date'
                  }
                }
              }
            }}
          />
        ) : (
          <div>Loading N concentration chart...</div>
        )}
      </div>

      {/* K Concentration Chart */}
      <div style={{ marginTop: 50 }}>
        <h3>K Concentration Over Time</h3>
        {chartDataK ? (
          <Line
            data={chartDataK}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'K Concentration'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date'
                  }
                }
              }
            }}
          />
        ) : (
          <div>Loading K concentration chart...</div>
        )}
      </div>

      {/* P Concentration Chart */}
      <div style={{ marginTop: 50 }}>
        <h3>P Concentration Over Time</h3>
        {chartDataP ? (
          <Line
            data={chartDataP}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'P Concentration'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date'
                  }
                }
              }
            }}
          />
        ) : (
          <div>Loading P concentration chart...</div>
        )}
      </div>

      {/* Chlorophyll A Chart */}
      <div style={{ marginTop: 50 }}>
        <h3>Chlorophyll A Over Time</h3>
        {chartDataChlA ? (
          <Line
            data={chartDataChlA}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Chlorophyll A'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date'
                  }
                }
              }
            }}
          />
        ) : (
          <div>Loading Chlorophyll A chart...</div>
        )}
      </div>
    </div>
  );
};

export default StatisticalDataTable;
