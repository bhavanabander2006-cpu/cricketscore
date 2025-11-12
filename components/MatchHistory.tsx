
import React from 'react';
import { Match } from '../types';

interface MatchHistoryProps {
  matches: Match[];
  onViewSummary: (match: Match) => void;
  onBack: () => void;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ matches, onViewSummary, onBack }) => {
  return (
    <div className="p-4 rounded-lg bg-gray-800 shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-stump-white border-b border-gray-700 pb-4">Match History</h1>
      <div className="space-y-4">
        {matches.length > 0 ? (
          matches.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(match => (
            <div key={match.id} className="p-4 bg-gray-700 rounded-lg flex justify-between items-center hover:bg-gray-600 transition">
              <div>
                <p className="font-semibold text-lg">{match.teamA} vs {match.teamB}</p>
                <p className="text-sm text-gray-400">{new Date(match.date).toLocaleDateString()}</p>
                <p className="text-sm text-pitch-tan mt-1">{match.result}</p>
              </div>
              <button onClick={() => onViewSummary(match)} className="px-4 py-2 bg-cricket-green text-stump-white rounded-md hover:bg-green-800">
                View Summary
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-8">No matches played yet.</p>
        )}
      </div>
       <div className="mt-8">
            <button onClick={onBack} className="px-6 py-2 bg-gray-600 text-stump-white rounded-md hover:bg-gray-500 transition">Back to Dashboard</button>
      </div>
    </div>
  );
};

export default MatchHistory;
