import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lightbulb, Target, Zap, Award, AlertTriangle } from "lucide-react";
import type { AnalysisResponse, TeamStatsData, MatchData } from "@/lib/api";

interface TeamComparisonProps {
  analysis: AnalysisResponse;
}

export function TeamComparison({ analysis }: TeamComparisonProps) {
  const { homeTeam, awayTeam, headToHead } = analysis;

  if (!homeTeam || !awayTeam) {
    return (
      <Card className="p-6">
        <CardContent>
          <div className="text-center text-gray-500">
            Unable to load team statistics. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate head-to-head stats with enhanced Sportmonks data
  const h2hStats = headToHead.reduce((acc, match) => {
    if (!match?.participants || !homeTeam?.id) {
      return acc;
    }
    
    // Find the winning team from participants metadata
    const homeParticipant = match.participants?.find(p => p.id === homeTeam.id);
    const awayParticipant = match.participants?.find(p => p.id === awayTeam.id);
    
    if (homeParticipant?.meta?.winner === true) {
      acc.homeWins++;
    } else if (awayParticipant?.meta?.winner === true) {
      acc.awayWins++;
    } else if (homeParticipant?.meta?.winner === false && awayParticipant?.meta?.winner === false) {
      acc.draws++;
    } else {
      // Fallback to result_info parsing if meta data isn't available
      if (match.result_info?.includes(homeTeam.name)) {
        acc.homeWins++;
      } else if (match.result_info?.includes(awayTeam.name)) {
        acc.awayWins++;
      } else if (match.result_info?.includes('Draw')) {
        acc.draws++;
      }
    }
    return acc;
  }, { homeWins: 0, awayWins: 0, draws: 0, totalGoalsHome: 0, totalGoalsAway: 0 });



  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900">Team Comparison Analysis</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Target className="w-4 h-4" />
              <span>Season {homeTeam?.league?.season || 2022}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Team Headers */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              {homeTeam?.image_path ? (
                <img 
                  src={homeTeam.image_path} 
                  alt={homeTeam.name || 'Home Team'}
                  className="w-20 h-20 rounded-full object-contain mx-auto mb-3"
                />
              ) : (
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="text-blue-600 text-2xl" />
                </div>
              )}
              <h4 className="text-xl font-bold text-gray-900">{homeTeam?.name || 'Home Team'}</h4>
              <div className="text-sm">
                <span className="text-gray-500">Founded: </span>
                <span className="text-gray-900">{homeTeam?.founded || 'Unknown'}</span>
              </div>
              {homeTeam?.standing && (
                <div className="text-sm text-green-600 font-medium mt-1">
                  Position: {homeTeam.standing.position} ({homeTeam.standing.points} pts)
                </div>
              )}
            </div>
            <div className="flex items-center justify-center">
              <div className="text-4xl font-bold text-gray-400">VS</div>
            </div>
            <div className="text-center">
              {awayTeam?.image_path ? (
                <img 
                  src={awayTeam.image_path} 
                  alt={awayTeam.name || 'Away Team'}
                  className="w-20 h-20 rounded-full object-contain mx-auto mb-3"
                />
              ) : (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="text-red-600 text-2xl" />
                </div>
              )}
              <h4 className="text-xl font-bold text-gray-900">{awayTeam?.name || 'Away Team'}</h4>
              <div className="text-sm">
                <span className="text-gray-500">Founded: </span>
                <span className="text-gray-900">{awayTeam?.founded || 'Unknown'}</span>
              </div>
              {awayTeam?.standing && (
                <div className="text-sm text-green-600 font-medium mt-1">
                  Position: {awayTeam.standing.position} ({awayTeam.standing.points} pts)
                </div>
              )}
            </div>
          </div>

          {/* Head to Head Statistics */}
          <div className="mb-8">
            <h5 className="text-lg font-semibold text-gray-900 mb-4">Head to Head (Last {headToHead.length} meetings)</h5>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{h2hStats.homeWins}</div>
                <div className="text-sm text-gray-600">{homeTeam?.name || 'Home Team'} Wins</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-600">{h2hStats.draws}</div>
                <div className="text-sm text-gray-600">Draws</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{h2hStats.awayWins}</div>
                <div className="text-sm text-gray-600">{awayTeam?.name || 'Away Team'} Wins</div>
              </div>
            </div>
          </div>

          {/* Team Information */}
          <div className="space-y-6">
            <h5 className="text-lg font-semibold text-gray-900">Team Information</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  {homeTeam?.name}
                </h6>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded:</span>
                    <span className="font-medium">{homeTeam?.founded || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Team ID:</span>
                    <span className="font-medium">{homeTeam?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Played:</span>
                    <span className="font-medium">{homeTeam?.last_played_at ? new Date(homeTeam.last_played_at).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-red-600" />
                  {awayTeam?.name}
                </h6>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded:</span>
                    <span className="font-medium">{awayTeam?.founded || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Team ID:</span>
                    <span className="font-medium">{awayTeam?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Played:</span>
                    <span className="font-medium">{awayTeam?.last_played_at ? new Date(awayTeam.last_played_at).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Head-to-Head Matches */}
            {headToHead.length > 0 && (
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Recent Matches</h5>
                <div className="space-y-3">
                  {headToHead.slice(0, 5).map((match, index) => {
                    const homeParticipant = match.participants?.find(p => p.id === homeTeam.id);
                    const awayParticipant = match.participants?.find(p => p.id === awayTeam.id);
                    const homeScore = match.scores?.find(s => s.participant_id === homeTeam.id && s.description === 'CURRENT')?.score?.goals || 0;
                    const awayScore = match.scores?.find(s => s.participant_id === awayTeam.id && s.description === 'CURRENT')?.score?.goals || 0;
                    
                    return (
                      <div key={match.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm text-gray-500">
                              {new Date(match.starting_at).toLocaleDateString()}
                            </div>
                            <div className="text-sm font-medium">
                              {homeParticipant?.meta?.location === 'home' ? homeTeam.name : awayTeam.name} vs{' '}
                              {homeParticipant?.meta?.location === 'home' ? awayTeam.name : homeTeam.name}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-lg font-bold">
                              {homeParticipant?.meta?.location === 'home' ? homeScore : awayScore} - {homeParticipant?.meta?.location === 'home' ? awayScore : homeScore}
                            </div>
                            <div className={`w-3 h-3 rounded-full ${
                              homeParticipant?.meta?.winner === true ? 'bg-green-500' :
                              awayParticipant?.meta?.winner === true ? 'bg-red-500' : 'bg-gray-400'
                            }`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* API Limitation Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Comprehensive Statistics Not Available
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      The Sportmonks free plan only provides limited historical data (mostly 2005-2016) and doesn't include detailed current season statistics or match data with goals, cards, and corners.
                    </p>
                    <div className="mt-3">
                      <p className="font-medium">To get the comprehensive team statistics you need:</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Upgrade to a paid Sportmonks plan ($29+/month) for current season access</li>
                        <li>Or use a different API like API-Football, Football-Data.org, or RapidAPI Sports</li>
                        <li>Many of these offer free tiers with current match data</li>
                      </ul>
                    </div>
                    <p className="mt-3 text-amber-600 font-medium">
                      Current available: Basic team info and historical standings only.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Available Data */}
            <div>
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Available Team Information</h5>
              <div className="grid grid-cols-2 gap-6">
                {/* Home Team Stats */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h6 className="font-semibold text-blue-800 mb-3">{homeTeam?.name || 'Home Team'}</h6>
                  <div className="space-y-3">
                    {/* Current Form */}
                    <div>
                      <span className="text-sm text-gray-600">Recent Form:</span>
                      <div className="flex mt-1 space-x-1">
                        {homeTeam?.statistics?.form?.slice(0, 5).map((result: string, index: number) => (
                          <div
                            key={index}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              result === 'W' ? 'bg-green-500' :
                              result === 'L' ? 'bg-red-500' : 'bg-gray-400'
                            }`}
                          >
                            {result}
                          </div>
                        )) || <span className="text-gray-400 text-sm">No recent matches</span>}
                      </div>
                    </div>

                    {/* Match Statistics */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Matches:</span>
                        <span className="font-medium">{homeTeam?.statistics?.matchesPlayed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Win %:</span>
                        <span className="font-medium">{homeTeam?.statistics?.winPercentage || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Wins:</span>
                        <span className="font-medium text-green-600">{homeTeam?.statistics?.wins || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Losses:</span>
                        <span className="font-medium text-red-600">{homeTeam?.statistics?.losses || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Draws:</span>
                        <span className="font-medium text-gray-600">{homeTeam?.statistics?.draws || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Goal Diff:</span>
                        <span className={`font-medium ${(homeTeam?.statistics?.goalDifference || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(homeTeam?.statistics?.goalDifference || 0) >= 0 ? '+' : ''}{homeTeam?.statistics?.goalDifference || 0}
                        </span>
                      </div>
                    </div>

                    {/* Goals Statistics */}
                    <div className="border-t pt-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Goals For:</span>
                          <span className="font-medium">{homeTeam?.statistics?.goalsFor || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Goals Against:</span>
                          <span className="font-medium">{homeTeam?.statistics?.goalsAgainst || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Goals/Game:</span>
                          <span className="font-medium">{homeTeam?.statistics?.averageGoalsFor || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Conceded:</span>
                          <span className="font-medium">{homeTeam?.statistics?.averageGoalsAgainst || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Clean Sheets:</span>
                          <span className="font-medium">{homeTeam?.statistics?.cleanSheets || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Failed to Score:</span>
                          <span className="font-medium">{homeTeam?.statistics?.failedToScore || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* League Position */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">League Position:</span>
                        <span className="font-medium">{homeTeam?.standing?.position || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">League Points:</span>
                        <span className="font-medium">{homeTeam?.standing?.points || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Away Team Stats */}
                <div className="bg-red-50 rounded-lg p-4">
                  <h6 className="font-semibold text-red-800 mb-3">{awayTeam?.name || 'Away Team'}</h6>
                  <div className="space-y-3">
                    {/* Current Form */}
                    <div>
                      <span className="text-sm text-gray-600">Recent Form:</span>
                      <div className="flex mt-1 space-x-1">
                        {awayTeam?.statistics?.form?.slice(0, 5).map((result: string, index: number) => (
                          <div
                            key={index}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              result === 'W' ? 'bg-green-500' :
                              result === 'L' ? 'bg-red-500' : 'bg-gray-400'
                            }`}
                          >
                            {result}
                          </div>
                        )) || <span className="text-gray-400 text-sm">No recent matches</span>}
                      </div>
                    </div>

                    {/* Match Statistics */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Matches:</span>
                        <span className="font-medium">{awayTeam?.statistics?.matchesPlayed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Win %:</span>
                        <span className="font-medium">{awayTeam?.statistics?.winPercentage || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Wins:</span>
                        <span className="font-medium text-green-600">{awayTeam?.statistics?.wins || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Losses:</span>
                        <span className="font-medium text-red-600">{awayTeam?.statistics?.losses || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Draws:</span>
                        <span className="font-medium text-gray-600">{awayTeam?.statistics?.draws || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Goal Diff:</span>
                        <span className={`font-medium ${(awayTeam?.statistics?.goalDifference || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(awayTeam?.statistics?.goalDifference || 0) >= 0 ? '+' : ''}{awayTeam?.statistics?.goalDifference || 0}
                        </span>
                      </div>
                    </div>

                    {/* Goals Statistics */}
                    <div className="border-t pt-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Goals For:</span>
                          <span className="font-medium">{awayTeam?.statistics?.goalsFor || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Goals Against:</span>
                          <span className="font-medium">{awayTeam?.statistics?.goalsAgainst || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Goals/Game:</span>
                          <span className="font-medium">{awayTeam?.statistics?.averageGoalsFor || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Conceded:</span>
                          <span className="font-medium">{awayTeam?.statistics?.averageGoalsAgainst || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Clean Sheets:</span>
                          <span className="font-medium">{awayTeam?.statistics?.cleanSheets || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Failed to Score:</span>
                          <span className="font-medium">{awayTeam?.statistics?.failedToScore || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* League Position */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">League Position:</span>
                        <span className="font-medium">{awayTeam?.standing?.position || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">League Points:</span>
                        <span className="font-medium">{awayTeam?.standing?.points || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Home vs Away Performance */}
            <div>
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Home vs Away Performance</h5>
              <div className="grid grid-cols-2 gap-6">
                {/* Home Team Home/Away Stats */}
                <div className="space-y-4">
                  <h6 className="font-medium text-blue-800">{homeTeam?.name}</h6>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Home Performance */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <h6 className="text-sm font-semibold text-green-800 mb-2">Home Record</h6>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Matches:</span>
                          <span>{homeTeam?.statistics?.homeMatches || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>W-D-L:</span>
                          <span>{homeTeam?.statistics?.homeWins || 0}-{homeTeam?.statistics?.homeDraws || 0}-{homeTeam?.statistics?.homeLosses || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Goals:</span>
                          <span>{homeTeam?.statistics?.homeGoalsFor || 0}:{homeTeam?.statistics?.homeGoalsAgainst || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Away Performance */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h6 className="text-sm font-semibold text-blue-800 mb-2">Away Record</h6>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Matches:</span>
                          <span>{homeTeam?.statistics?.awayMatches || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>W-D-L:</span>
                          <span>{homeTeam?.statistics?.awayWins || 0}-{homeTeam?.statistics?.awayDraws || 0}-{homeTeam?.statistics?.awayLosses || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Goals:</span>
                          <span>{homeTeam?.statistics?.awayGoalsFor || 0}:{homeTeam?.statistics?.awayGoalsAgainst || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Current Streak */}
                  {homeTeam?.statistics?.currentStreak?.type && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm">
                        <span className="text-gray-600">Current Streak:</span>
                        <span className={`ml-2 font-semibold ${
                          homeTeam.statistics.currentStreak.type === 'W' ? 'text-green-600' :
                          homeTeam.statistics.currentStreak.type === 'L' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {homeTeam.statistics.currentStreak.count} {
                            homeTeam.statistics.currentStreak.type === 'W' ? 'wins' :
                            homeTeam.statistics.currentStreak.type === 'L' ? 'losses' : 'draws'
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Away Team Home/Away Stats */}
                <div className="space-y-4">
                  <h6 className="font-medium text-red-800">{awayTeam?.name}</h6>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Home Performance */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <h6 className="text-sm font-semibold text-green-800 mb-2">Home Record</h6>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Matches:</span>
                          <span>{awayTeam?.statistics?.homeMatches || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>W-D-L:</span>
                          <span>{awayTeam?.statistics?.homeWins || 0}-{awayTeam?.statistics?.homeDraws || 0}-{awayTeam?.statistics?.homeLosses || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Goals:</span>
                          <span>{awayTeam?.statistics?.homeGoalsFor || 0}:{awayTeam?.statistics?.homeGoalsAgainst || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Away Performance */}
                    <div className="bg-red-50 rounded-lg p-3">
                      <h6 className="text-sm font-semibold text-red-800 mb-2">Away Record</h6>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Matches:</span>
                          <span>{awayTeam?.statistics?.awayMatches || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>W-D-L:</span>
                          <span>{awayTeam?.statistics?.awayWins || 0}-{awayTeam?.statistics?.awayDraws || 0}-{awayTeam?.statistics?.awayLosses || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Goals:</span>
                          <span>{awayTeam?.statistics?.awayGoalsFor || 0}:{awayTeam?.statistics?.awayGoalsAgainst || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Current Streak */}
                  {awayTeam?.statistics?.currentStreak?.type && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm">
                        <span className="text-gray-600">Current Streak:</span>
                        <span className={`ml-2 font-semibold ${
                          awayTeam.statistics.currentStreak.type === 'W' ? 'text-green-600' :
                          awayTeam.statistics.currentStreak.type === 'L' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {awayTeam.statistics.currentStreak.count} {
                            awayTeam.statistics.currentStreak.type === 'W' ? 'wins' :
                            awayTeam.statistics.currentStreak.type === 'L' ? 'losses' : 'draws'
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* League Position Comparison */}
            {(homeTeam?.standing || awayTeam?.standing) && (
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-4">League Position Comparison</h5>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{homeTeam?.standing?.position || '-'}</div>
                      <div className="text-sm text-gray-600">{homeTeam?.name} Position</div>
                      <div className="text-xs text-gray-500">{homeTeam?.standing?.points || 0} points</div>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="h-2 bg-gray-200 rounded-full relative">
                        {homeTeam?.standing?.position && awayTeam?.standing?.position && (
                          <>
                            <div 
                              className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full"
                              style={{ width: `${Math.max(0, 100 - (homeTeam.standing.position / 12) * 100)}%` }}
                            />
                            <div 
                              className="absolute top-0 right-0 h-2 bg-red-500 rounded-full"
                              style={{ width: `${Math.max(0, 100 - (awayTeam.standing.position / 12) * 100)}%` }}
                            />
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 text-center mt-1">League Standing</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{awayTeam?.standing?.position || '-'}</div>
                      <div className="text-sm text-gray-600">{awayTeam?.name} Position</div>
                      <div className="text-xs text-gray-500">{awayTeam?.standing?.points || 0} points</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Form */}
            <div>
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Recent Form</h5>
              <div className="grid grid-cols-2 gap-6">
                {/* Home Team Recent Matches */}
                <div>
                  <h6 className="font-medium text-blue-800 mb-3">{homeTeam?.name} - Last 5 Matches</h6>
                  <div className="space-y-2">
                    {homeTeam?.recentFixtures?.length > 0 ? (
                      homeTeam.recentFixtures.slice(0, 5).map((fixture, index) => (
                        <div key={fixture.id || index} className="bg-white border rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <div className="font-medium">{fixture.name || 'Match'}</div>
                              <div className="text-gray-500 text-xs">
                                {fixture.starting_at ? new Date(fixture.starting_at).toLocaleDateString() : 'Date TBA'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">
                                {fixture.result_info || 'No result'}
                              </div>
                              <div className="text-xs font-medium">
                                {fixture.state_id === 5 ? 'Finished' : 
                                 fixture.state_id === 1 ? 'Scheduled' : 'In Progress'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic">No recent matches available</div>
                    )}
                  </div>
                </div>

                {/* Away Team Recent Matches */}
                <div>
                  <h6 className="font-medium text-red-800 mb-3">{awayTeam?.name} - Last 5 Matches</h6>
                  <div className="space-y-2">
                    {awayTeam?.recentFixtures?.length > 0 ? (
                      awayTeam.recentFixtures.slice(0, 5).map((fixture, index) => (
                        <div key={fixture.id || index} className="bg-white border rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <div className="font-medium">{fixture.name || 'Match'}</div>
                              <div className="text-gray-500 text-xs">
                                {fixture.starting_at ? new Date(fixture.starting_at).toLocaleDateString() : 'Date TBA'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">
                                {fixture.result_info || 'No result'}
                              </div>
                              <div className="text-xs font-medium">
                                {fixture.state_id === 5 ? 'Finished' : 
                                 fixture.state_id === 1 ? 'Scheduled' : 'In Progress'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic">No recent matches available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
