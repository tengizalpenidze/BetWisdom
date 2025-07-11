import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { TeamComparison } from "@/components/team-comparison";
import { analyzeMatch } from "@/lib/api";

export default function MatchAnalysis() {
  const { homeTeamId, awayTeamId } = useParams<{ homeTeamId: string; awayTeamId: string }>();
  
  const homeId = parseInt(homeTeamId || "0");
  const awayId = parseInt(awayTeamId || "0");

  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ["/api/analyze", homeId, awayId],
    queryFn: () => analyzeMatch(homeId, awayId),
    enabled: !!(homeId && awayId),
    retry: 1,
  });

  if (!homeId || !awayId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <h1 className="text-xl font-bold">Invalid Match Parameters</h1>
            </div>
            <p className="text-gray-600 mb-4">
              The team IDs provided are invalid. Please select a match from the home page.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Matches
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Matches
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
                <p className="text-gray-600 mb-4">
                  {error instanceof Error ? error.message : "Unable to fetch team analysis. Please try again."}
                </p>
                <div className="space-x-4">
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                  <Link href="/">
                    <Button>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Matches
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : analysis ? (
          <TeamComparison analysis={analysis} />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                No analysis data available for these teams.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
}
