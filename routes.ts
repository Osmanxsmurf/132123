import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTrackSchema, insertPlaylistSchema, insertAiInteractionSchema } from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Track routes
  app.get("/api/tracks", async (req, res) => {
    try {
      const tracks = await storage.getTracks();
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tracks" });
    }
  });

  app.get("/api/tracks/trending", async (req, res) => {
    try {
      const tracks = await storage.getTrendingTracks();
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending tracks" });
    }
  });

  app.get("/api/tracks/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      const tracks = await storage.searchTracks(q);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to search tracks" });
    }
  });

  app.post("/api/tracks", async (req, res) => {
    try {
      const data = insertTrackSchema.parse(req.body);
      const track = await storage.createTrack(data);
      res.status(201).json(track);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid track data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create track" });
    }
  });

  app.patch("/api/tracks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const track = await storage.updateTrack(id, updates);
      
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      res.json(track);
    } catch (error) {
      res.status(500).json({ message: "Failed to update track" });
    }
  });

  // Playlist routes
  app.get("/api/playlists", async (req, res) => {
    try {
      const playlists = await storage.getPlaylists();
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch playlists" });
    }
  });

  app.get("/api/playlists/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const playlist = await storage.getPlaylist(id);
      
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch playlist" });
    }
  });

  app.post("/api/playlists", async (req, res) => {
    try {
      const data = insertPlaylistSchema.parse(req.body);
      const playlist = await storage.createPlaylist(data);
      res.status(201).json(playlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid playlist data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create playlist" });
    }
  });

  app.patch("/api/playlists/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const playlist = await storage.updatePlaylist(id, updates);
      
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to update playlist" });
    }
  });

  app.delete("/api/playlists/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePlaylist(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete playlist" });
    }
  });

  // AI Chat routes
  app.get("/api/ai/interactions", async (req, res) => {
    try {
      const interactions = await storage.getAiInteractions();
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI interactions" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Query is required" });
      }

      // Advanced AI music recommendation system
      let aiResponse = "";
      let recommendations: string[] = [];

      const queryLower = query.toLowerCase();
      const allTracks = await storage.getTracks();
      
      // Intelligent Turkish music recommendations based on query analysis
      if (queryLower.includes("sakin") || queryLower.includes("hüzünlü") || queryLower.includes("melankolik") || queryLower.includes("üzgün")) {
        aiResponse = "Anlayıştığım kadarıyla sakin ve melankolik şarkılar arıyorsunuz. Size ruh halinize uygun, duygusal ve içten şarkılar önerdim. Bu parçalar genellikle yavaş tempolu ve derin sözlere sahip.";
        const melancholicTracks = allTracks.filter(t => 
          t.artist.includes("Müslüm") || 
          t.artist.includes("Orhan Gencebay") || 
          t.title.includes("Ayrılık") ||
          t.title.includes("Hüzün")
        );
        recommendations = melancholicTracks.slice(0, 3).map(t => t.id);
      } else if (queryLower.includes("mutlu") || queryLower.includes("enerjik") || queryLower.includes("dans") || queryLower.includes("eğlenceli")) {
        aiResponse = "Enerjik ve mutlu şarkılar istiyorsunuz! Size dans edebileceğiniz, pozitif enerjisi yüksek parçalar seçtim. Bu şarkılar günlük stresınızı atmanız için mükemmel.";
        const energeticTracks = allTracks.filter(t => 
          t.artist.includes("Tarkan") || 
          t.artist.includes("Ceza") ||
          (t.playCount || 0) > 800000
        );
        recommendations = energeticTracks.slice(0, 3).map(t => t.id);
      } else if (queryLower.includes("türkçe") || queryLower.includes("pop") || queryLower.includes("klasik")) {
        aiResponse = "Türkçe pop klasiklerini seviyorsunuz! Size nostaljik hisler uyandıracak, kaliteli Türkçe pop şarkıları seçtim. Bu parçalar Türk müziğinin altın çağından.";
        const turkishPop = allTracks.filter(t => 
          t.artist.includes("Sezen Aksu") || 
          t.artist.includes("Ajda Pekkan") ||
          t.artist.includes("Sertab Erener")
        );
        recommendations = turkishPop.slice(0, 3).map(t => t.id);
      } else if (queryLower.includes("rock") || queryLower.includes("alternatif")) {
        aiResponse = "Rock ve alternatif müzik seviyorsunuz! Size güçlü vokal ve enstrümantal düzenlemeleri olan şarkılar önerdim.";
        const rockTracks = allTracks.filter(t => 
          t.artist.includes("Haluk Levent") ||
          t.platform === "youtube"
        );
        recommendations = rockTracks.slice(0, 3).map(t => t.id);
      } else if (queryLower.includes("çalışma") || queryLower.includes("odaklanma") || queryLower.includes("konsantrasyon")) {
        aiResponse = "Çalışma için uygun şarkılar arıyorsunuz. Size dikkat dağıtmayacak, arka planda çalabilecek yumuşak melodili parçalar seçtim.";
        const studyTracks = allTracks.filter(t => t.duration && t.duration > 200 && t.duration < 300);
        recommendations = studyTracks.slice(0, 3).map(t => t.id);
      } else if (queryLower.includes("playlist") || queryLower.includes("liste")) {
        aiResponse = "Size özel bir playlist oluşturmak için farklı türlerden bir karışım hazırladım. Bu liste ruh halinize göre değişken şarkılar içeriyor.";
        recommendations = allTracks.slice(0, 5).map(t => t.id);
      } else {
        // Genel öneri
        aiResponse = `"${query}" ile ilgili size özel müzik önerileri hazırladım. Bu şarkılar popülerlik ve müzik kalitesi göz önünde bulundurularak seçildi. Umuyorum beğenirsiniz!`;
        const popularTracks = allTracks.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
        recommendations = popularTracks.slice(0, 4).map(t => t.id);
      }

      const interaction = await storage.createAiInteraction({
        query,
        response: aiResponse,
        recommendations,
      });

      res.json(interaction);
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ message: "Failed to process AI chat request" });
    }
  });

  // External API integration routes
  app.get("/api/external/search", async (req, res) => {
    try {
      const { q, platform = "all" } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      const results: any[] = [];

      // YouTube API integration
      if (platform === "all" || platform === "youtube") {
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.YT_API_KEY || "";
        if (YOUTUBE_API_KEY) {
          try {
            const ytResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&videoCategoryId=10&key=${YOUTUBE_API_KEY}&maxResults=5`
            );
            
            if (ytResponse.ok) {
              const ytData = await ytResponse.json();
              if (ytData.items) {
                for (const item of ytData.items) {
                  results.push({
                    id: `yt_${item.id.videoId}`,
                    title: item.snippet.title,
                    artist: item.snippet.channelTitle,
                    album: null,
                    duration: null,
                    imageUrl: item.snippet.thumbnails.medium?.url,
                    previewUrl: null,
                    externalId: item.id.videoId,
                    platform: "youtube",
                    playCount: 0,
                    isLiked: false,
                  });
                }
              }
            }
          } catch (error) {
            console.error("YouTube API error:", error);
          }
        }
      }

      // Spotify API integration
      if (platform === "all" || platform === "spotify") {
        const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
        const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
        
        if (SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET) {
          try {
            // Get Spotify access token
            const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
              },
              body: "grant_type=client_credentials",
            });

            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json();
              
              const searchResponse = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=5`,
                {
                  headers: {
                    "Authorization": `Bearer ${tokenData.access_token}`,
                  },
                }
              );

              if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                if (searchData.tracks && searchData.tracks.items) {
                  for (const track of searchData.tracks.items) {
                    results.push({
                      id: `sp_${track.id}`,
                      title: track.name,
                      artist: track.artists.map((a: any) => a.name).join(", "),
                      album: track.album.name,
                      duration: Math.floor(track.duration_ms / 1000),
                      imageUrl: track.album.images[1]?.url,
                      previewUrl: track.preview_url,
                      externalId: track.id,
                      platform: "spotify",
                      playCount: track.popularity || 0,
                      isLiked: false,
                    });
                  }
                }
              }
            }
          } catch (error) {
            console.error("Spotify API error:", error);
          }
        }
      }

      // Last.fm API integration
      if (platform === "all" || platform === "lastfm") {
        const LASTFM_API_KEY = process.env.LASTFM_API_KEY || "";
        if (LASTFM_API_KEY) {
          try {
            const lfmResponse = await fetch(
              `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(q)}&api_key=${LASTFM_API_KEY}&format=json&limit=5`
            );
            
            if (lfmResponse.ok) {
              const lfmData = await lfmResponse.json();
              if (lfmData.results && lfmData.results.trackmatches && lfmData.results.trackmatches.track) {
                const tracks = Array.isArray(lfmData.results.trackmatches.track) 
                  ? lfmData.results.trackmatches.track 
                  : [lfmData.results.trackmatches.track];
                
                for (const track of tracks) {
                  results.push({
                    id: `lfm_${track.mbid || nanoid()}`,
                    title: track.name,
                    artist: track.artist,
                    album: null,
                    duration: null,
                    imageUrl: track.image?.find((img: any) => img.size === "medium")?.["#text"],
                    previewUrl: null,
                    externalId: track.mbid,
                    platform: "lastfm",
                    playCount: parseInt(track.listeners) || 0,
                    isLiked: false,
                  });
                }
              }
            }
          } catch (error) {
            console.error("Last.fm API error:", error);
          }
        }
      }

      res.json(results);
    } catch (error) {
      console.error("External search error:", error);
      res.status(500).json({ message: "Failed to search external platforms" });
    }
  });

  // User preferences routes
  app.get("/api/user/preferences", async (req, res) => {
    try {
      const preferences = await storage.getUserPreferences();
      res.json(preferences || {
        id: "default",
        favoriteGenres: [],
        recentSearches: [],
        likedTracks: [],
        playHistory: [],
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.patch("/api/user/preferences", async (req, res) => {
    try {
      const updates = req.body;
      const preferences = await storage.updateUserPreferences(updates);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
