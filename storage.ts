import { 
  Track, 
  InsertTrack, 
  Playlist, 
  InsertPlaylist, 
  AiInteraction, 
  InsertAiInteraction,
  UserPreferences,
  InsertUserPreferences
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // Tracks
  getTrack(id: string): Promise<Track | undefined>;
  getTracks(): Promise<Track[]>;
  createTrack(track: InsertTrack): Promise<Track>;
  updateTrack(id: string, updates: Partial<Track>): Promise<Track | undefined>;
  searchTracks(query: string): Promise<Track[]>;
  getTrendingTracks(): Promise<Track[]>;
  
  // Playlists
  getPlaylist(id: string): Promise<Playlist | undefined>;
  getPlaylists(): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, updates: Partial<Playlist>): Promise<Playlist | undefined>;
  deletePlaylist(id: string): Promise<boolean>;
  
  // AI Interactions
  getAiInteraction(id: string): Promise<AiInteraction | undefined>;
  getAiInteractions(): Promise<AiInteraction[]>;
  createAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction>;
  
  // User Preferences
  getUserPreferences(): Promise<UserPreferences | undefined>;
  updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences>;
}

export class MemStorage implements IStorage {
  private tracks: Map<string, Track>;
  private playlists: Map<string, Playlist>;
  private aiInteractions: Map<string, AiInteraction>;
  private userPreferences: UserPreferences | undefined;

  constructor() {
    this.tracks = new Map();
    this.playlists = new Map();
    this.aiInteractions = new Map();
    this.userPreferences = undefined;
    this.initializeWithSampleData();
  }

  private async initializeWithSampleData() {
    // Sample Turkish tracks
    const sampleTracks = [
      {
        id: "tr_1",
        title: "Gel Gör Beni Aşk Neyledi",
        artist: "Sezen Aksu",
        album: "Gülümse",
        duration: 245,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400",
        previewUrl: null,
        externalId: null,
        platform: "youtube",
        playCount: 1250000,
        isLiked: false,
      },
      {
        id: "tr_2", 
        title: "Yalnızlık",
        artist: "Tarkan",
        album: "Metamorfoz",
        duration: 198,
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400",
        previewUrl: null,
        externalId: null,
        platform: "spotify",
        playCount: 890000,
        isLiked: true,
      },
      {
        id: "tr_3",
        title: "Ayrılık",
        artist: "Müslüm Gürses",
        album: "Klasikler",
        duration: 267,
        imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400",
        previewUrl: null,
        externalId: null,
        platform: "lastfm",
        playCount: 567000,
        isLiked: false,
      },
      {
        id: "tr_4",
        title: "Kırmızı",
        artist: "Haluk Levent",
        album: "Yollarda",
        duration: 289,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400",
        previewUrl: null,
        externalId: null,
        platform: "youtube",
        playCount: 234000,
        isLiked: false,
      },
      {
        id: "tr_5",
        title: "Cesaretin Var mı Aşka",
        artist: "Sertab Erener",
        album: "Lal",
        duration: 321,
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400",
        previewUrl: null,
        externalId: null,
        platform: "spotify",
        playCount: 445000,
        isLiked: true,
      },
      {
        id: "tr_6",
        title: "Gemiler",
        artist: "Ceza",
        album: "Rapstar",
        duration: 278,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400",
        previewUrl: null,
        externalId: null,
        platform: "youtube",
        playCount: 1100000,
        isLiked: false,
      },
      {
        id: "tr_7",
        title: "Adını Feriha Koydum",
        artist: "Orhan Gencebay",
        album: "Klasikler",
        duration: 245,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400",
        previewUrl: null,
        externalId: null,
        platform: "lastfm",
        playCount: 678000,
        isLiked: false,
      },
      {
        id: "tr_8",
        title: "İstanbul'da Sonbahar",
        artist: "Ajda Pekkan",
        album: "Süperstar",
        duration: 213,
        imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400",
        previewUrl: null,
        externalId: null,
        platform: "spotify",
        playCount: 789000,
        isLiked: true,
      }
    ];

    for (const track of sampleTracks) {
      this.tracks.set(track.id, track as any);
    }

    // Sample playlists
    const samplePlaylists = [
      {
        name: "AI Önerisi: Türkçe Pop Klasikleri",
        description: "Yapay zeka tarafından seçilen zamansız Türkçe pop şarkıları",
        imageUrl: null,
        isAiGenerated: true,
        trackIds: ["tr_1", "tr_2", "tr_5", "tr_8"],
      },
      {
        name: "Melankolik Anlar",
        description: "Hüzünlü ve duygusal şarkılar",
        imageUrl: null,
        isAiGenerated: true,
        trackIds: ["tr_3", "tr_7"],
      },
    ];

    for (const playlist of samplePlaylists) {
      await this.createPlaylist(playlist as any);
    }

    // Initialize user preferences
    this.userPreferences = {
      id: "user_1",
      favoriteGenres: ["Türkçe Pop", "Arabesk", "Rock"],
      recentSearches: ["Sezen Aksu", "Tarkan", "melankolik şarkılar"],
      likedTracks: ["tr_2", "tr_5", "tr_8"],
      playHistory: ["tr_1", "tr_2", "tr_3", "tr_5"],
    };
  }

