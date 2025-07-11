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
          filters: `teamIds:${homeTeamId};seasonIds:19735`,
          sort: `-starting_at`,
          include: "participants,scores,statistics"
        }).catch(() => ({ data: [] })),
        callSportmonks(`/fixtures`, {
          filters: `teamIds:${awayTeamId};seasonIds:19735`,
          sort: `-starting_at`,
          include: "participants,scores,statistics" 
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

      // Calculate comprehensive team statistics from ALL season fixtures
      const calculateTeamStats = (fixtures: any[], teamId: number) => {
        const stats = {
          // Basic match statistics
          matchesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          winPercentage: 0,
          
          // Goal statistics
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          averageGoalsFor: 0,
          averageGoalsAgainst: 0,
          
          // Defensive statistics
          cleanSheets: 0,
          cleanSheetPercentage: 0,
          
          // Offensive statistics
          failedToScore: 0,
          failedToScorePercentage: 0,
          
          // Home vs Away breakdown
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
          
          // Form and streaks
          form: [] as string[],
          currentStreak: { type: '', count: 0 },
          longestWinStreak: 0,
          longestUnbeatenStreak: 0,
          
          // Goals per time period (if available)
          goalsFirstHalf: 0,
          goalsSecondHalf: 0,
          
          // Big wins/losses
          biggestWin: { score: '', opponent: '', date: '' },
          biggestLoss: { score: '', opponent: '', date: '' }
        };

        // Process ALL fixtures for the team (not just last 20)
        const finishedMatches = fixtures.filter(fixture => fixture.state_id === 5 && fixture.participants);
        
        finishedMatches.forEach((fixture) => {
          const teamParticipant = fixture.participants.find((p: any) => p.id === teamId);
          const opponentParticipant = fixture.participants.find((p: any) => p.id !== teamId);
          
          if (teamParticipant && opponentParticipant && fixture.scores) {
            stats.matchesPlayed++;
            
            // Determine if home or away
            const isHome = teamParticipant.meta?.location === 'home';
            
            // Get goals from scores
            const teamGoals = fixture.scores
              .filter((s: any) => s.participant_id === teamId && s.description === 'CURRENT')
              .reduce((sum: number, s: any) => sum + (s.score?.goals || 0), 0);
            
            const opponentGoals = fixture.scores
              .filter((s: any) => s.participant_id !== teamId && s.description === 'CURRENT')
              .reduce((sum: number, s: any) => sum + (s.score?.goals || 0), 0);

            // Get half-time goals if available
            const teamFirstHalf = fixture.scores
              .filter((s: any) => s.participant_id === teamId && s.description === '1ST_HALF')
              .reduce((sum: number, s: any) => sum + (s.score?.goals || 0), 0);
            
            const teamSecondHalf = teamGoals - teamFirstHalf;

            stats.goalsFor += teamGoals;
            stats.goalsAgainst += opponentGoals;
            stats.goalsFirstHalf += teamFirstHalf;
            stats.goalsSecondHalf += teamSecondHalf;

            // Home/Away statistics
            if (isHome) {
              stats.homeMatches++;
              stats.homeGoalsFor += teamGoals;
              stats.homeGoalsAgainst += opponentGoals;
            } else {
              stats.awayMatches++;
              stats.awayGoalsFor += teamGoals;
              stats.awayGoalsAgainst += opponentGoals;
            }

            // Determine result
            let result = '';
            if (teamParticipant.meta?.winner === true) {
              stats.wins++;
              if (isHome) stats.homeWins++;
              else stats.awayWins++;
              result = 'W';
              
              // Check for biggest win
              const goalDiff = teamGoals - opponentGoals;
              if (!stats.biggestWin.score || goalDiff > parseInt(stats.biggestWin.score.split('-')[0]) - parseInt(stats.biggestWin.score.split('-')[1])) {
                stats.biggestWin = {
                  score: `${teamGoals}-${opponentGoals}`,
                  opponent: opponentParticipant.name,
                  date: fixture.starting_at
                };
              }
            } else if (teamParticipant.meta?.winner === false) {
              stats.losses++;
              if (isHome) stats.homeLosses++;
              else stats.awayLosses++;
              result = 'L';
              
              // Check for biggest loss
              const goalDiff = opponentGoals - teamGoals;
              if (!stats.biggestLoss.score || goalDiff > parseInt(stats.biggestLoss.score.split('-')[1]) - parseInt(stats.biggestLoss.score.split('-')[0])) {
                stats.biggestLoss = {
                  score: `${teamGoals}-${opponentGoals}`,
                  opponent: opponentParticipant.name,
                  date: fixture.starting_at
                };
              }
            } else {
              stats.draws++;
              if (isHome) stats.homeDraws++;
              else stats.awayDraws++;
              result = 'D';
            }

            // Add to form (recent 10 matches)
            if (stats.form.length < 10) {
              stats.form.unshift(result); // Add to beginning for chronological order
            }

            // Clean sheets and failed to score
            if (opponentGoals === 0) stats.cleanSheets++;
            if (teamGoals === 0) stats.failedToScore++;
          }
        });

        // Calculate all percentages and averages
        if (stats.matchesPlayed > 0) {
          stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
          stats.averageGoalsFor = Math.round((stats.goalsFor / stats.matchesPlayed) * 100) / 100;
          stats.averageGoalsAgainst = Math.round((stats.goalsAgainst / stats.matchesPlayed) * 100) / 100;
          stats.winPercentage = Math.round((stats.wins / stats.matchesPlayed) * 100);
          stats.cleanSheetPercentage = Math.round((stats.cleanSheets / stats.matchesPlayed) * 100);
          stats.failedToScorePercentage = Math.round((stats.failedToScore / stats.matchesPlayed) * 100);
        }

        // Calculate current streak
        if (stats.form.length > 0) {
          const lastResult = stats.form[0];
          let streakCount = 1;
          for (let i = 1; i < stats.form.length; i++) {
            if (stats.form[i] === lastResult) {
              streakCount++;
            } else {
              break;
            }
          }
          stats.currentStreak = { type: lastResult, count: streakCount };
        }

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
