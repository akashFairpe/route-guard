import { useState, useEffect } from "react";
import { Agent, AgentConfiguration, Check, Condition } from "@/types/agent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Play, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ConfigureAgentPanelProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AgentConfiguration) => void;
  onDelete?: (agentId: string) => void;
}

export function ConfigureAgentPanel({ agent, isOpen, onClose, onSave, onDelete }: ConfigureAgentPanelProps) {
  const [config, setConfig] = useState<AgentConfiguration | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    if (agent) {
      setConfig(agent.configuration);
    } else {
      // Default configuration for new agent
      setConfig({
        name: "",
        description: "",
        enabled: true,
        frequency: 'daily',
        timezone: 'Asia/Kolkata',
        urlPatterns: [],
        conditions: [],
        onlyMatchingPages: false,
        checks: getDefaultChecks(),
        environments: [],
        auth: { method: 'none' },
        notifications: {
          notifyOn: 'failures',
          email: true,
          slack: false,
          pager: false,
          recipients: []
        }
      });
    }
  }, [agent]);

  const getDefaultChecks = (): Check[] => [
    {
      id: '1',
      name: 'Pixel present',
      description: 'Detect specified pixel script/snippet on page',
      enabled: true
    },
    {
      id: '2',
      name: 'Correct Pixel ID',
      description: 'Validate Pixel ID matches configured value',
      enabled: true
    },
    {
      id: '3',
      name: 'PageView fires',
      description: 'Confirm PageView event dispatches on load',
      enabled: true
    },
    {
      id: '4',
      name: 'Network request OK',
      description: 'Verify tracking call returns success (200/2xx)',
      enabled: true
    },
    {
      id: '5',
      name: 'No duplicates',
      description: 'Warn if multiple pixel instances found',
      enabled: true
    },
    {
      id: '6',
      name: 'Event parameters',
      description: 'Validate required parameters are present',
      enabled: false
    }
  ];

  if (!isOpen || !config) return null;

  const handleSave = () => {
    if (config) {
      onSave(config);
      onClose();
    }
  };

  const handleTestAndSave = () => {
    // In a real app, this would run the test first
    handleSave();
  };

  const addUrlPattern = () => {
    setConfig(prev => prev ? {
      ...prev,
      urlPatterns: [...prev.urlPatterns, '']
    } : null);
  };

  const removeUrlPattern = (index: number) => {
    setConfig(prev => prev ? {
      ...prev,
      urlPatterns: prev.urlPatterns.filter((_, i) => i !== index)
    } : null);
  };

  const updateUrlPattern = (index: number, value: string) => {
    setConfig(prev => prev ? {
      ...prev,
      urlPatterns: prev.urlPatterns.map((pattern, i) => i === index ? value : pattern)
    } : null);
  };

  const toggleCheck = (checkId: string, enabled: boolean) => {
    setConfig(prev => prev ? {
      ...prev,
      checks: prev.checks.map(check => 
        check.id === checkId ? { ...check, enabled } : check
      )
    } : null);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-card border-l shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-card border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-card-foreground">
            {agent ? 'Configure Agent' : 'Create New Agent'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Basics */}
          <Card>
            <CardHeader>
              <CardTitle>Basics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  value={config.name}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Pixel Integration Checker"
                />
              </div>
              <div>
                <Label htmlFor="agent-description">Description</Label>
                <Textarea
                  id="agent-description"
                  value={config.description}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Verifies that the tracking pixel is present and correctly configured"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="agent-enabled"
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig(prev => prev ? { ...prev, enabled: checked } : null)}
                />
                <Label htmlFor="agent-enabled">Agent is enabled</Label>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>When should this agent run?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Frequency</Label>
                <Select value={config.frequency} onValueChange={(value: any) => setConfig(prev => prev ? { ...prev, frequency: value } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="cron">Custom (Cron)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {config.frequency === 'cron' && (
                <div>
                  <Label htmlFor="cron-expression">Cron Expression</Label>
                  <Input
                    id="cron-expression"
                    value={config.cronExpression || ''}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, cronExpression: e.target.value } : null)}
                    placeholder="0 9 * * *"
                  />
                </div>
              )}
              <div>
                <Label>Timezone</Label>
                <Select value={config.timezone} onValueChange={(value) => setConfig(prev => prev ? { ...prev, timezone: value } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Triggers */}
          <Card>
            <CardHeader>
              <CardTitle>Criteria to run (Triggers)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>URL Patterns</Label>
                <div className="space-y-2">
                  {config.urlPatterns.map((pattern, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={pattern}
                        onChange={(e) => updateUrlPattern(index, e.target.value)}
                        placeholder="https://example.com/*"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeUrlPattern(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addUrlPattern}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Pattern
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="only-matching"
                  checked={config.onlyMatchingPages}
                  onCheckedChange={(checked) => setConfig(prev => prev ? { ...prev, onlyMatchingPages: checked } : null)}
                />
                <Label htmlFor="only-matching">Run only on pages where criteria match</Label>
              </div>
            </CardContent>
          </Card>

          {/* Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Checks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.checks.map((check) => (
                <div key={check.id} className="flex items-start space-x-3 p-3 rounded-md border">
                  <Switch
                    checked={check.enabled}
                    onCheckedChange={(enabled) => toggleCheck(check.id, enabled)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-card-foreground">{check.name}</div>
                    <div className="text-sm text-muted-foreground">{check.description}</div>
                  </div>
                </div>
              ))}
              
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Advanced options
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeout">Timeout (ms)</Label>
                      <Input id="timeout" defaultValue="30000" />
                    </div>
                    <div>
                      <Label htmlFor="retries">Retry count</Label>
                      <Input id="retries" defaultValue="3" />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Notify on</Label>
                <Select value={config.notifications.notifyOn} onValueChange={(value: any) => 
                  setConfig(prev => prev ? { 
                    ...prev, 
                    notifications: { ...prev.notifications, notifyOn: value }
                  } : null)
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always</SelectItem>
                    <SelectItem value="failures">On Failures</SelectItem>
                    <SelectItem value="recovery">On Recovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.notifications.email}
                    onCheckedChange={(checked) => 
                      setConfig(prev => prev ? { 
                        ...prev, 
                        notifications: { ...prev.notifications, email: checked }
                      } : null)
                    }
                  />
                  <Label>Email notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.notifications.slack}
                    onCheckedChange={(checked) => 
                      setConfig(prev => prev ? { 
                        ...prev, 
                        notifications: { ...prev.notifications, slack: checked }
                      } : null)
                    }
                  />
                  <Label>Slack notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.notifications.pager}
                    onCheckedChange={(checked) => 
                      setConfig(prev => prev ? { 
                        ...prev, 
                        notifications: { ...prev.notifications, pager: checked }
                      } : null)
                    }
                  />
                  <Label>Pager notifications</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Run */}
          <Card>
            <CardHeader>
              <CardTitle>Test Run</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t p-6 flex items-center justify-between">
          <div>
            {agent && onDelete && (
              <Button
                variant="destructive"
                onClick={() => onDelete(agent.id)}
                className="bg-destructive hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Agent
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleTestAndSave} className="bg-primary hover:bg-primary-hover">
              Test & Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}