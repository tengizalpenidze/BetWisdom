import { teams, matches, teamStats, matchStats, type Team, type Match, type TeamStats, type MatchStats, type InsertTeam, type InsertMatch, type InsertTeamStats, type InsertMatchStats } from "@shared/schema";

export interface IStorage {
  // Teams
  getTeam(id: number): Promise<Team | undefined>;
  getTeamByApiId(apiId: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  
  // Matches
  getMatch(id: number): Promise<Match | undefined>;
  getMatchByApiId(apiId: number): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  
  // Team Stats
  getTeamStats(teamId: number, season: number): Promise<TeamStats | undefined>;
  createOrUpdateTeamStats(stats: InsertTeamStats): Promise<TeamStats>;
  
  // Match Stats
  getMatchStats(matchId: number): Promise<MatchStats | undefined>;
  createOrUpdateMatchStats(stats: InsertMatchStats): Promise<MatchStats>;
}

export class MemStorage implements IStorage {
  private teams: Map<number, Team>;
  private matches: Map<number, Match>;
  private teamStats: Map<string, TeamStats>; // key: `${teamId}-${season}`
  private matchStats: Map<number, MatchStats>;
  private currentTeamId: number;
  private currentMatchId: number;
  private currentTeamStatsId: number;
  private currentMatchStatsId: number;

  constructor() {
    this.teams = new Map();
    this.matches = new Map();
    this.teamStats = new Map();
    this.matchStats = new Map();
    this.currentTeamId = 1;
    this.currentMatchId = 1;
    this.currentTeamStatsId = 1;
    this.currentMatchStatsId = 1;
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamByApiId(apiId: number): Promise<Team | undefined> {
    return Array.from(this.teams.values()).find(team => team.apiId === apiId);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.currentTeamId++;
    const team: Team = { ...insertTeam, id };
    this.teams.set(id, team);
    return team;
  }

  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getMatchByApiId(apiId: number): Promise<Match | undefined> {
    return Array.from(this.matches.values()).find(match => match.apiId === apiId);
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const match: Match = { ...insertMatch, id };
    this.matches.set(id, match);
    return match;
  }

  async getTeamStats(teamId: number, season: number): Promise<TeamStats | undefined> {
    const key = `${teamId}-${season}`;
    return this.teamStats.get(key);
  }

  async createOrUpdateTeamStats(insertStats: InsertTeamStats): Promise<TeamStats> {
    const key = `${insertStats.teamId}-${insertStats.season}`;
    const existing = this.teamStats.get(key);
    
    if (existing) {
      const updated: TeamStats = {
        ...existing,
        ...insertStats,
        lastUpdated: new Date(),
      };
      this.teamStats.set(key, updated);
      return updated;
    } else {
      const id = this.currentTeamStatsId++;
      const stats: TeamStats = {
        ...insertStats,
        id,
        lastUpdated: new Date(),
      };
      this.teamStats.set(key, stats);
      return stats;
    }
  }

  async getMatchStats(matchId: number): Promise<MatchStats | undefined> {
    return this.matchStats.get(matchId);
  }

  async createOrUpdateMatchStats(insertStats: InsertMatchStats): Promise<MatchStats> {
    const existing = this.matchStats.get(insertStats.matchId!);
    
    if (existing) {
      const updated: MatchStats = {
        ...existing,
        ...insertStats,
        lastUpdated: new Date(),
      };
      this.matchStats.set(insertStats.matchId!, updated);
      return updated;
    } else {
      const id = this.currentMatchStatsId++;
      const stats: MatchStats = {
        ...insertStats,
        id,
        lastUpdated: new Date(),
      };
      this.matchStats.set(insertStats.matchId!, stats);
      return stats;
    }
  }
}

export const storage = new MemStorage();
