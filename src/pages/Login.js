import React, { useEffect } from "react";
import { Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  // Form submit
  const submitHandler = async (values) => {
    try {
      const { data } = await axios.post("/api/v1/users/login", values);
      message.success("Login success");
      localStorage.setItem("user", JSON.stringify({ ...data.user, password: "" }));
      navigate("/");
    } catch (error) {
      message.error("Something went wrong");
    }
  };

  // Prevent login for logged-in users
  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className='login-page'>
      <div className='login-form'>
        <Form layout='vertical' onFinish={submitHandler}>
          <h1>Login Form</h1>

          <Form.Item label='Email' name='email'>
            <Input type='email' />
          </Form.Item>

          <Form.Item label='Password' name='password'>
            <Input type='password' />
          </Form.Item>

          <div className='d-flex justify-content-between'>
            <Link to='/register'>Not a user? Click Here to register</Link>
            <button className='btn btn-primary'>Login</button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
