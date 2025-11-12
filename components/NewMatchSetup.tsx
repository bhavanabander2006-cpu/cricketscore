
import React, { useState } from 'react';
import { Match, Player, Innings } from '../types';

interface NewMatchSetupProps {
  onSetupComplete: (match: Match) => void;
  onBack: () => void;
}

const NewMatchSetup: React.FC<NewMatchSetupProps> = ({ onSetupComplete, onBack }) => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [overs, setOvers] = useState(5);
  const [playersA, setPlayersA] = useState(Array(11).fill(''));
  const [playersB, setPlayersB] = useState(Array(11).fill(''));

  const handlePlayerChange = (team: 'A' | 'B', index: number, value: string) => {
    if (team === 'A') {
      const newPlayers = [...playersA];
      newPlayers[index] = value;
      setPlayersA(newPlayers);
    } else {
      const newPlayers = [...playersB];
      newPlayers[index] = value;
      setPlayersB(newPlayers);
    }
  };

  const createPlayerList = (names: string[]): Player[] => {
    return names.map((name, index) => ({
      id: `${name.replace(/\s+/g, '-')}-${index}`,
      name: name || `Player ${index + 1}`,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPlayersA = createPlayerList(playersA);
    const finalPlayersB = createPlayerList(playersB);

    const initialInnings: Innings = {
      battingTeam: '',
      bowlingTeam: '',
      score: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      batters: [],
      bowlers: [],
      fallOfWickets: [],
    };
    
    const newMatch: Match = {
      id: `match-${Date.now()}`,
      teamA: teamA || 'Team A',
      teamB: teamB || 'Team B',
      overs: overs,
      playersA: finalPlayersA,
      playersB: finalPlayersB,
      tossWinner: '',
      decision: 'bat',
      innings1: initialInnings,
      status: 'toss',
      date: new Date().toISOString(),
    };
    onSetupComplete(newMatch);
  };

  return (
    <div className="p-4 rounded-lg bg-gray-800 shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-stump-white">New Match Setup</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input
            type="text"
            placeholder="Team A Name"
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cricket-green"
          />
          <input
            type="number"
            placeholder="Overs"
            value={overs}
            onChange={(e) => setOvers(Math.max(1, parseInt(e.target.value, 10)))}
            className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cricket-green text-center"
          />
          <input
            type="text"
            placeholder="Team B Name"
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cricket-green"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-lg font-semibold mb-2 text-center">{teamA || 'Team A'} Players</h3>
                {playersA.map((p, i) => (
                    <input key={i} type="text" placeholder={`Player ${i+1}`} value={p} onChange={e => handlePlayerChange('A', i, e.target.value)} className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600 text-sm"/>
                ))}
            </div>
             <div>
                <h3 className="text-lg font-semibold mb-2 text-center">{teamB || 'Team B'} Players</h3>
                {playersB.map((p, i) => (
                    <input key={i} type="text" placeholder={`Player ${i+1}`} value={p} onChange={e => handlePlayerChange('B', i, e.target.value)} className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600 text-sm"/>
                ))}
            </div>
        </div>

        <div className="flex justify-between mt-8">
            <button type="button" onClick={onBack} className="px-6 py-2 bg-gray-600 text-stump-white rounded-md hover:bg-gray-500 transition">Back</button>
            <button type="submit" className="px-6 py-2 bg-cricket-green text-stump-white rounded-md hover:bg-green-800 transition">Proceed to Toss</button>
        </div>
      </form>
    </div>
  );
};

export default NewMatchSetup;
