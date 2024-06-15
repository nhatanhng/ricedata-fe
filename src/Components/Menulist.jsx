import React from "react";
import {Button, Menu } from 'antd'
import { InfoCircleOutlined, FileOutlined, FileImageOutlined, BarChartOutlined, LogoutOutlined } from '@ant-design/icons' 
import { Link, useNavigate } from "react-router-dom";
import "./Badcase.css"
import "../index.css"
import { Space, Typography } from 'antd';
const { Text } = Typography;

const Menulist = ({ darkTheme }) =>{
    const navigate = useNavigate()

    return(
    
        <Menu theme={darkTheme ? 'dark' : 'light'} mode='inline' className="menu-bar"
        bordered ={false}
        onClick={({key})=> {
            navigate(key);
        }}>
            <Link to ="/users/files">
                <Menu.Item className="ant-menu-item" key="files" icon={<FileOutlined/>}> Files</Menu.Item>
            </Link>

            <Link to ="/users/images">
                <Menu.Item className="ant-menu-item" key="images" icon={<FileImageOutlined/>}> Images </Menu.Item>    
            </Link>

            <Link to ="/users/statistics">
                <Menu.Item className="ant-menu-item" key="statistics" icon={<BarChartOutlined/>}> Statistics </Menu.Item>
            </Link>

            <Link to ="/users/about">
                <Menu.Item className="ant-menu-item" key="about" icon={<InfoCircleOutlined/>}> About  </Menu.Item>
            </Link>

            <Link to="/">
                <Menu.Item className="ant-menu-item" key="logout" icon={<LogoutOutlined style={{color: "red"}}/>} color="red">
                     <Text type ="danger">Return Home </Text>
                </Menu.Item>   
            </Link>
        </Menu>
    )
}

export default Menulist;