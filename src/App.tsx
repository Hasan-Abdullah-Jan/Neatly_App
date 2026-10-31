import { Link, Route, Routes } from 'react-router-dom';
import { ChoreEditor } from './components/ChoreEditor';
import { Layout } from './components/Layout';
import { Toasts } from './components/Toasts';
import { Chores } from './pages/Chores';
import { Plan } from './pages/Plan';
import { Settings } from './pages/Settings';
import { SpaceDetail, Spaces } from './pages/Spaces';
import { Today } from './pages/Today';
import { Welcome } from './pages/Welcome';
import { useData } from './store/data';

export function App() {
  const needsSetup = useData((s) => !s.onboarded && s.spaces.length === 0);

  if (needsSetup) {
    return (
      <>
        <Welcome />
        <Toasts />
      </>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/chores" element={<Chores />} />
        <Route path="/spaces" element={<Spaces />} />
        <Route path="/spaces/:id" element={<SpaceDetail />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="*"
          element={
            <div className="py-20 text-center">
              <h1 className="mb-2 text-2xl font-bold">Page not found</h1>
              <Link to="/" className="text-brand">
                Go to Today
              </Link>
            </div>
          }
        />
      </Routes>
      <ChoreEditor />
      <Toasts />
    </Layout>
  );
}
