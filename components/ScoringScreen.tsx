import React, { useState, useEffect, useMemo } from 'react';
import { Match, Player, Bowler, Innings } from '../types';
import BatIcon from './icons/BatIcon';
import BallIcon from './icons/BallIcon';
import WicketIcon from './icons/WicketIcon';

interface ScoringScreenProps {
  matchData: Match;
  onMatchComplete: (match: Match) => void;
}

// Helper component for player selection modals
const PlayerSelectionModal: React.FC<{
    players: (Player | Bowler)[];
    onSelect: (selectedIds: string[]) => void;
    title: string;
    selectionCount: number;
    buttonText: string;
}> = ({ players, onSelect, title, selectionCount, buttonText }) => {
    const [selected, setSelected] = useState<string[]>([]);

    const handleSelect = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(pId => pId !== id));
        } else if (selected.length < selectionCount) {
            setSelected([...selected, id]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {players.map(player => (
                        <div
                            key={player.id}
                            onClick={() => handleSelect(player.id)}
                            className={`p-3 rounded cursor-pointer transition ${selected.includes(player.id) ? 'bg-cricket-green' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            {player.name}
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => onSelect(selected)}
                    disabled={selected.length !== selectionCount}
                    className="mt-6 w-full py-3 bg-cricket-green text-white rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};


const ScoringScreen: React.FC<ScoringScreenProps> = ({ matchData, onMatchComplete }) => {
    const [match, setMatch] = useState<Match>(matchData);
    const [previousMatchState, setPreviousMatchState] = useState<Match | null>(null);
    
    // State for current players on the field
    const [strikerId, setStrikerId] = useState<string | null>(null);
    const [nonStrikerId, setNonStrikerId] = useState<string | null>(null);
    const [bowlerId, setBowlerId] = useState<string | null>(null);

    // State for controlling modals
    const [modal, setModal] = useState<'SELECT_OPENERS' | 'SELECT_BOWLER' | 'SELECT_NEXT_BATSMAN' | null>(null);

    const isSecondInnings = !!match.innings2;
    const innings = isSecondInnings ? match.innings2! : match.innings1;
    
    // Derived state for easy access to player objects
    const { striker, nonStriker, bowler } = useMemo(() => {
        const striker = innings.batters.find(p => p.id === strikerId) || null;
        const nonStriker = innings.batters.find(p => p.id === nonStrikerId) || null;
        const bowler = innings.bowlers.find(p => p.id === bowlerId) || null;
        return { striker, nonStriker, bowler };
    }, [strikerId, nonStrikerId, bowlerId, innings]);
    
    useEffect(() => {
        // On component mount, if it's the start of an innings, ask for openers.
        if (!strikerId && !nonStrikerId && innings.overs === 0 && innings.balls === 0 && innings.wickets === 0) {
            setModal('SELECT_OPENERS');
        }
    }, []);

    const handleScoreEvent = (run: number | 'Wd' | 'Nb' | 'Wicket') => {
        setPreviousMatchState(JSON.parse(JSON.stringify(match))); // Save state for undo

        const newMatch = JSON.parse(JSON.stringify(match));
        const currentInnings = isSecondInnings ? newMatch.innings2! : newMatch.innings1;
        
        const strikerToUpdate = currentInnings.batters.find(p => p.id === strikerId);
        const bowlerToUpdate = currentInnings.bowlers.find(p => p.id === bowlerId);

        if (!strikerToUpdate || !bowlerToUpdate) return; // Safety check

        let isWicket = run === 'Wicket';
        let runsScored = 0;

        if (typeof run === 'number') {
            runsScored = run;
            strikerToUpdate.runs += run;
            strikerToUpdate.balls += 1;
            if (run === 4) strikerToUpdate.fours += 1;
            if (run === 6) strikerToUpdate.sixes += 1;
            currentInnings.score += run;
            bowlerToUpdate.runs += run;
            currentInnings.balls += 1;
        } else if (run === 'Wd' || run === 'Nb') {
            currentInnings.score += 1;
            bowlerToUpdate.runs += 1;
            // No ball to the batter, no ball in the over count
        } else if (isWicket) {
            strikerToUpdate.isOut = true;
            strikerToUpdate.outMethod = 'Bowled'; // Simplified
            currentInnings.wickets += 1;
            bowlerToUpdate.wickets += 1;
            currentInnings.balls += 1;
        }

        // Check for end of over
        let endOfOver = false;
        if (currentInnings.balls === 6) {
            currentInnings.balls = 0;
            currentInnings.overs += 1;
            bowlerToUpdate.overs += 1;
            endOfOver = true;
        }
        
        setMatch(newMatch);

        // Post-event logic
        if (isWicket) {
            if (currentInnings.wickets === 10) {
                handleEndInnings(newMatch);
            } else {
                setStrikerId(null);
                setModal('SELECT_NEXT_BATSMAN');
            }
        } else if (endOfOver) {
             if (currentInnings.overs === match.overs) {
                handleEndInnings(newMatch);
             } else {
                handleSwapBatsmen();
                setBowlerId(null);
                setModal('SELECT_BOWLER');
             }
        } else if (runsScored % 2 !== 0) {
            handleSwapBatsmen();
        }
    };
    
    const handleSwapBatsmen = () => {
        setStrikerId(nonStrikerId);
        setNonStrikerId(strikerId);
    };

    const handleUndo = () => {
        if (previousMatchState) {
            setMatch(previousMatchState);
            setPreviousMatchState(null);
        }
    };
    
    const handleEndInnings = (finalMatchState: Match) => {
        // Simplified: for now just end the match
        handleEndMatch(finalMatchState);
    }
    
    const handleEndMatch = (matchState?: Match) => {
        const finalMatch = {
            ...(matchState || match),
            status: 'completed' as 'completed',
            result: `${innings.battingTeam} scored ${innings.score} for ${innings.wickets}.`
        }
        onMatchComplete(finalMatch);
    };

    const isScoringDisabled = !strikerId || !nonStrikerId || !bowlerId || !!modal;

    return (
        <div className="p-4 bg-gray-800 rounded-lg shadow-xl space-y-4">
            {modal === 'SELECT_OPENERS' && (
                <PlayerSelectionModal 
                    players={innings.batters}
                    onSelect={([sId, nsId]) => {
                        setStrikerId(sId);
                        setNonStrikerId(nsId);
                        setModal('SELECT_BOWLER');
                    }}
                    title="Select Opening Batsmen"
                    selectionCount={2}
                    buttonText="Confirm Openers"
                />
            )}
            {modal === 'SELECT_BOWLER' && (
                <PlayerSelectionModal 
                    players={innings.bowlers} // Add logic to filter already bowled if needed
                    onSelect={([bId]) => {
                        setBowlerId(bId);
                        setModal(null);
                    }}
                    title="Select Bowler"
                    selectionCount={1}
                    buttonText="Confirm Bowler"
                />
            )}
            {modal === 'SELECT_NEXT_BATSMAN' && (
                <PlayerSelectionModal 
                    players={innings.batters.filter(p => !p.isOut && p.id !== nonStrikerId)}
                    onSelect={([sId]) => {
                        setStrikerId(sId);
                        setModal(null);
                    }}
                    title="Select Next Batsman"
                    selectionCount={1}
                    buttonText="Confirm Batsman"
                />
            )}


            <div className="text-center p-4 bg-cricket-green rounded-lg">
                <h2 className="text-2xl font-bold">{innings.battingTeam} vs {innings.bowlingTeam}</h2>
                <p>{isSecondInnings ? "2nd Innings" : "1st Innings"} | Total Overs: {match.overs}</p>
                {isSecondInnings && <p>Target: {match.innings1.score + 1}</p>}
            </div>

            <div className="flex justify-around items-center text-center p-4 bg-gray-700 rounded-lg">
                <div>
                    <p className="text-lg text-gray-400">Score</p>
                    <p className="text-5xl font-bold">{innings.score} - {innings.wickets}</p>
                </div>
                <div>
                    <p className="text-lg text-gray-400">Overs</p>
                    <p className="text-5xl font-bold">{innings.overs}.{innings.balls}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-700 rounded">
                    <h3 className="font-bold flex items-center gap-2 mb-2"><BatIcon /> Batting</h3>
                    <div className="flex justify-between font-semibold">
                        <span>{striker?.name || '...'}*</span>
                        <span>{striker?.runs ?? 0} ({striker?.balls ?? 0})</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>{nonStriker?.name || '...'}</span>
                        <span>{nonStriker?.runs ?? 0} ({nonStriker?.balls ?? 0})</span>
                    </div>
                </div>
                <div className="p-3 bg-gray-700 rounded">
                    <h3 className="font-bold flex items-center gap-2 mb-2"><BallIcon /> Bowling</h3>
                    <div className="flex justify-between font-semibold">
                        <span>{bowler?.name || '...'}</span>
                        <span>{bowler?.wickets ?? 0}-{bowler?.runs ?? 0} ({bowler?.overs ?? 0}.{bowler?.balls ?? 0})</span>
                    </div>
                </div>
            </div>
            
            <fieldset disabled={isScoringDisabled} className="p-4 bg-gray-900 rounded-lg disabled:opacity-50">
                <legend className="text-center font-bold mb-4 px-2">Scoring Controls</legend>
                <div className="grid grid-cols-4 gap-2 text-center">
                    {[0, 1, 2, 3, 4, 6].map(run => (
                        <button key={run} onClick={() => handleScoreEvent(run)} className="p-3 bg-gray-700 rounded hover:bg-cricket-green">{run}</button>
                    ))}
                    <button onClick={() => handleScoreEvent('Wd')} className="p-3 bg-gray-600 rounded hover:bg-cricket-green">Wd</button>
                    <button onClick={() => handleScoreEvent('Nb')} className="p-3 bg-gray-600 rounded hover:bg-cricket-green">Nb</button>
                </div>
                 <div className="mt-2">
                    <button onClick={() => handleScoreEvent('Wicket')} className="p-3 bg-leather-red rounded w-full flex items-center justify-center gap-2 hover:bg-red-700"><WicketIcon /> Wicket</button>
                </div>
            </fieldset>

             <div className="pt-2 grid grid-cols-2 gap-4">
                <button onClick={handleSwapBatsmen} disabled={isScoringDisabled} className="px-4 py-2 bg-pitch-tan text-gray-900 rounded-md hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed">Swap Batsmen</button>
                <button onClick={handleUndo} disabled={!previousMatchState} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed">Undo</button>
            </div>


            <div className="pt-4 flex justify-end">
                <button onClick={() => handleEndMatch()} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    End Match
                </button>
            </div>
        </div>
    );
};

export default ScoringScreen;
