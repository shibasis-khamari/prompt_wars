import React, { useState, useEffect } from 'react';
import { Header } from './components/ui/Header';
import { Footer } from './components/ui/Footer';
import { HomeRoute } from './routes/HomeRoute';
import { LoginRoute } from './routes/LoginRoute';
import { SignupRoute } from './routes/SignupRoute';
import { GameArena } from './routes/GameArena';
import { SkillMapRoute } from './routes/SkillMapRoute';
import { JournalRoute } from './routes/JournalRoute';
import { AuthClient, AuthUser } from './services/authClient';
import { StreakStore } from './storage/streakStore';
import { SkillStore } from './storage/skillStore';

export type AppView = 'home' | 'login' | 'signup' | 'play' | 'skills' | 'journal';

export interface AppProps {
  initialPath?: string;
}

export const App: React.FC<AppProps> = ({ initialPath }) => {
  const getInitialView = (): AppView => {
    const p = initialPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
    if (p === '/login') return 'login';
    if (p === '/signup') return 'signup';
    if (p === '/play') return 'play';
    if (p === '/skills') return 'skills';
    if (p === '/journal') return 'journal';
    return 'home';
  };

  const [currentView, setCurrentView] = useState<AppView>(getInitialView);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (initialPath) {
      if (initialPath === '/login') setCurrentView('login');
      else if (initialPath === '/signup') setCurrentView('signup');
      else if (initialPath === '/play') setCurrentView('play');
      else if (initialPath === '/skills') setCurrentView('skills');
      else if (initialPath === '/journal') setCurrentView('journal');
      else setCurrentView('home');
    }
  }, [initialPath]);

  useEffect(() => {
    AuthClient.getCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    });

    const handlePopState = () => {
      const p = window.location.pathname;
      if (p === '/login') setCurrentView('login');
      else if (p === '/signup') setCurrentView('signup');
      else if (p === '/play') setCurrentView('play');
      else if (p === '/skills') setCurrentView('skills');
      else if (p === '/journal') setCurrentView('journal');
      else setCurrentView('home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view: AppView, path: string) => {
    setCurrentView(view);
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  const handleLogout = async () => {
    await AuthClient.logout();
    setCurrentUser(null);
    navigateTo('home', '/');
  };

  const currentPath =
    currentView === 'login'
      ? '/login'
      : currentView === 'signup'
      ? '/signup'
      : currentView === 'play'
      ? '/play'
      : currentView === 'skills'
      ? '/skills'
      : currentView === 'journal'
      ? '/journal'
      : '/';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--surface)' }}>
      <Header
        userEmail={currentUser?.email}
        currentPath={currentPath}
        streak={StreakStore.getStreak().currentStreak}
        xp={SkillStore.getUserXP()}
        onNavigateHome={() => navigateTo('home', '/')}
        onNavigatePlay={() => navigateTo('play', '/play')}
        onNavigateSkills={() => navigateTo('skills', '/skills')}
        onNavigateJournal={() => navigateTo('journal', '/journal')}
        onNavigateLogin={() => navigateTo('login', '/login')}
        onNavigateSignup={() => navigateTo('signup', '/signup')}
        onPlayGuest={() => navigateTo('play', '/play')}
        onLogout={handleLogout}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'home' && (
          <HomeRoute
            onPlayGuest={() => navigateTo('play', '/play')}
            onNavigateSignup={() => navigateTo('signup', '/signup')}
            onNavigateLogin={() => navigateTo('login', '/login')}
          />
        )}

        {currentView === 'login' && (
          <LoginRoute
            onSuccess={(user) => {
              setCurrentUser(user);
              navigateTo('play', '/play');
            }}
            onNavigateSignup={() => navigateTo('signup', '/signup')}
            onContinueGuest={() => navigateTo('play', '/play')}
          />
        )}

        {currentView === 'signup' && (
          <SignupRoute
            onSuccess={(user) => {
              setCurrentUser(user);
              navigateTo('play', '/play');
            }}
            onNavigateLogin={() => navigateTo('login', '/login')}
            onContinueGuest={() => navigateTo('play', '/play')}
          />
        )}

        {currentView === 'play' && (
          <GameArena onNavigateHome={() => navigateTo('home', '/')} />
        )}

        {currentView === 'skills' && (
          <SkillMapRoute onPracticeTopic={() => navigateTo('play', '/play')} />
        )}

        {currentView === 'journal' && (
          <JournalRoute onNavigatePlay={() => navigateTo('play', '/play')} />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default App;
