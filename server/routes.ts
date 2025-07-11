import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchRequestSchema, matchAnalysisRequestSchema, apiFootballMatchSchema, apiFootballTeamSchema } from "@shared/schema";
import { z } from "zod";

const API_KEY = process.env.API_FOOTBALL_KEY || process.env.RAPID_API_KEY || "9f9f63cf6fc1f84236ef09a7ba2a8982";
const API_BASE_URL = "https://v3.football.api-sports.io";

async function callApiFootball(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-apisports-key': API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Search for matches, teams, or leagues
  app.post("/api/search", async (req, res) => {
    try {
      const { query, type } = searchRequestSchema.parse(req.body);
      
      let endpoint = "";
      let params: Record<string, string> = {};
      
      switch (type) {
        case "teams":
          endpoint = "/teams";
          params = { search: query };
          break;
        case "leagues":
          endpoint = "/leagues";
          params = { search: query };
          break;
        case "matches":
        default:
          return res.json({
            get: "search",
            parameters: { search: query, type: "matches" },
            errors: ["Free API plan limitations: Live match search not available. Use 'teams' search to find Premier League teams for analysis."],
            results: 0,
            paging: { current: 1, total: 1 },
            response: [],
            message: "Try searching for 'teams' instead to find Premier League teams you can analyze."
          });
          break;
      }

      const data = await callApiFootball(endpoint, params);
      res.json(data);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to search",
        error: "SEARCH_FAILED"
      });
    }
  });

  // Get teams for analysis (Free plan compatible)
  app.get("/api/matches/upcoming", async (req, res) => {
    try {
      res.json({
        get: "fixtures",
        parameters: { league: "39" },
        errors: ["Free API plan limitations: Unable to access current match fixtures. Please use the team analysis feature below."],
        results: 0,
        paging: { current: 1, total: 1 },
        response: [],
        message: "Due to API limitations on the free plan, live match data is not available. However, you can analyze any two Premier League teams using their historical statistics from the 2022 season."
      });
    } catch (error) {
      console.error("Upcoming matches error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch upcoming matches",
        error: "MATCHES_FETCH_FAILED"
      });
    }
  });

  // Get team statistics and head-to-head analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { homeTeamId, awayTeamId, season = new Date().getFullYear() } = matchAnalysisRequestSchema.parse(req.body);

      // Fetch team statistics
      const [homeTeamStats, awayTeamStats, h2hData] = await Promise.all([
        callApiFootball("/teams/statistics", {
          team: homeTeamId.toString(),
          season: season.toString(),
          league: "39" // Default to Premier League, should be dynamic
        }),
        callApiFootball("/teams/statistics", {
          team: awayTeamId.toString(),
          season: season.toString(),
          league: "39"
        }),
        callApiFootball("/fixtures/headtohead", {
          h2h: `${homeTeamId}-${awayTeamId}`
        })
      ]);

      // Store in local storage for caching
      if (homeTeamStats.response?.[0]) {
        await storage.createOrUpdateTeamStats({
          teamId: homeTeamId,
          season,
          leagueId: 39,
          stats: homeTeamStats.response[0]
        });
      }

      if (awayTeamStats.response?.[0]) {
        await storage.createOrUpdateTeamStats({
          teamId: awayTeamId,
          season,
          leagueId: 39,
          stats: awayTeamStats.response[0]
        });
      }

      res.json({
        homeTeam: homeTeamStats.response?.[0] || null,
        awayTeam: awayTeamStats.response?.[0] || null,
        headToHead: h2hData.response || []
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze teams",
        error: "ANALYSIS_FAILED"
      });
    }
  });

  // Get team information
  app.get("/api/teams/:id", async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }

      const data = await callApiFootball("/teams", {
        id: teamId.toString()
      });

      // Store team data locally
      if (data.response?.[0]) {
        const teamData = data.response[0];
        const existingTeam = await storage.getTeamByApiId(teamData.team.id);
        
        if (!existingTeam) {
          await storage.createTeam({
            apiId: teamData.team.id,
            name: teamData.team.name,
            logo: teamData.team.logo,
            country: teamData.team.country,
            founded: teamData.team.founded,
            venue: teamData.venue?.name
          });
        }
      }

      res.json(data);
    } catch (error) {
      console.error("Team fetch error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch team",
        error: "TEAM_FETCH_FAILED"
      });
    }
  });

  // Get match details
  app.get("/api/matches/:id", async (req, res) => {
    try {
      const matchId = parseInt(req.params.id);
      if (isNaN(matchId)) {
        return res.status(400).json({ message: "Invalid match ID" });
      }

      const data = await callApiFootball("/fixtures", {
        id: matchId.toString()
      });

      res.json(data);
    } catch (error) {
      console.error("Match fetch error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch match",
        error: "MATCH_FETCH_FAILED"
      });
    }
  });

  // Get Premier League teams for team selection
  app.get("/api/teams", async (req, res) => {
    try {
      const data = await callApiFootball("/teams", {
        league: "39", // Premier League
        season: "2022"
      });
      res.json(data);
    } catch (error) {
      console.error("Teams fetch error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch teams",
        error: "TEAMS_FETCH_FAILED"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
