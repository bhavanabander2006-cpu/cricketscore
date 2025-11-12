
import React, { useState } from 'react';
import { Match, TossChoice, DecisionChoice } from '../types';
import { performAIToss } from '../services/geminiService';

interface TossScreenProps {
  match: Match;
  onTossComplete: (match: Match) => void;
}

const TossScreen: React.FC<TossScreenProps> = ({ match, onTossComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tossResult, setTossResult] = useState<{ winner: string; decision: DecisionChoice; narrative: string } | null>(null);
  const [call, setCall] = useState<TossChoice>(TossChoice.Heads);

  const handleToss = async () => {
    setIsLoading(true);
    const result = await performAIToss(match.teamA, match.teamB, call);
    setTossResult(result);
    setIsLoading(false);
  };
  
  const handleConfirm = () => {
    if (!tossResult) return;

    const battingTeamName = tossResult.decision === 'bat' ? tossResult.winner : (tossResult.winner === match.teamA ? match.teamB : match.teamA);
    const bowlingTeamName = tossResult.decision === 'bowl' ? tossResult.winner : (tossResult.winner === match.teamA ? match.teamB : match.teamA);

    const battingTeamPlayers = battingTeamName === match.teamA ? match.playersA : match.playersB;
    const bowlingTeamPlayers = bowlingTeamName === match.teamA ? match.playersA : match.playersB;
    
    const updatedMatch: Match = {
      ...match,
      tossWinner: tossResult.winner,
      decision: tossResult.decision,
      status: 'inprogress',
      innings1: {
        battingTeam: battingTeamName,
        bowlingTeam: bowlingTeamName,
        score: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        batters: battingTeamPlayers,
        bowlers: bowlingTeamPlayers.map(p => ({
          id: p.id,
          name: p.name,
          overs: 0,
          balls: 0,
          maidens: 0,
          runs: 0,
          wickets: 0,
        })),
        fallOfWickets: [],
      }
    };
    onTossComplete(updatedMatch);
  };

  return (
    <div className="p-4 rounded-lg bg-gray-800 shadow-xl text-center">
      <h1 className="text-3xl font-bold mb-4 text-stump-white">Coin Toss</h1>
      <p className="text-lg mb-6 text-gray-300">{match.teamA} vs {match.teamB}</p>
      
      {!tossResult && (
        <>
          <p className="mb-4">{match.teamA} calls:</p>
          <div className="flex justify-center gap-4 mb-6">
            <button onClick={() => setCall(TossChoice.Heads)} className={`px-8 py-3 rounded-full text-lg font-semibold transition ${call === TossChoice.Heads ? 'bg-cricket-green text-white ring-2 ring-white' : 'bg-gray-600'}`}>Heads</button>
            <button onClick={() => setCall(TossChoice.Tails)} className={`px-8 py-3 rounded-full text-lg font-semibold transition ${call === TossChoice.Tails ? 'bg-cricket-green text-white ring-2 ring-white' : 'bg-gray-600'}`}>Tails</button>
          </div>
          <button
            onClick={handleToss}
            disabled={isLoading}
            className="px-8 py-3 bg-leather-red text-stump-white rounded-md hover:bg-red-700 transition disabled:bg-gray-500"
          >
            {isLoading ? 'Tossing...' : 'Toss with AI'}
          </button>
        </>
      )}

      {isLoading && <div className="mt-6 text-pitch-tan">The umpire is tossing the coin...</div>}
      
      {tossResult && (
        <div className="mt-6 p-6 bg-gray-700 rounded-lg animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 text-pitch-tan">Toss Result</h2>
          <p className="text-lg italic text-gray-300 mb-4">"{tossResult.narrative}"</p>
          <p className="text-xl font-semibold"><span className="font-bold text-stump-white">{tossResult.winner}</span> won the toss and elected to <span className="uppercase font-bold text-stump-white">{tossResult.decision}</span>.</p>
          <button onClick={handleConfirm} className="mt-8 px-8 py-3 bg-cricket-green text-stump-white rounded-md hover:bg-green-800 transition">
            Start Match
          </button>
        </div>
      )}
    </div>
  );
};

export default TossScreen;
