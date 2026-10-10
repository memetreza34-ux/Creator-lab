/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { CalendarPage } from './pages/CalendarPage';
import { PipelinePage } from './pages/PipelinePage';
import { PostsPage } from './pages/PostsPage';
import { MediaLibraryPage } from './pages/MediaLibraryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ExperimentLabPage } from './pages/ExperimentLabPage';
import { SocialAccountsPage } from './pages/SocialAccountsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CloudAccountPage } from './pages/CloudAccountPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cloud" element={<CloudAccountPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="create" element={<CreatePostPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="media" element={<MediaLibraryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="experiments" element={<ExperimentLabPage />} />
          <Route path="accounts" element={<SocialAccountsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
