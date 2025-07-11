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

  // Calculate head-to-head stats - Sportmonks format
  const h2hStats = headToHead.reduce((acc, match) => {
    // Sportmonks API returns simpler fixture data
    if (!match?.id || !match?.result_info || !homeTeam?.id) {
      return acc;
    }
    
    // Parse result info to determine winner
    if (match.result_info.includes(homeTeam.name)) {
      acc.homeWins++;
    } else if (match.result_info.includes(awayTeam.name)) {
      acc.awayWins++;
    } else if (match.result_info.includes('Draw')) {
      acc.draws++;
    }
    return acc;
  }, { homeWins: 0, awayWins: 0, draws: 0 });



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

            {/* Notice about limited data */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h6 className="font-semibold text-yellow-800 mb-1">Limited Data Available</h6>
                  <p className="text-sm text-yellow-700">
                    The current free plan provides basic team information and head-to-head history. 
                    Detailed statistics like goals, cards, and performance metrics require a premium subscription.
                  </p>
                </div>
              </div>
            </div>


          </div>
        </CardContent>
      </Card>
    </div>
  );
}
