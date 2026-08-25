import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { CreateEditTestPage } from "@/features/tests/CreateEditTestPage";
import { Toaster } from "@/components/ui/Toaster";
import { AddQuestionsPage } from "@/features/questions/AddQuestionsPage";
import { TestViewPage } from "@/features/tests/TestViewPage";
import { PreviewPublishPage } from "@/features/preview/PreviewPublishPage";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tests/new"
            element={
              <ProtectedRoute>
                <CreateEditTestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/:id/edit"
            element={
              <ProtectedRoute>
                <CreateEditTestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/:id/questions"
            element={
              <ProtectedRoute>
                <AddQuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/tests/:id" element={
            <ProtectedRoute>
              <TestViewPage />
            </ProtectedRoute>
          } />
          <Route path="/tests/:id/preview" element={
            <ProtectedRoute>
              <PreviewPublishPage />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}