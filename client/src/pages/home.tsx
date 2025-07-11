import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { TeamSelector } from "@/components/team-selector";
import { getUpcomingMatches } from "@/lib/api";

export default function Home() {
  const { t } = useTranslation();
  const { data: upcomingMatches } = useQuery({
    queryKey: ["/api/matches/upcoming"],
    queryFn: getUpcomingMatches,
    retry: 1,
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-primary mr-2" />
              <h2 className="text-3xl font-bold text-gray-900">{t('home.title')}</h2>
            </div>
            <p className="text-gray-600">{t('home.description')}</p>
          </div>

          {/* API Limitation Notice */}
          {upcomingMatches?.errors && upcomingMatches.errors.length > 0 && (
            <Card className="mb-8 border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">
                      {t('teamSelector.apiLimitation.title')}
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>{upcomingMatches.message}</p>
                      <p className="mt-1">{t('home.teamAnalysis')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Team Selection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeamSelector />
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
              <h4 className="text-white font-medium mb-3">Features</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Team Statistics</li>
                <li>Head-to-Head Analysis</li>
                <li>Betting Insights</li>
                <li>Performance Metrics</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Data</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Real-time Stats</li>
                <li>Historical Data</li>
                <li>Premier League</li>
                <li>2022 Season</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>API Documentation</li>
                <li>Data Sources</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 BetWisdom. Powered by API-Football.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}