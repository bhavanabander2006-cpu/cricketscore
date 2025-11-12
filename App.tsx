
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import NewMatchSetup from './components/NewMatchSetup';
import TossScreen from './components/TossScreen';
import ScoringScreen from './components/ScoringScreen';
import MatchSummary from './components/MatchSummary';
import MatchHistory from './components/MatchHistory';
import { Match, AppScreen, MatchHistoryType } from './types';

const App: React.FC = () => {
  const [userEmail, setUserEmail] = useLocalStorage<string | null>('userEmail', null);
  const [screen, setScreen] = useState<AppScreen>(AppScreen.Login);
  const [matches, setMatches] = useLocalStorage<MatchHistoryType>('matches', {});
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (userEmail) {
      setScreen(AppScreen.Dashboard);
    } else {
      setScreen(AppScreen.Login);
    }
  }, [userEmail]);

  const handleLogin = (email: string) => {
    setUserEmail(email);
    if (!matches[email]) {
      setMatches({ ...matches, [email]: [] });
    }
    setScreen(AppScreen.Dashboard);
  };
  
  const handleLogout = () => {
    setUserEmail(null);
    setCurrentMatch(null);
    setScreen(AppScreen.Login);
  };

  const handleNewMatchSetup = (match: Match) => {
    setCurrentMatch(match);
    setScreen(AppScreen.Toss);
  };
  
  const handleTossComplete = (match: Match) => {
    setCurrentMatch(match);
    setScreen(AppScreen.Scoring);
  };

  const handleMatchComplete = (match: Match) => {
    const userMatches = matches[userEmail!] || [];
    setMatches({ ...matches, [userEmail!]: [...userMatches, match] });
    setCurrentMatch(match);
    setScreen(AppScreen.MatchSummary);
  };

  const renderScreen = () => {
    switch (screen) {
      case AppScreen.Login:
        return <LoginScreen onLogin={handleLogin} />;
      case AppScreen.Dashboard:
        return <Dashboard 
                  onNewMatch={() => setScreen(AppScreen.NewMatch)} 
                  onMatchHistory={() => setScreen(AppScreen.MatchHistory)}
                  onLogout={handleLogout}
                  userEmail={userEmail!}
                />;
      case AppScreen.NewMatch:
        return <NewMatchSetup onSetupComplete={handleNewMatchSetup} onBack={() => setScreen(AppScreen.Dashboard)} />;
      case AppScreen.Toss:
        return <TossScreen match={currentMatch!} onTossComplete={handleTossComplete} />;
      case AppScreen.Scoring:
        return <ScoringScreen matchData={currentMatch!} onMatchComplete={handleMatchComplete} />;
      case AppScreen.MatchSummary:
        return <MatchSummary match={currentMatch!} onBack={() => setScreen(AppScreen.Dashboard)} />;
      case AppScreen.MatchHistory:
        const userMatches = userEmail ? (matches[userEmail] || []) : [];
        return <MatchHistory 
                  matches={userMatches} 
                  onViewSummary={(match) => { setCurrentMatch(match); setScreen(AppScreen.MatchSummary); }} 
                  onBack={() => setScreen(AppScreen.Dashboard)} 
                />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-stump-white font-sans">
      <div className="container mx-auto p-4 max-w-4xl">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
