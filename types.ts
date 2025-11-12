
export interface Player {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  outMethod?: string;
}

export interface Bowler {
  id: string;
  name: string;
  overs: number;
  balls: number;
  maidens: number;
  runs: number;
  wickets: number;
}

export interface Innings {
  battingTeam: string;
  bowlingTeam: string;
  score: number;
  wickets: number;
  overs: number;
  balls: number;
  batters: Player[];
  bowlers: Bowler[];
  fallOfWickets: { score: number; wicket: number; player: string }[];
}

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  playersA: Player[];
  playersB: Player[];
  overs: number;
  tossWinner: string;
  decision: 'bat' | 'bowl';
  innings1: Innings;
  innings2?: Innings;
  status: 'pending' | 'toss' | 'inprogress' | 'completed';
  result?: string;
  date: string;
}

export enum AppScreen {
  Login = 'login',
  Dashboard = 'dashboard',
  NewMatch = 'newMatch',
  Toss = 'toss',
  Scoring = 'scoring',
  MatchSummary = 'matchSummary',
  MatchHistory = 'matchHistory',
}

export type MatchHistoryType = {
  [email: string]: Match[];
};

export enum TossChoice {
    Heads = "Heads",
    Tails = "Tails"
}

export enum DecisionChoice {
    Bat = "bat",
    Bowl = "bowl"
}