  // Tracks
  async getTrack(id: string): Promise<Track | undefined> {
    return this.tracks.get(id);
  }

  async getTracks(): Promise<Track[]> {
    return Array.from(this.tracks.values());
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const id = insertTrack.id || nanoid();
    const track: Track = {
      ...insertTrack,
      id,
      album: insertTrack.album || null,
      duration: insertTrack.duration || null,
      imageUrl: insertTrack.imageUrl || null,
      previewUrl: insertTrack.previewUrl || null,
      externalId: insertTrack.externalId || null,
      playCount: insertTrack.playCount || 0,
      isLiked: insertTrack.isLiked || false,
    };
    this.tracks.set(id, track);
    return track;
  }

  async updateTrack(id: string, updates: Partial<Track>): Promise<Track | undefined> {
    const existing = this.tracks.get(id);
    if (!existing) return undefined;
    
    const updated: Track = { ...existing, ...updates };
    this.tracks.set(id, updated);
    return updated;
  }

  async searchTracks(query: string): Promise<Track[]> {
    const tracks = Array.from(this.tracks.values());
    const lowercaseQuery = query.toLowerCase();
    return tracks.filter(track => 
      track.title.toLowerCase().includes(lowercaseQuery) ||
      track.artist.toLowerCase().includes(lowercaseQuery) ||
      track.album?.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getTrendingTracks(): Promise<Track[]> {
    const tracks = Array.from(this.tracks.values());
    return tracks
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 10);
  }

  // Playlists
  async getPlaylist(id: string): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async getPlaylists(): Promise<Playlist[]> {
    return Array.from(this.playlists.values());
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = nanoid();
    const playlist: Playlist = {
      id,
      name: insertPlaylist.name,
      description: insertPlaylist.description || null,
      imageUrl: insertPlaylist.imageUrl || null,
      isAiGenerated: insertPlaylist.isAiGenerated || false,
      createdAt: new Date(),
      trackIds: (insertPlaylist.trackIds || []) as string[],
    };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async updatePlaylist(id: string, updates: Partial<Playlist>): Promise<Playlist | undefined> {
    const existing = this.playlists.get(id);
    if (!existing) return undefined;
    
    const updated: Playlist = { ...existing, ...updates };
    this.playlists.set(id, updated);
    return updated;
  }

  async deletePlaylist(id: string): Promise<boolean> {
    return this.playlists.delete(id);
  }

  // AI Interactions
  async getAiInteraction(id: string): Promise<AiInteraction | undefined> {
    return this.aiInteractions.get(id);
  }

  async getAiInteractions(): Promise<AiInteraction[]> {
    return Array.from(this.aiInteractions.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createAiInteraction(insertInteraction: InsertAiInteraction): Promise<AiInteraction> {
    const id = nanoid();
    const interaction: AiInteraction = {
      ...insertInteraction,
      id,
      createdAt: new Date(),
      recommendations: (insertInteraction.recommendations || []) as string[],
    };
    this.aiInteractions.set(id, interaction);
    return interaction;
  }

  // User Preferences
  async getUserPreferences(): Promise<UserPreferences | undefined> {
    return this.userPreferences;
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    if (!this.userPreferences) {
      this.userPreferences = {
        id: nanoid(),
        favoriteGenres: [],
        recentSearches: [],
        likedTracks: [],
        playHistory: [],
        ...preferences,
      };
    } else {
      this.userPreferences = { ...this.userPreferences, ...preferences };
    }
    return this.userPreferences;
  }
}

export const storage = new MemStorage();
