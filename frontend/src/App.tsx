import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TasksPage } from "./pages/TasksPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />

            {/* Placeholders for future phases */}
            <Route
              path="/notes"
              element={
                <PlaceholderPage
                  moduleName="Developer Notes & Snippets"
                  phase="Phase 2"
                  description="A rich markdown note-taking workspace with syntax highlighting, tag taxonomies, and architectural decision records (ADRs)."
                  plannedFeatures={[
                    "Markdown WYSIWYG editor with KaTeX & Mermaid diagrams",
                    "Code snippet organizer with syntax highlighting",
                    "Tag filtering and full-text search",
                    "Task embedding directly inside notes",
                  ]}
                />
              }
            />

            <Route
              path="/projects"
              element={
                <PlaceholderPage
                  moduleName="Projects & Repositories"
                  phase="Phase 2"
                  description="Group your tasks and sprints into cohesive projects with progress tracking, milestones, and Git repository links."
                  plannedFeatures={[
                    "Project boards with Kanban workflow",
                    "Sprint milestones & progress meters",
                    "GitHub repository linkage and commit sync",
                    "Multi-project task overview",
                  ]}
                />
              }
            />

            <Route
              path="/habits"
              element={
                <PlaceholderPage
                  moduleName="Developer Habits & Deep Work"
                  phase="Phase 3"
                  description="Cultivate consistent developer habits: daily commit streaks, reading technical documentation, and Pomodoro deep work blocks."
                  plannedFeatures={[
                    "Habit tracking streaks & heatmap grids",
                    "Pomodoro / deep focus timer integrated with active task",
                    "Weekly developer review & retrospective generator",
                    "Health and posture reminder prompts",
                  ]}
                />
              }
            />

            <Route
              path="/settings"
              element={
                <PlaceholderPage
                  moduleName="System Settings & Preferences"
                  phase="Phase 3"
                  description="Manage your account profile, API keys, database backups, notifications, and theme customizations."
                  plannedFeatures={[
                    "Profile and avatar preferences",
                    "JWT token refresh & security configurations",
                    "Export workspace data as JSON/CSV",
                    "Custom theme accent options",
                  ]}
                />
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
