import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgentTable } from "@/components/agent-table";
import { EmptyState } from "@/components/empty-state";
import { ConfigureAgentPanel } from "@/components/configure-agent-panel";
import { Agent, AgentConfiguration } from "@/types/agent";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Sample data
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "1",
      name: "Pixel Integration Checker",
      description: "Verifies that the tracking pixel is present and correctly configured.",
      status: "enabled",
      lastRun: {
        timestamp: new Date("2025-08-22T09:00:00"),
        result: "pass",
        duration: 2300
      },
      nextRun: new Date("2025-08-23T09:00:00"),
      configuration: {
        name: "Pixel Integration Checker",
        description: "Verifies that the tracking pixel is present and correctly configured.",
        enabled: true,
        frequency: "daily",
        timezone: "Asia/Kolkata",
        urlPatterns: ["https://example.com/*"],
        conditions: [],
        onlyMatchingPages: false,
        checks: [
          {
            id: "1",
            name: "Pixel present",
            description: "Detect specified pixel script/snippet on page",
            enabled: true
          },
          {
            id: "2",
            name: "Correct Pixel ID",
            description: "Validate Pixel ID matches configured value",
            enabled: true
          }
        ],
        environments: [],
        auth: { method: "none" },
        notifications: {
          notifyOn: "failures",
          email: true,
          slack: false,
          pager: false,
          recipients: []
        }
      }
    },
    {
      id: "2",
      name: "API Health Monitor",
      description: "Monitors API endpoints for availability and response times.",
      status: "disabled",
      lastRun: {
        timestamp: new Date("2025-08-21T15:30:00"),
        result: "fail",
        duration: 5000
      },
      nextRun: null,
      configuration: {
        name: "API Health Monitor",
        description: "Monitors API endpoints for availability and response times.",
        enabled: false,
        frequency: "hourly",
        timezone: "Asia/Kolkata",
        urlPatterns: ["https://api.example.com/*"],
        conditions: [],
        onlyMatchingPages: false,
        checks: [],
        environments: [],
        auth: { method: "none" },
        notifications: {
          notifyOn: "always",
          email: true,
          slack: true,
          pager: false,
          recipients: []
        }
      }
    }
  ]);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNewAgent = () => {
    setSelectedAgent(null);
    setIsPanelOpen(true);
  };

  const handleConfigureAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsPanelOpen(true);
  };

  const handleToggleStatus = (agentId: string, enabled: boolean) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { 
            ...agent, 
            status: enabled ? "enabled" : "disabled",
            nextRun: enabled ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null
          }
        : agent
    ));
    
    toast({
      title: enabled ? "Agent enabled" : "Agent disabled",
      description: `${agents.find(a => a.id === agentId)?.name} has been ${enabled ? 'enabled' : 'disabled'}.`
    });
  };

  const handleRunNow = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    toast({
      title: "Agent started",
      description: `${agent?.name} is now running...`
    });
  };

  const handleSaveConfiguration = (config: AgentConfiguration) => {
    if (selectedAgent) {
      // Update existing agent
      setAgents(prev => prev.map(agent => 
        agent.id === selectedAgent.id 
          ? { 
              ...agent, 
              name: config.name,
              description: config.description,
              status: config.enabled ? "enabled" : "disabled",
              configuration: config 
            }
          : agent
      ));
      toast({
        title: "Agent updated",
        description: `${config.name} has been updated successfully.`
      });
    } else {
      // Create new agent
      const newAgent: Agent = {
        id: Date.now().toString(),
        name: config.name,
        description: config.description,
        status: config.enabled ? "enabled" : "disabled",
        nextRun: config.enabled ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
        configuration: config
      };
      setAgents(prev => [...prev, newAgent]);
      toast({
        title: "Agent created",
        description: `${config.name} has been created successfully.`
      });
    }
  };

  const handleDeleteAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    setAgents(prev => prev.filter(a => a.id !== agentId));
    setIsPanelOpen(false);
    toast({
      title: "Agent deleted",
      description: `${agent?.name} has been deleted.`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Agent Management</h1>
            <p className="text-muted-foreground">Monitor and configure your automated agents</p>
          </div>
          <Button onClick={handleNewAgent} className="bg-primary hover:bg-primary-hover">
            <Plus className="h-4 w-4 mr-2" />
            New Agent
          </Button>
        </div>

        {/* Filters */}
        {filteredAgents.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-card">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48 bg-card">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pixel">Pixel Checker</SelectItem>
                <SelectItem value="api">API Monitor</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Content */}
        {filteredAgents.length === 0 && searchQuery === "" && statusFilter === "all" ? (
          <EmptyState onCreateAgent={handleNewAgent} />
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No agents match your current filters.</p>
          </div>
        ) : (
          <AgentTable
            agents={filteredAgents}
            onConfigureAgent={handleConfigureAgent}
            onToggleStatus={handleToggleStatus}
            onRunNow={handleRunNow}
          />
        )}

        {/* Configure Panel */}
        <ConfigureAgentPanel
          agent={selectedAgent}
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onSave={handleSaveConfiguration}
          onDelete={handleDeleteAgent}
        />
      </div>
    </div>
  );
};

export default Index;