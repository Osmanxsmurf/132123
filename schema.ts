import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tracks = pgTable("tracks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album").$type<string | null>().default(null),
  duration: integer("duration").$type<number | null>().default(null),
  imageUrl: text("image_url").$type<string | null>().default(null),
  previewUrl: text("preview_url").$type<string | null>().default(null),
  externalId: text("external_id").$type<string | null>().default(null),
  platform: text("platform").notNull(),
  playCount: integer("play_count").$type<number | null>().default(0),
  isLiked: boolean("is_liked").$type<boolean | null>().default(false),
});

export const playlists = pgTable("playlists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").$type<string | null>().default(null),
  imageUrl: text("image_url").$type<string | null>().default(null),
  isAiGenerated: boolean("is_ai_generated").$type<boolean | null>().default(false),
  createdAt: timestamp("created_at").$type<Date | null>().defaultNow(),
  trackIds: jsonb("track_ids").$type<string[] | null>().default([]),
});

export const aiInteractions = pgTable("ai_interactions", {
  id: text("id").primaryKey(),
  query: text("query").notNull(),
  response: text("response").notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: text("id").primaryKey(),
  favoriteGenres: jsonb("favorite_genres").$type<string[]>().default([]),
  recentSearches: jsonb("recent_searches").$type<string[]>().default([]),
  likedTracks: jsonb("liked_tracks").$type<string[]>().default([]),
  playHistory: jsonb("play_history").$type<string[]>().default([]),
});

export const insertTrackSchema = createInsertSchema(tracks);
export const insertPlaylistSchema = createInsertSchema(playlists).omit({ id: true, createdAt: true });
export const insertAiInteractionSchema = createInsertSchema(aiInteractions).omit({ id: true, createdAt: true });
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ id: true });

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type AiInteraction = typeof aiInteractions.$inferSelect;
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
