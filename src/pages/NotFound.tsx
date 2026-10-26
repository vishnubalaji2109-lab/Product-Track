import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist in ProductTrack Pro."
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')} className="bg-blue-600">
            Back to Dashboard
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
