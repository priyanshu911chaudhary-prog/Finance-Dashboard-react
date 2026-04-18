import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { ErrorBoundary } from './shared/components/ui/ErrorBoundary';
import { PageLoader } from './shared/components/ui/Loader';

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} fallbackElement={<PageLoader className="h-screen" />} />
    </ErrorBoundary>
  );
}

export default App;