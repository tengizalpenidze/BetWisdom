import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Calendar, Clock } from "lucide-react";
import { Link } from "wouter";
import type { MatchData } from "@/lib/api";

interface MatchCardProps {
  match: MatchData;
}

export function MatchCard({ match }: MatchCardProps) {
  const matchDate = new Date(match.fixture.date);
  const formattedDate = matchDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const formattedTime = matchDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  return (
    <Card className="p-4 hover:border-primary/30 cursor-pointer transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            {match.teams.home.team.logo ? (
              <img 
                src={match.teams.home.team.logo} 
                alt={match.teams.home.team.name}
                className="w-12 h-12 rounded-full object-contain mb-1"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                <Shield className="text-gray-400 w-6 h-6" />
              </div>
            )}
            <span className="text-sm font-medium text-gray-900 block max-w-[80px] truncate">
              {match.teams.home.team.name}
            </span>
          </div>
          
          <div className="text-center px-4">
            <div className="text-lg font-bold text-gray-900">VS</div>
            <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              {formattedDate}
            </div>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {formattedTime}
            </div>
          </div>
          
          <div className="text-center">
            {match.teams.away.team.logo ? (
              <img 
                src={match.teams.away.team.logo} 
                alt={match.teams.away.team.name}
                className="w-12 h-12 rounded-full object-contain mb-1"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                <Shield className="text-gray-400 w-6 h-6" />
              </div>
            )}
            <span className="text-sm font-medium text-gray-900 block max-w-[80px] truncate">
              {match.teams.away.team.name}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-2">{match.league.name}</div>
          <Link href={`/analyze/${match.teams.home.team.id}/${match.teams.away.team.id}`}>
            <Button className="bg-primary hover:bg-primary/90">
              Analyze Match
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
