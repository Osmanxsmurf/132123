import { Switch, Route } from "wouter";
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MusicPlayer } from "@/components/music-player";
import { AiChatModal } from "@/components/ai-chat-modal";
import Home from "@/pages/home";
import Search from "@/pages/search";
import Trending from "@/pages/trending";
import Liked from "@/pages/liked";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/trending" component={Trending} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Search local tracks first
      const localResponse = await fetch(`/api/tracks/search?q=${encodeURIComponent(query)}`);
      const localTracks = await localResponse.json();
      
      // Search external platforms
      const externalResponse = await fetch(`/api/external/search?q=${encodeURIComponent(query)}`);
      const externalTracks = await externalResponse.json();
      
      const allResults = [...localTracks, ...externalTracks];
      setSearchResults(allResults);
      
      // Store search results for display
      sessionStorage.setItem('searchResults', JSON.stringify(allResults));
      sessionStorage.setItem('searchQuery', query);
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
          <Sidebar onOpenAiChat={() => setIsAiChatOpen(true)} />
          
          <div className="flex-1 flex flex-col">
            <Header 
              onOpenAiChat={() => setIsAiChatOpen(true)} 
              onSearch={handleSearch}
            />
            <Router />
          </div>
        </div>

        <MusicPlayer />
        
        <AiChatModal 
          isOpen={isAiChatOpen} 
          onClose={() => setIsAiChatOpen(false)} 
        />
        
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
