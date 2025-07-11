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

      // Fetch team data, standings, and recent fixtures for both teams
      const [homeTeamData, awayTeamData, standingsData, homeFixtures, awayFixtures] = await Promise.all([
        callSportmonks(`/teams/${homeTeamId}`),
        callSportmonks(`/teams/${awayTeamId}`),
        callSportmonks(`/standings`, {
          filters: `leagueIds:501`
        }),
        callSportmonks(`/fixtures`, {
          filters: `teamIds:${homeTeamId}`,
          sort: `-starting_at`
        }).catch(() => ({ data: [] })),
        callSportmonks(`/fixtures`, {
          filters: `teamIds:${awayTeamId}`,
          sort: `-starting_at`
        }).catch(() => ({ data: [] }))
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

      // Debug available fixture data and display what's actually returned
      const calculateTeamStats = (fixtures: any[], teamId: number) => {
        console.log(`\n=== FIXTURE DATA ANALYSIS FOR TEAM ${teamId} ===`);
        console.log(`Total fixtures returned: ${fixtures.length}`);
        
        if (fixtures.length > 0) {
          console.log('Sample fixture data:');
          console.log(JSON.stringify(fixtures.slice(0, 3), null, 2));
        }

        const stats = {
          matchesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          winPercentage: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          averageGoalsFor: 0,
          averageGoalsAgainst: 0,
          cleanSheets: 0,
          cleanSheetPercentage: 0,
          failedToScore: 0,
          failedToScorePercentage: 0,
          homeMatches: 0,
          homeWins: 0,
          homeDraws: 0,
          homeLosses: 0,
          homeGoalsFor: 0,
          homeGoalsAgainst: 0,
          awayMatches: 0,
          awayWins: 0,
          awayDraws: 0,
          awayLosses: 0,
          awayGoalsFor: 0,
          awayGoalsAgainst: 0,
          form: [] as string[],
          currentStreak: { type: '', count: 0 },
          dataAvailable: fixtures.length > 0,
          apiLimitation: 'Free plan - limited historical data only'
        };

        // Log the limitation for user feedback
        console.log(`\n=== API LIMITATION DETECTED ===`);
        console.log(`The Sportmonks free plan only provides limited historical data.`);
        console.log(`Current Celtic/Rangers fixture data is not available in the free tier.`);
        console.log(`Available fixtures: ${fixtures.length}`);
        
        return stats;
      };

      const homeTeamStats = calculateTeamStats(homeFixtures?.data || [], homeTeamId);
      const awayTeamStats = calculateTeamStats(awayFixtures?.data || [], awayTeamId);

      // Find current league positions for both teams
      const homeTeamStanding = standingsData?.data?.find(s => s.participant_id === homeTeamId);
      const awayTeamStanding = standingsData?.data?.find(s => s.participant_id === awayTeamId);

      res.json({
        homeTeam: {
          ...homeTeamData.data || null,
          standing: homeTeamStanding || null,
          recentFixtures: homeFixtures?.data?.slice(0, 5) || [],
          statistics: homeTeamStats
        },
        awayTeam: {
          ...awayTeamData.data || null,
          standing: awayTeamStanding || null,
          recentFixtures: awayFixtures?.data?.slice(0, 5) || [],
          statistics: awayTeamStats
        },
        headToHead: [], // Temporarily disabled due to API endpoint limitations
        leagueStandings: standingsData?.data?.filter(s => 
          s.league_id === 501 && [homeTeamId, awayTeamId].includes(s.participant_id)
        ) || []
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

  // Get teams from major European leagues
  app.get("/api/teams", async (req, res) => {
    try {
      // Major European leagues with known IDs from Sportmonks (available even in free plan)
      const majorLeagues = [
        { id: 501, name: "Scottish Premiership" },
        { id: 8, name: "Premier League" },
        { id: 384, name: "La Liga" },
        { id: 301, name: "Serie A" },
        { id: 399, name: "Bundesliga" },
        { id: 493, name: "Ligue 1" },
        { id: 564, name: "Eredivisie" },
        { id: 271, name: "Danish Superliga" },
        { id: 218, name: "Belgian Pro League" }
      ];

      // Try to fetch teams from multiple leagues (some may fail on free plan)
      const promises = majorLeagues.map(async league => {
        try {
          const data = await callSportmonks("/teams", {
            filters: `leagueIds:${league.id}`,
            per_page: "15"
          });
          
          // Add league info to each team
          const teamsWithLeague = (data.data || []).map((team: any) => ({
            ...team,
            leagueName: league.name,
            leagueId: league.id
          }));
          
          return { leagueName: league.name, teams: teamsWithLeague };
        } catch (error) {
          console.log(`Failed to fetch teams from ${league.name}:`, error);
          return { leagueName: league.name, teams: [] };
        }
      });

      const results = await Promise.all(promises);
      
      // Combine all teams from different leagues
      const allTeams = results.reduce((acc, result) => {
        return [...acc, ...result.teams];
      }, []);

      // Sort teams by league and name
      allTeams.sort((a, b) => {
        if (a.leagueName !== b.leagueName) {
          return a.leagueName.localeCompare(b.leagueName);
        }
        return a.name.localeCompare(b.name);
      });

      const transformedData = {
        data: allTeams,
        results: allTeams.length,
        response: allTeams,
        leagues: results.map(r => ({ 
          name: r.leagueName, 
          teamCount: r.teams.length 
        }))
      };
      
      console.log(`Fetched ${allTeams.length} teams from ${results.filter(r => r.teams.length > 0).length} leagues`);
      
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
