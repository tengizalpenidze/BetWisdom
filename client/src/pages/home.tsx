import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, TrendingUp } from "lucide-react";
import { Header } from "@/components/header";
import { MatchCard } from "@/components/match-card";
import { getUpcomingMatches, searchMatches } from "@/lib/api";
import type { MatchData, ApiFootballResponse } from "@/lib/api";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ApiFootballResponse<MatchData> | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: upcomingMatches, isLoading: isLoadingUpcoming, error: upcomingError } = useQuery({
    queryKey: ["/api/matches/upcoming"],
    queryFn: getUpcomingMatches,
    retry: 1,
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchMatches(searchQuery, "matches");
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePopularSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    try {
      const results = await searchMatches(query, "matches");
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const displayMatches = searchResults?.response || upcomingMatches?.response || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Search Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-primary mr-2" />
              <h2 className="text-3xl font-bold text-gray-900">Find Upcoming Matches</h2>
            </div>
            <p className="text-gray-600">Search for matches and get detailed team statistics to make informed betting decisions</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Input 
                  type="text" 
                  placeholder="Search for teams, leagues, or upcoming matches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-12"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Popular:</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePopularSearch("Premier League")}
                disabled={isSearching}
              >
                Premier League
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePopularSearch("La Liga")}
                disabled={isSearching}
              >
                La Liga
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePopularSearch("Champions League")}
                disabled={isSearching}
              >
                Champions League
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Match Selection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {searchResults ? "Search Results" : "Upcoming Matches"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUpcoming || isSearching ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : upcomingError && !searchResults ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">Failed to load matches</div>
                <div className="text-sm text-gray-500">
                  {upcomingError instanceof Error ? upcomingError.message : "Please check your connection and try again"}
                </div>
              </div>
            ) : displayMatches.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">No matches found</div>
                <div className="text-sm text-gray-400">
                  {searchResults ? "Try a different search term" : "No upcoming matches available"}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {displayMatches.map((match) => (
                  <MatchCard key={match.fixture.id} match={match} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="text-primary w-5 h-5" />
                <span className="text-xl font-bold">BetWisdom</span>
              </div>
              <p className="text-gray-400 text-sm">Smart football analytics for informed betting decisions.</p>
            </div>
            <div>
              <h6 className="font-semibold mb-3">Features</h6>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Match Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Team Statistics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Head to Head</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Historical Data</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-3">Support</h6>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-3">Data Source</h6>
              <p className="text-sm text-gray-400">Powered by API-Football.com</p>
              <div className="mt-4 text-xs text-gray-500">
                <p>© 2024 BetWisdom. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
