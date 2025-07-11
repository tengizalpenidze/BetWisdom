import { Link, useLocation } from "wouter";
import { TrendingUp } from "lucide-react";

export function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <TrendingUp className="text-primary text-2xl" />
                <h1 className="text-2xl font-bold text-gray-900">BetWisdom</h1>
              </div>
            </Link>
            <span className="text-sm text-gray-500 hidden sm:block">Smart Football Analytics</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <a className={`font-medium transition-colors ${
                location === "/" ? "text-primary" : "text-gray-700 hover:text-primary"
              }`}>
                Matches
              </a>
            </Link>
            <a href="#" className="text-gray-700 hover:text-primary font-medium transition-colors">Teams</a>
            <a href="#" className="text-gray-700 hover:text-primary font-medium transition-colors">Statistics</a>
            <a href="#" className="text-gray-700 hover:text-primary font-medium transition-colors">Help</a>
          </nav>
        </div>
      </div>
    </header>
  );
}
