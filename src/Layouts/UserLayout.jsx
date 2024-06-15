import React from 'react'

import { useState } from 'react'
import { Button, Layout, theme } from 'antd'
import {MenuUnfoldOutlined, MenuFoldOutlined} from '@ant-design/icons'

import Menulist from '../Components/Menulist';
import ToggleThemeButton from '../Components/ToggleThemeButton'
import {Content} from "antd/es/layout/layout.js";
import { Outlet } from 'react-router-dom'

const UserLayout = () => {
    const { Header, Sider } = Layout
    const [darkTheme, setDarkTheme] = useState(true)  
    const [collapsed, setCollapsed] = useState(false)
  
    const toggleTheme = () =>{
      setDarkTheme(!darkTheme)
    }
    const {
      token: {colorBgContainer}
    } = theme.useToken()

  return (
        <Layout>
        <Sider collapsed={collapsed}
        collapsible 
        theme={darkTheme ? 'dark' : 'light'}
        trigger = {null}> 
            <Menulist darkTheme = {darkTheme}/>  
            <ToggleThemeButton darkTheme={darkTheme} toggleTheme={toggleTheme}/>
            
        </Sider>
            <Layout>
            <Header style={{padding: 0, background: colorBgContainer}}>
            <Button type='text' 
            className="toggle"
            onClick={() => setCollapsed(!collapsed)}
            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}/>  
            </Header>
                <Content style={{padding: '0 23px',  background: colorBgContainer, minHeight: 280}}>
                    <Outlet/>
                </Content>
            </Layout>
        </Layout>
  )
}

export default UserLayout;
