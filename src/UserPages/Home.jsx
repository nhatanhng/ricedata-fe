import { useState } from 'react'
import Menulist from '../Components/Menulist'
import { Button, Layout, theme } from 'antd'
import {MenuUnfoldOutlined, MenuFoldOutlined} from '@ant-design/icons'
import {BrowserRouter,Route,Routes} from 'react-router-dom'

import ToggleThemeButton from '../Components/ToggleThemeButton'

import Files from '../UserPages/Files'
import Images from '../UserPages/Images'
import Statistics from '../UserPages/Statistics'
import About from '../UserPages/About'
import {Content} from "antd/es/layout/layout.js";

const { Header, Sider } = Layout
function Home() {
  const [darkTheme, setDarkTheme] = useState(true)  
  const [collapsed, setCollapsed] = useState(false)

  const toggleTheme = () =>{
    setDarkTheme(!darkTheme)
  }
  const {
    token: {colorBgContainer}
  } = theme.useToken()
  return (
    <>    
      <BrowserRouter>
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
                      <Routes>
                          <Route path="/files" element={<Files />} />
                          <Route path="/images" element={<Images />} />
                          <Route path="/statistics" element={<Statistics />} />
                          <Route path="/about" element={<About />} />
                      </Routes>
                  </Content>
              </Layout>
          </Layout>
      </BrowserRouter>
    </>
  )
}

export default Home;
