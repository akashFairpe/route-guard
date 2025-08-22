import { Button } from "@/components/ui/button";
import emptyAgentsImage from "@/assets/empty-agents.jpg";

interface EmptyStateProps {
  onCreateAgent: () => void;
}

export function EmptyState({ onCreateAgent }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="max-w-md mx-auto text-center">
        <img
          src={emptyAgentsImage}
          alt="No agents illustration"
          className="w-full h-auto mb-8 opacity-80"
        />
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          No agents yet
        </h3>
        <p className="text-muted-foreground mb-6">
          Create your first agent to automate checks and monitor your applications.
        </p>
        <Button onClick={onCreateAgent} className="bg-primary hover:bg-primary-hover">
          Create Agent
        </Button>
      </div>
    </div>
  );
}