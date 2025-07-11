import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Shield, Users, Filter } from "lucide-react";
import { Link } from "wouter";
import { getTeams } from "@/lib/api";
import type { TeamData, SportmonksTeam } from "@/lib/api";

export function TeamSelector() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [selectedHomeTeam, setSelectedHomeTeam] = useState<SportmonksTeam | null>(null);
  const [selectedAwayTeam, setSelectedAwayTeam] = useState<SportmonksTeam | null>(null);

  const { data: teamsData, isLoading, error } = useQuery({
    queryKey: ["/api/teams"],
    queryFn: getTeams,
    retry: 1,
  });

  const teams = (teamsData?.response || teamsData?.data || []) as SportmonksTeam[];
  const availableLeagues = [...new Set(teams.map((team: any) => team.leagueName).filter(Boolean))].sort();
  
  const filteredTeams = teams.filter((teamData: SportmonksTeam) => {
    const matchesSearch = teamData.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesLeague = selectedLeague === "all" || (teamData as any).leagueName === selectedLeague;
    return matchesSearch && matchesLeague;
  });

  const canAnalyze = selectedHomeTeam && selectedAwayTeam && selectedHomeTeam.id !== selectedAwayTeam.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2" />
          {t('teamSelector.title')}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {t('teamSelector.description')}
        </p>
        {teamsData?.apiLimitation && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 text-yellow-600 mt-0.5">⚠️</div>
              <div className="text-sm">
                <div className="font-medium text-yellow-800">{t('teamSelector.apiLimitation.title')}</div>
                <div className="text-yellow-700 mt-1">
                  {t('teamSelector.apiLimitation.description')}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Input 
              type="text" 
              placeholder={t('teamSelector.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          
          {availableLeagues.length > 0 && (
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('teamSelector.filterByLeague')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('teamSelector.allLeagues')}</SelectItem>
                  {availableLeagues.map((league) => (
                    <SelectItem key={league} value={league}>
                      {league}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">
                {filteredTeams.length} {t('teamSelector.teamsCount')}
              </span>
            </div>
          )}
        </div>

        {/* Selected Teams */}
        {(selectedHomeTeam || selectedAwayTeam) && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">{t('teamSelector.title')}:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">{t('teamSelector.homeTeam')}</div>
                {selectedHomeTeam ? (
                  <div className="flex items-center justify-center space-x-2">
                    <img 
                      src={selectedHomeTeam.image_path} 
                      alt={selectedHomeTeam.name}
                      className="w-8 h-8"
                    />
                    <span className="font-medium">{selectedHomeTeam.name}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedHomeTeam(null)}
                    >
                      {t('teamSelector.remove')}
                    </Button>
                  </div>
                ) : (
                  <div className="text-gray-400">{t('teamSelector.notSelected')}</div>
                )}
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">{t('teamSelector.awayTeam')}</div>
                {selectedAwayTeam ? (
                  <div className="flex items-center justify-center space-x-2">
                    <img 
                      src={selectedAwayTeam.image_path} 
                      alt={selectedAwayTeam.name}
                      className="w-8 h-8"
                    />
                    <span className="font-medium">{selectedAwayTeam.name}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedAwayTeam(null)}
                    >
                      {t('teamSelector.remove')}
                    </Button>
                  </div>
                ) : (
                  <div className="text-gray-400">{t('teamSelector.notSelected')}</div>
                )}
              </div>
            </div>
            {canAnalyze && (
              <div className="text-center mt-4">
                <Link href={`/analyze/${selectedHomeTeam.id}/${selectedAwayTeam.id}`}>
                  <Button className="bg-primary hover:bg-primary/90">
                    {t('teamSelector.analyzeTeams')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Teams List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">{t('errors.failedToLoad')} {t('teamSelector.teamsCount')}</div>
            <div className="text-sm text-gray-500">
              {error instanceof Error ? error.message : t('teamComparison.checkConnection')}
            </div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">{t('teamSelector.noTeamsFound')}</div>
            <div className="text-sm text-gray-400">
              {t('teamSelector.tryDifferentSearch')}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((teamData: SportmonksTeam) => (
              <div
                key={teamData.id}
                className="p-4 border rounded-lg hover:border-primary/30 cursor-pointer transition-all hover:shadow-md"
                onClick={() => {
                  if (!selectedHomeTeam) {
                    setSelectedHomeTeam(teamData);
                  } else if (!selectedAwayTeam && teamData.id !== selectedHomeTeam.id) {
                    setSelectedAwayTeam(teamData);
                  } else if (selectedHomeTeam && selectedAwayTeam) {
                    // Replace one of the teams
                    setSelectedHomeTeam(teamData);
                    setSelectedAwayTeam(null);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  {teamData.image_path ? (
                    <img 
                      src={teamData.image_path} 
                      alt={teamData.name}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Shield className="text-gray-400 w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{teamData.name}</div>
                    <div className="text-sm text-gray-500">
                      {(teamData as any).leagueName || 'European League'}
                    </div>
                    {teamData.venue?.name && (
                      <div className="text-xs text-gray-400">{teamData.venue.name}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}