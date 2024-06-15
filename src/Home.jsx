import React from 'react';
import { Button, Checkbox, Form, Input, Typography } from 'antd';
import "./Components/RegisterLogin.css"
import {Link, useNavigate} from 'react-router-dom'
import { useState } from 'react';
import axios from 'axios'

const Home = () => {
    const onFinish = (values) => {
        console.log('Success:', values);
      };
      const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
      };


  return(
    <div className='RegisterLogin-bg'>
      <Form className='LoginRegisterForm'
      name="basic"
      labelCol={{
        span: 8,
      }}
      wrapperCol={{
        span: 16,
      }}
      style={{
        maxWidth: 600,
      }}
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Typography.Title className='title'>Welcome Back!</Typography.Title>

      <Form.Item
        wrapperCol={{
          offset: 3,
          
        }}
      >
        <Link to="/users/files">
            <Button type="primary">
            Navigate To User Console
            </Button>
        </Link>
      </Form.Item>
    </Form>
    </div>
  )
    
  
};

export default Home;