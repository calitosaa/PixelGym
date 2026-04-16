import { useEffect } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import BottomNav from './components/BottomNav';
import { ToastProvider } from './components/ui/Toast';

import Dashboard from './pages/Dashboard';
import WorkoutsList from './pages/workouts/WorkoutsList';
import RoutineDetail from './pages/workouts/RoutineDetail';
import ActiveSession from './pages/workouts/ActiveSession';
import ExercisesList from './pages/exercises/ExercisesList';
import ExerciseDetail from './pages/exercises/ExerciseDetail';
import DietDashboard from './pages/diet/DietDashboard';
import ScanMeal from './pages/diet/ScanMeal';
import Coach from './pages/coach/Coach';
import Profile from './pages/profile/Profile';
import Onboarding from './pages/profile/Onboarding';

import { useAppState } from './data/store';

function AppRoutes() {
  const location = useLocation();
  const state = useAppState();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.profile.theme);
  }, [state.profile.theme]);

  // Gate on onboarding
  if (!state.profile.onboardingDone && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  if (state.profile.onboardingDone && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Dashboard />} />

          <Route path="/workouts" element={<WorkoutsList />} />
          <Route path="/workouts/:id" element={<RoutineDetail />} />
          <Route path="/workouts/:id/active" element={<ActiveSession />} />

          <Route path="/exercises" element={<ExercisesList />} />
          <Route path="/exercises/:id" element={<ExerciseDetail />} />

          <Route path="/diet" element={<DietDashboard />} />
          <Route path="/diet/scan" element={<ScanMeal />} />

          <Route path="/coach" element={<Coach />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </HashRouter>
  );
}
