import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyOutlined, LockOutlined, MailOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Checkbox, Divider, Form, Input, Typography, message } from 'antd';
import { DUMMY_CREDENTIALS } from '../../constants/authConstants';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import { LoginCredentials } from '../../types/auth';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const [form] = Form.useForm();  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // Fill preconfigured dummy credentials
  const handleQuickFill = () => {
    form.setFieldsValue({
      email: DUMMY_CREDENTIALS.email,
      password: DUMMY_CREDENTIALS.password, 
      rememberMe: true,
    });
    setErrorMessage(null);
    message.info('Dummy credentials auto-fille d');
  };

  const handleSubmit = async (values: LoginCredentials) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await login(values);
      message.success('Welcome back! Login successful.');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/30 mb-3">
            <QrcodeOutlined style={{ fontSize: '28px' }} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight m-0">
            Product<span className="text-blue-400">Track</span> Pro
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Enterprise QR Tracking & Location Intelligence
          </p>
        </div>

        {/* Login Card */}
        <Card
          className="shadow-2xl border-0 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-xl"
          styles={{ body: { padding: '28px' } }}
        >
          <div className="mb-5">
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
              Sign In to Your Account
            </Title>
            <Text type="secondary" className="text-xs">
              Enter your corporate credentials to access the console
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

          {/* Quick Demo Credentials Callout */}
          <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 mb-5 flex items-start justify-between gap-3">
            <div className="text-xs text-blue-900">
              <span className="font-semibold block text-blue-950">Demo Credentials:</span>
              <span className="text-slate-600">Email:</span>{' '}
              <code className="text-blue-700 font-mono font-bold">{DUMMY_CREDENTIALS.email}</code>
              <br />
              <span className="text-slate-600">Password:</span>{' '}
              <code className="text-blue-700 font-mono font-bold">
                {DUMMY_CREDENTIALS.password}
              </code>
            </div>
            <Button
              size="small"
              type="primary"
              ghost
              icon={<KeyOutlined />}
              onClick={handleQuickFill}
              className="text-xs"
            >
              Auto Fill
            </Button>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              email: authService.getRememberedEmail() || '',
              rememberMe: Boolean(authService.getRememberedEmail()),
            }}
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              label={<span className="text-xs font-semibold text-slate-700">Email Address</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter your email address' },
                { type: 'email', message: 'Please enter a valid email address' },
              ]}
            >

              <Input
                size="large"
                prefix={<MailOutlined className="text-slate-400 mr-1" />}
                placeholder="name@company.com"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-semibold text-slate-700">Password</span>}
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-slate-400 mr-1" />}
                placeholder="••••••••"
                className="rounded-lg"
              />
            </Form.Item>

            <div className="flex items-center justify-between mb-4">
              <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                <Checkbox className="text-xs text-slate-600">Remember me</Checkbox>
              </Form.Item>
              <span className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
                Forgot password?
              </span>
            </div>

            <Form.Item className="mb-2">
              <Button 
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg h-11 shadow-md shadow-blue-500/20"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>


          <Divider plain className="my-4 text-xs text-slate-400">
             Don't have an account?
          </Divider>

          <div className="text-center">
            <Link
              to="/registe r"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Create a new operator account →
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; 2026 ProductTrack Enterprise. Secured with Local Mock Persistence.
        </p>
      </div> 
    </div>
  );
};

export default Login;
