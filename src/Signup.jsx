import React, {useState} from 'react';
import { Button, Checkbox, Form, Input, Typography } from 'antd';
import { Link, useNavigate} from 'react-router-dom';
import axios from 'axios'
// import {Link, useNavigate} from 'react-router-dom';



// const[action, setAction]= useState('')

// const LoginLink = () =>{
//   setAction('active')
// }


const Signup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate()
  const onFinish = async(values) => {
    try{
      const response = await axios.post('http://127.0.0.1:5000/signup', values);
      console.log(response.data);
      navigate("/")
    }catch (error) {
      console.error('Error registering user:', error);
      navigate('/register')
    }   
  }

  // const onFinishFailed = (errorInfo) => {
  //   console.log('Failed:', errorInfo);
  // };
  // // const navigate = useNavigate()

  return(
    
  <div className='RegisterLogin-bg'>
      <Form className='LoginRegisterForm'
      form={form}
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
      // onFinishFailed={onFinishFailed}
      autoComplete="off"
  >
        <Typography.Title className='title'>Signup</Typography.Title>
        <Form.Item
          label="User name"
          name="username"
          rules={[
            {
              required: true,
              message: 'Please input your username!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: 'Please input your Email!',
            },
            {
              type: 'email',
              message: 'The input is not valid E-mail!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your password!',
            },
            {
              min: 6,
              message: 'Name must be at least 6 characters long!',
            }
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
        label="Re-type Password"
        name="password2"
        dependencies={['password']}
        rules={[
          {
            required: true,
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The new password that you entered do not match!'));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type="primary" htmlType="submit">
          Create account
          </Button>
          {/* <br/> */}
          <p> Already have account? <Link to="/">Login</Link></p>
        </Form.Item>
      </Form>
  </div>
    
   
  )
};

export default Signup;