import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchRequestSchema, matchAnalysisRequestSchema, apiFootballMatchSchema, apiFootballTeamSchema } from "@shared/schema";
import { z } from "zod";

const API_KEY = process.env.SPORTMONKS_API_KEY || "b7irXCpVJbP1f0aUdqqaTkdZ23ciP1CIyyQr2TxC1J3PSTFfIU9l0dCV5FBS";
const API_BASE_URL = "https://api.sportmonks.com/v3/football";

async function callSportmonks(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  url.searchParams.append('api_token', API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Sportmonks API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Log errors if any
  if (data.errors && data.errors.length > 0) {
    console.log(`Sportmonks API Errors for ${endpoint}:`, data.errors);
  }
  
  return data;
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

      const data = await callSportmonks(endpoint, params);
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
      const { homeTeamId, awayTeamId, season = 2022 } = matchAnalysisRequestSchema.parse(req.body);

      // Fetch team statistics and head-to-head data using Sportmonks API
      const [homeTeamData, awayTeamData, h2hData] = await Promise.all([
        callSportmonks(`/teams/${homeTeamId}`),
        callSportmonks(`/teams/${awayTeamId}`),
        callSportmonks(`/fixtures/head-to-head/${homeTeamId}/${awayTeamId}`)
      ]);

      // Store in local storage for caching (adapt for Sportmonks data structure)
      if (homeTeamData.data) {
        await storage.createOrUpdateTeamStats({
          teamId: homeTeamId,
          season,
          leagueId: 501, // Premier League ID in Sportmonks
          stats: homeTeamData.data
        });
      }

      if (awayTeamData.data) {
        await storage.createOrUpdateTeamStats({
          teamId: awayTeamId,
          season,
          leagueId: 501,
          stats: awayTeamData.data
        });
      }

      res.json({
        homeTeam: homeTeamData.data || null,
        awayTeam: awayTeamData.data || null,
        headToHead: h2hData.data || []
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

      const data = await callSportmonks(`/teams/${teamId}`, {});

      // Store team data locally (adapted for Sportmonks structure)
      if (data.data) {
        const teamData = data.data;
        const existingTeam = await storage.getTeamByApiId(teamData.id);
        
        if (!existingTeam) {
          await storage.createTeam({
            apiId: teamData.id,
            name: teamData.name,
            logo: teamData.image_path || '',
            country: teamData.country?.name || '',
            founded: teamData.founded || 0,
            venue: teamData.venue?.name || ''
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

      const data = await callSportmonks(`/fixtures/${matchId}`, {
        include: "scores,participants,statistics"
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

  // Get teams for team selection (using popular teams from Sportmonks)
  app.get("/api/teams", async (req, res) => {
    try {
      const data = await callSportmonks("/teams", {
        per_page: "20",
        include: "venue"
      });
      
      // Transform data to match expected format
      const transformedData = {
        data: data.data,
        pagination: data.pagination,
        results: data.data?.length || 0,
        response: data.data || []
      };
      
      res.json(transformedData);
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
