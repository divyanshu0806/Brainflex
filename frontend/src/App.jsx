import { Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './pages/SignUp.jsx'
import SignIn from './pages/SignIn.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import DashboardHome from './pages/DashboardHome.jsx'
import Problems from './pages/Problems.jsx'
import Solved from './pages/Solved.jsx'
import Attempted from './pages/Attempted.jsx'
import QuizPage from './pages/QuizPage.jsx'
import Analytics from './pages/Analytics.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="problems" element={<Problems />} />
        <Route path="solved" element={<Solved />} />
        <Route path="attempted" element={<Attempted />} />
        <Route path="quiz/:id" element={<QuizPage />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  )
}