import { apiRequest } from "./queryClient";

export interface ApiFootballResponse<T> {
  get: string;
  parameters: Record<string, any>;
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

export interface TeamData {
  team: {
    id: number;
    name: string;
    code: string;
    country: string;
    founded: number;
    national: boolean;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

export interface MatchData {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number;
      second: number;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: TeamData;
    away: TeamData;
  };
  goals: {
    home: number;
    away: number;
  };
  score: {
    halftime: {
      home: number;
      away: number;
    };
    fulltime: {
      home: number;
      away: number;
    };
    extratime: {
      home: number;
      away: number;
    };
    penalty: {
      home: number;
      away: number;
    };
  };
}

export interface TeamStatsData {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  team: TeamData["team"];
  form: string;
  fixtures: {
    played: {
      home: number;
      away: number;
      total: number;
    };
    wins: {
      home: number;
      away: number;
      total: number;
    };
    draws: {
      home: number;
      away: number;
      total: number;
    };
    loses: {
      home: number;
      away: number;
      total: number;
    };
  };
  goals: {
    for: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
    };
    against: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
    };
  };
  biggest: {
    streak: {
      wins: number;
      draws: number;
      loses: number;
    };
    wins: {
      home: string;
      away: string;
    };
    loses: {
      home: string;
      away: string;
    };
    goals: {
      for: {
        home: number;
        away: number;
      };
      against: {
        home: number;
        away: number;
      };
    };
  };
  clean_sheet: {
    home: number;
    away: number;
    total: number;
  };
  failed_to_score: {
    home: number;
    away: number;
    total: number;
  };
  penalty: {
    scored: {
      total: number;
      percentage: string;
    };
    missed: {
      total: number;
      percentage: string;
    };
    total: number;
  };
  lineups: Array<{
    formation: string;
    played: number;
  }>;
  cards: {
    yellow: {
      "0-15": {
        total: number;
        percentage: string;
      };
      "16-30": {
        total: number;
        percentage: string;
      };
      "31-45": {
        total: number;
        percentage: string;
      };
      "46-60": {
        total: number;
        percentage: string;
      };
      "61-75": {
        total: number;
        percentage: string;
      };
      "76-90": {
        total: number;
        percentage: string;
      };
      "91-105": {
        total: number;
        percentage: string;
      };
      "106-120": {
        total: number;
        percentage: string;
      };
    };
    red: {
      "0-15": {
        total: number;
        percentage: string;
      };
      "16-30": {
        total: number;
        percentage: string;
      };
      "31-45": {
        total: number;
        percentage: string;
      };
      "46-60": {
        total: number;
        percentage: string;
      };
      "61-75": {
        total: number;
        percentage: string;
      };
      "76-90": {
        total: number;
        percentage: string;
      };
      "91-105": {
        total: number;
        percentage: string;
      };
      "106-120": {
        total: number;
        percentage: string;
      };
    };
  };
}

export interface AnalysisResponse {
  homeTeam: TeamStatsData | null;
  awayTeam: TeamStatsData | null;
  headToHead: MatchData[];
}

export async function searchMatches(query: string, type: "teams" | "leagues" | "matches" = "matches"): Promise<ApiFootballResponse<any>> {
  const response = await apiRequest("POST", "/api/search", { query, type });
  return response.json();
}

export async function getUpcomingMatches(): Promise<ApiFootballResponse<MatchData>> {
  const response = await apiRequest("GET", "/api/matches/upcoming");
  return response.json();
}

export async function analyzeMatch(homeTeamId: number, awayTeamId: number, season?: number): Promise<AnalysisResponse> {
  const response = await apiRequest("POST", "/api/analyze", { homeTeamId, awayTeamId, season });
  return response.json();
}

export async function getTeam(id: number): Promise<ApiFootballResponse<TeamData>> {
  const response = await apiRequest("GET", `/api/teams/${id}`);
  return response.json();
}

export async function getMatch(id: number): Promise<ApiFootballResponse<MatchData>> {
  const response = await apiRequest("GET", `/api/matches/${id}`);
  return response.json();
}

export async function getTeams(): Promise<ApiFootballResponse<TeamData>> {
  const response = await apiRequest("GET", "/api/teams");
  return response.json();
}
