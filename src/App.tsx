import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { CalendarPage } from './pages/CalendarPage';
import { PipelinePage } from './pages/PipelinePage';
import { PostsPage } from './pages/PostsPage';
import { MediaLibraryPage } from './pages/MediaLibraryPage';
import { SettingsPage } from './pages/SettingsPage';
import { CloudAccountPage } from './pages/CloudAccountPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Independent opt-in Auth pilot. The local MVP stays intact until verified live E2E. */}
        <Route path="/cloud" element={<CloudAccountPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="create" element={<CreatePostPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="media" element={<MediaLibraryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Deferred V1+ screens: preserve their implementation/data, not misleading public navigation. */}
          <Route path="analytics" element={<Navigate to="/" replace />} />
          <Route path="experiments" element={<Navigate to="/" replace />} />
          <Route path="accounts" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
