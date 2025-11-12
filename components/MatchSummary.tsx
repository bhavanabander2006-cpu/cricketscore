
import React, { useRef } from 'react';
import { Match, Player, Bowler, Innings } from '../types';

// Fix: Declare jspdf and html2canvas on the window object to resolve TypeScript errors.
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface MatchSummaryProps {
  match: Match;
  onBack: () => void;
}

const Scorecard: React.FC<{ innings: Innings }> = ({ innings }) => {
    return (
        <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-2">{innings.battingTeam} - {innings.score}/{innings.wickets} ({innings.overs}.{innings.balls} Overs)</h3>
            <div className="text-sm">
                <div className="grid grid-cols-5 font-bold border-b border-gray-500 pb-1 mb-1">
                    <span>Batter</span><span>R</span><span>B</span><span>4s</span><span>6s</span>
                </div>
                 {innings.batters.filter(p => p.balls > 0 || p.isOut).map(player => (
                    <div key={player.id} className="grid grid-cols-5 py-1">
                        <span className="truncate">{player.name} {player.isOut ? <span className="text-gray-400 text-xs"> (out)</span> : ''}</span>
                        <span>{player.runs}</span>
                        <span>{player.balls}</span>
                        <span>{player.fours}</span>
                        <span>{player.sixes}</span>
                    </div>
                ))}
            </div>
             <div className="text-sm mt-4">
                <div className="grid grid-cols-5 font-bold border-b border-gray-500 pb-1 mb-1">
                    <span>Bowler</span><span>O</span><span>R</span><span>W</span><span>Econ</span>
                </div>
                 {innings.bowlers.filter(p => p.overs > 0 || p.balls > 0).map(bowler => (
                    <div key={bowler.id} className="grid grid-cols-5 py-1">
                        <span className="truncate">{bowler.name}</span>
                        <span>{bowler.overs}.{bowler.balls}</span>
                        <span>{bowler.runs}</span>
                        <span>{bowler.wickets}</span>
                        <span>{((bowler.runs / (bowler.overs + bowler.balls/6)) || 0).toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const MatchSummary: React.FC<MatchSummaryProps> = ({ match, onBack }) => {
  const summaryRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const { jsPDF } = window.jspdf;
    const canvas = await window.html2canvas(summaryRef.current!, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${match.teamA}-vs-${match.teamB}-summary.pdf`);
  };

  return (
    <div className="p-4">
      <div ref={summaryRef} className="p-6 bg-gray-800 rounded-lg shadow-xl text-stump-white">
        <div className="text-center mb-6 border-b border-gray-700 pb-4">
            <h1 className="text-3xl font-bold">{match.teamA} vs {match.teamB}</h1>
            <p className="text-gray-400">{new Date(match.date).toLocaleDateString()}</p>
            <p className="text-xl font-semibold mt-2 text-pitch-tan">{match.result || 'Match In Progress'}</p>
        </div>

        <div className="space-y-6">
            <Scorecard innings={match.innings1} />
            {match.innings2 && <Scorecard innings={match.innings2} />}
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <button onClick={onBack} className="px-6 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition">Back to Dashboard</button>
        <button onClick={handleDownloadPdf} className="px-6 py-2 bg-cricket-green rounded-md hover:bg-green-800 transition">Download PDF</button>
      </div>
    </div>
  );
};

export default MatchSummary;
