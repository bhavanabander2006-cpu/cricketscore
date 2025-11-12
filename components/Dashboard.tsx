
import React from 'react';

interface DashboardProps {
  onNewMatch: () => void;
  onMatchHistory: () => void;
  onLogout: () => void;
  userEmail: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewMatch, onMatchHistory, onLogout, userEmail }) => {
  return (
    <div className="p-4 rounded-lg bg-gray-800 shadow-xl">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-stump-white">Dashboard</h1>
          <p className="text-gray-400">Welcome, {userEmail}</p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-leather-red text-stump-white rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-700 rounded-lg text-center hover:bg-gray-600 transition cursor-pointer" onClick={onNewMatch}>
          <h2 className="text-2xl font-semibold mb-2 text-cricket-green">Start a New Match</h2>
          <p className="text-gray-300">Set up teams, overs, and start scoring a new game.</p>
        </div>
        <div className="p-6 bg-gray-700 rounded-lg text-center hover:bg-gray-600 transition cursor-pointer" onClick={onMatchHistory}>
          <h2 className="text-2xl font-semibold mb-2 text-pitch-tan">View Match History</h2>
          <p className="text-gray-300">Review scorecards and summaries of your past matches.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
