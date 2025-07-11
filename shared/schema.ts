import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  apiId: integer("api_id").notNull().unique(),
  name: text("name").notNull(),
  logo: text("logo"),
  country: text("country"),
  founded: integer("founded"),
  venue: text("venue"),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  apiId: integer("api_id").notNull().unique(),
  homeTeamId: integer("home_team_id").references(() => teams.id),
  awayTeamId: integer("away_team_id").references(() => teams.id),
  leagueName: text("league_name").notNull(),
  leagueCountry: text("league_country"),
  matchDate: timestamp("match_date").notNull(),
  status: text("status").notNull(),
  venue: text("venue"),
});

export const teamStats = pgTable("team_stats", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id),
  season: integer("season").notNull(),
  leagueId: integer("league_id").notNull(),
  stats: jsonb("stats").notNull(), // Store all statistics as JSON
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const matchStats = pgTable("match_stats", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id),
  homeTeamStats: jsonb("home_team_stats"),
  awayTeamStats: jsonb("away_team_stats"),
  h2hStats: jsonb("h2h_stats"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Zod schemas
export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
});

export const insertTeamStatsSchema = createInsertSchema(teamStats).omit({
  id: true,
  lastUpdated: true,
});

export const insertMatchStatsSchema = createInsertSchema(matchStats).omit({
  id: true,
  lastUpdated: true,
});

// API response schemas
export const apiFootballTeamSchema = z.object({
  team: z.object({
    id: z.number(),
    name: z.string(),
    logo: z.string().optional(),
    country: z.string().optional(),
    founded: z.number().optional(),
  }),
  venue: z.object({
    name: z.string().optional(),
  }).optional(),
});

export const apiFootballMatchSchema = z.object({
  fixture: z.object({
    id: z.number(),
    date: z.string(),
    status: z.object({
      short: z.string(),
    }),
    venue: z.object({
      name: z.string().optional(),
    }).optional(),
  }),
  league: z.object({
    name: z.string(),
    country: z.string().optional(),
  }),
  teams: z.object({
    home: apiFootballTeamSchema,
    away: apiFootballTeamSchema,
  }),
});

export const searchRequestSchema = z.object({
  query: z.string().min(1),
  type: z.enum(["teams", "leagues", "matches"]).optional().default("matches"),
});

export const matchAnalysisRequestSchema = z.object({
  homeTeamId: z.number(),
  awayTeamId: z.number(),
  season: z.number().optional(),
});

// Types
export type Team = typeof teams.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type TeamStats = typeof teamStats.$inferSelect;
export type MatchStats = typeof matchStats.$inferSelect;

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertTeamStats = z.infer<typeof insertTeamStatsSchema>;
export type InsertMatchStats = z.infer<typeof insertMatchStatsSchema>;

export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type MatchAnalysisRequest = z.infer<typeof matchAnalysisRequestSchema>;
