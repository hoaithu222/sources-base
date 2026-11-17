import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles/globals.css';
import App from '@/app/App';
import { bootstrapApp } from '@/app/bootstrap';
import { describeError, ErrorScreen, logAppError } from '@/app/components';

const container = document.getElementById('root');
if (!container) throw new Error('Không tìm thấy phần tử #root để khởi động ứng dụng.');

const root = createRoot(container);
try {
  bootstrapApp();
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  logAppError('Khởi động ứng dụng thất bại:', error);
  root.render(<ErrorScreen error={describeError(error)} level="app" />);
}
