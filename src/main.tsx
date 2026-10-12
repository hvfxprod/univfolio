import './index.css';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import AuthGate from './components/AuthGate';
import { SharedProfilePage } from './components/SharedProfilePage';
import { useRoute } from './utils/navigation';

function Root() {
  const route=useRoute();
  const id=new URLSearchParams(route.split('?')[1] || '').get('sharedProfile');
  return id ? <SharedProfilePage key={id} id={id}/> : <AuthGate/>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
