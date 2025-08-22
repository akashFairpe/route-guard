import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Play, Settings } from "lucide-react";
import { Agent, AgentStatus, RunResult } from "@/types/agent";

interface AgentTableProps {
  agents: Agent[];
  onConfigureAgent: (agent: Agent) => void;
  onToggleStatus: (agentId: string, enabled: boolean) => void;
  onRunNow: (agentId: string) => void;
}

export function AgentTable({ agents, onConfigureAgent, onToggleStatus, onRunNow }: AgentTableProps) {
  const getStatusBadge = (status: AgentStatus) => {
    return status === 'enabled' ? (
      <Badge className="bg-success-light text-success border-success/20">Enabled</Badge>
    ) : (
      <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
    );
  };

  const getResultBadge = (result: RunResult) => {
    switch (result) {
      case 'pass':
        return <Badge className="bg-success-light text-success border-success/20">Pass</Badge>;
      case 'fail':
        return <Badge className="bg-destructive-light text-destructive border-destructive/20">Fail</Badge>;
      default:
        return <Badge variant="outline">—</Badge>;
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-medium text-card-foreground">Agent</th>
              <th className="text-left p-4 font-medium text-card-foreground">Description</th>
              <th className="text-left p-4 font-medium text-card-foreground">Status</th>
              <th className="text-left p-4 font-medium text-card-foreground">Last Run</th>
              <th className="text-left p-4 font-medium text-card-foreground">Next Run</th>
              <th className="text-left p-4 font-medium text-card-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {agent.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-card-foreground cursor-pointer hover:text-primary transition-colors">
                        {agent.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-muted-foreground max-w-xs">
                    {agent.description}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(agent.status)}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      {formatDateTime(agent.lastRun?.timestamp || null)}
                    </div>
                    {agent.lastRun && getResultBadge(agent.lastRun.result)}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-muted-foreground">
                    {formatDateTime(agent.nextRun)}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={agent.status === 'enabled'}
                      onCheckedChange={(checked) => onToggleStatus(agent.id, checked)}
                      className="data-[state=checked]:bg-success"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onConfigureAgent(agent)}
                      className="gap-1"
                    >
                      <Settings className="h-4 w-4" />
                      Configure
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRunNow(agent.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}