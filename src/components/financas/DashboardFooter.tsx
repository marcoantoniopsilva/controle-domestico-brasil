
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface DashboardFooterProps {
  appVersion: string;
  lastRefreshed: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const DashboardFooter: React.FC<DashboardFooterProps> = ({
  appVersion,
  lastRefreshed,
  isRefreshing,
  onRefresh
}) => {
  return (
    <div className="text-xs text-center p-2 text-gray-500 flex items-center justify-center gap-2">
      <span>
        Versão: {appVersion.substring(0, 10)} | Última atualização: {new Date(lastRefreshed).toLocaleTimeString()}
      </span>
      <Button 
        onClick={onRefresh} 
        variant="ghost" 
        size="sm"
        disabled={isRefreshing}
        className="h-6 px-2 text-xs flex items-center gap-1"
      >
        <RefreshCcw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        Atualizar agora
      </Button>
    </div>
  );
};

export default DashboardFooter;
