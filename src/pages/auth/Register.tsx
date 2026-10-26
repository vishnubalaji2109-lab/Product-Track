import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  QrcodeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Divider, Form, Input, Typography, notification } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import { RegisterFormData } from '../../types/auth';

const { Title, Text } = Typography;

export const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterFormData) => { 
    setLoading(true);
    setErrorMessage(null);
    try {
      await register(values);

      notification.success({
        message: 'Account Created Successfully!',
        description:
          'Your profile has been saved to local storage. You can now log in using your registered email and password.',
        placement: 'topRight',
        duration: 4.5,
      });

      navigate('/login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/30 mb-3">
            <QrcodeOutlined style={{ fontSize: '28px' }} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight m-0">
            Product<span className="text-blue-400">Track</span> Pro
          </h1>
          <p className="text-slate-400 text-sm mt-1">Operator Account Registration</p>
        </div>

        {/* Card */}
        <Card
          className="shadow-2xl border-0 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-xl"
          styles={{ body: { padding: '32px' } }}
        >
          <div className="mb-5">
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
              Create an Operator Account
            </Title>
            <Text type="secondary" className="text-xs">
              Complete the form below to establish access to the QR management suite
            </Text>
          </div>

          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              closable
              className="mb-4 text-xs"
              onClose={() => setErrorMessage(null)}
            />
          )}
          

          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={true}>
            {/* Full Name */}
            <Form.Item
              label={<span className="text-xs font-semibold text-slate-700">Full Name</span>}
              name="fullName"
              rules={[
                { required: true, whitespace: true, message: 'Full name is required' },
                { min: 3, message: 'Name must be at least 3 characters long' },
                {
                  pattern: /^[a-zA-Z\s.'-]+$/,
                  message: 'Name can only contain alphabets and spaces',
                },
              ]}
            >
              <Input
                size="large"
                prefix={<UserOutlined className="text-slate-400 mr-1" />}
                placeholder="e.g. John Doe"
                className="rounded-lg"
              />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {/* Email */}
              <Form.Item
                label={<span className="text-xs font-semibold text-slate-700">Work Email</span>}
                name="email"
                rules={[
                  { required: true, whitespace: true, message: 'Work email is required' },
                  {
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Please enter a valid email address (e.g. name@domain.com)',
                  },
                ]}
              >
                <Input
                  size="large"
                  prefix={<MailOutlined className="text-slate-400 mr-1" />}
                  placeholder="john@company.com"
                  className="rounded-lg"
                />
              </Form.Item>

              {/* Mobile Number */}
              <Form.Item
                label={<span className="text-xs font-semibold text-slate-700">Mobile Number</span>}
                name="mobileNumber"
                rules={[
                  { required: true, whitespace: true, message: 'Mobile number is required' },
                  {
                    pattern: /^(\+?[0-9]{1,3}[- ]?)?[6-9][0-9]{9}$|^[0-9]{10}$/,
                    message: 'Enter a valid 10-digit mobile number (e.g. 9876543210)',
                  },
                ]}
              >
                <Input
                  size="large"
                  prefix={<PhoneOutlined className="text-slate-400 mr-1" />}
                  placeholder="9876543210"
                  className="rounded-lg"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {/* Password */}
              <Form.Item
                label={<span className="text-xs font-semibold text-slate-700">Password</span>}
                name="password"
                rules={[
                  { required: true, message: 'Password is required' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
                hasFeedback
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined className="text-slate-400 mr-1" />}
                  placeholder="Min. 6 characters"
                  className="rounded-lg"
                />
              </Form.Item>

              {/* Confirm Password */}
              <Form.Item
                label={
                  <span className="text-xs font-semibold text-slate-700">Confirm Password</span>
                }
                name="confirmPassword"
                dependencies={['password']}
                hasFeedback
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined className="text-slate-400 mr-1" />}
                  placeholder="Repeat password"
                  className="rounded-lg"
                />
              </Form.Item>
            </div>

            <Form.Item className="mt-2 mb-2">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg h-11 shadow-md shadow-blue-500/20"
              >
                {loading ? 'Creating Account...' : 'Register Account'}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain className="my-4 text-xs text-slate-400">
            Already have an account?
          </Divider>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Sign in with existing credentials →
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; 2026 ProductTrack Enterprise. Ready for API endpoint migration.
        </p>
      </div>
    </div>
  );
};

export default Register;
