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

  // Calculate head-to-head stats
  const h2hStats = headToHead.reduce((acc, match) => {
    if (match.teams.home.team.id === homeTeam.team.id) {
      if (match.goals.home > match.goals.away) acc.homeWins++;
      else if (match.goals.home < match.goals.away) acc.awayWins++;
      else acc.draws++;
    } else {
      if (match.goals.away > match.goals.home) acc.homeWins++;
      else if (match.goals.away < match.goals.home) acc.awayWins++;
      else acc.draws++;
    }
    return acc;
  }, { homeWins: 0, awayWins: 0, draws: 0 });

  // Calculate total yellow/red cards
  const getCardTotal = (cards: TeamStatsData["cards"]["yellow"] | TeamStatsData["cards"]["red"]) => {
    return Object.values(cards).reduce((total, period) => total + (period?.total || 0), 0);
  };

  const homeYellowCards = getCardTotal(homeTeam.cards.yellow);
  const awayYellowCards = getCardTotal(awayTeam.cards.yellow);
  const homeRedCards = getCardTotal(homeTeam.cards.red);
  const awayRedCards = getCardTotal(awayTeam.cards.red);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900">Team Comparison Analysis</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Target className="w-4 h-4" />
              <span>Season {homeTeam.league.season}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Team Headers */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              {homeTeam.team.logo ? (
                <img 
                  src={homeTeam.team.logo} 
                  alt={homeTeam.team.name}
                  className="w-20 h-20 rounded-full object-contain mx-auto mb-3"
                />
              ) : (
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="text-blue-600 text-2xl" />
                </div>
              )}
              <h4 className="text-xl font-bold text-gray-900">{homeTeam.team.name}</h4>
              <p className="text-gray-500">{homeTeam.form}</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-4xl font-bold text-gray-400">VS</div>
            </div>
            <div className="text-center">
              {awayTeam.team.logo ? (
                <img 
                  src={awayTeam.team.logo} 
                  alt={awayTeam.team.name}
                  className="w-20 h-20 rounded-full object-contain mx-auto mb-3"
                />
              ) : (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="text-red-600 text-2xl" />
                </div>
              )}
              <h4 className="text-xl font-bold text-gray-900">{awayTeam.team.name}</h4>
              <p className="text-gray-500">{awayTeam.form}</p>
            </div>
          </div>

          {/* Head to Head Statistics */}
          <div className="mb-8">
            <h5 className="text-lg font-semibold text-gray-900 mb-4">Head to Head (Last {headToHead.length} meetings)</h5>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{h2hStats.homeWins}</div>
                <div className="text-sm text-gray-600">{homeTeam.team.name} Wins</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-600">{h2hStats.draws}</div>
                <div className="text-sm text-gray-600">Draws</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{h2hStats.awayWins}</div>
                <div className="text-sm text-gray-600">{awayTeam.team.name} Wins</div>
              </div>
            </div>
          </div>

          {/* Detailed Statistics Comparison */}
          <div className="space-y-6">
            <h5 className="text-lg font-semibold text-gray-900">Season Statistics Comparison</h5>
            
            {/* Goals */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">{homeTeam.goals.for.total.total}</div>
                  <div className="text-sm text-gray-600">Goals For</div>
                  <div className="text-xs text-gray-500">Avg: {homeTeam.goals.for.average.total}</div>
                </div>
                <div className="flex items-center justify-center">
                  <Target className="text-gray-400 text-xl" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">{awayTeam.goals.for.total.total}</div>
                  <div className="text-sm text-gray-600">Goals For</div>
                  <div className="text-xs text-gray-500">Avg: {awayTeam.goals.for.average.total}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-danger-600">{homeTeam.goals.against.total.total}</div>
                  <div className="text-sm text-gray-600">Goals Against</div>
                  <div className="text-xs text-gray-500">Avg: {homeTeam.goals.against.average.total}</div>
                </div>
                <div></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-danger-600">{awayTeam.goals.against.total.total}</div>
                  <div className="text-sm text-gray-600">Goals Against</div>
                  <div className="text-xs text-gray-500">Avg: {awayTeam.goals.against.average.total}</div>
                </div>
              </div>
            </div>

            {/* Cards & Discipline */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h6 className="font-semibold text-gray-900 mb-3 text-center flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Cards & Discipline
              </h6>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Yellow Cards</span>
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold">{homeYellowCards}</span>
                      <div className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
                      <span className="font-semibold">{awayYellowCards}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Red Cards</span>
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold">{homeRedCards}</span>
                      <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                      <span className="font-semibold">{awayRedCards}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Clean Sheets</span>
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold">{homeTeam.clean_sheet.total}</span>
                      <Award className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">{awayTeam.clean_sheet.total}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Failed to Score</span>
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold">{homeTeam.failed_to_score.total}</span>
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">{awayTeam.failed_to_score.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h6 className="font-semibold text-gray-900 mb-3">Match Results</h6>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wins</span>
                    <div className="flex space-x-4">
                      <span className="font-semibold text-success-600">{homeTeam.fixtures.wins.total}</span>
                      <span className="text-gray-400">vs</span>
                      <span className="font-semibold text-success-600">{awayTeam.fixtures.wins.total}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Draws</span>
                    <div className="flex space-x-4">
                      <span className="font-semibold">{homeTeam.fixtures.draws.total}</span>
                      <span className="text-gray-400">vs</span>
                      <span className="font-semibold">{awayTeam.fixtures.draws.total}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Losses</span>
                    <div className="flex space-x-4">
                      <span className="font-semibold text-danger-600">{homeTeam.fixtures.loses.total}</span>
                      <span className="text-gray-400">vs</span>
                      <span className="font-semibold text-danger-600">{awayTeam.fixtures.loses.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h6 className="font-semibold text-gray-900 mb-3">Goal Statistics</h6>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Goals per game</span>
                    <div className="flex space-x-4">
                      <span className="font-semibold">{homeTeam.goals.for.average.total}</span>
                      <span className="text-gray-400">vs</span>
                      <span className="font-semibold">{awayTeam.goals.for.average.total}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conceded per game</span>
                    <div className="flex space-x-4">
                      <span className="font-semibold">{homeTeam.goals.against.average.total}</span>
                      <span className="text-gray-400">vs</span>
                      <span className="font-semibold">{awayTeam.goals.against.average.total}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Goal difference</span>
                    <div className="flex space-x-4">
                      <span className="font-semibold">
                        {homeTeam.goals.for.total.total - homeTeam.goals.against.total.total}
                      </span>
                      <span className="text-gray-400">vs</span>
                      <span className="font-semibold">
                        {awayTeam.goals.for.total.total - awayTeam.goals.against.total.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h6 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                Key Betting Insights
              </h6>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>
                  • {homeTeam.goals.for.total.total > awayTeam.goals.for.total.total ? homeTeam.team.name : awayTeam.team.name} has scored more goals this season
                </li>
                <li>
                  • {homeTeam.clean_sheet.total > awayTeam.clean_sheet.total ? homeTeam.team.name : awayTeam.team.name} has better defensive record with more clean sheets
                </li>
                <li>
                  • {homeYellowCards + homeRedCards < awayYellowCards + awayRedCards ? homeTeam.team.name : awayTeam.team.name} shows better discipline with fewer cards
                </li>
                <li>
                  • Head-to-head: {h2hStats.homeWins > h2hStats.awayWins ? homeTeam.team.name : h2hStats.awayWins > h2hStats.homeWins ? awayTeam.team.name : "Teams are evenly matched"} {h2hStats.homeWins === h2hStats.awayWins ? "" : "has the advantage"}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
