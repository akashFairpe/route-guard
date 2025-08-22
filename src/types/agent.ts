export type AgentStatus = 'enabled' | 'disabled';
export type RunResult = 'pass' | 'fail' | null;
export type FrequencyType = 'manual' | 'hourly' | 'daily' | 'weekly' | 'cron';
export type NotifyOn = 'always' | 'failures' | 'recovery';
export type AuthMethod = 'none' | 'basic' | 'token';

export interface AgentRun {
  timestamp: Date;
  result: RunResult;
  duration?: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  lastRun?: AgentRun;
  nextRun: Date | null;
  configuration: AgentConfiguration;
}

export interface AgentConfiguration {
  // Basics
  name: string;
  description: string;
  enabled: boolean;

  // Schedule
  frequency: FrequencyType;
  cronExpression?: string;
  timezone: string;
  timeWindow?: {
    start: string;
    end: string;
  };

  // Triggers
  urlPatterns: string[];
  conditions: Condition[];
  onlyMatchingPages: boolean;

  // Checks
  checks: Check[];

  // Targets & Auth
  environments: Environment[];
  auth: AuthConfiguration;

  // Notifications
  notifications: NotificationConfiguration;
}

export interface Condition {
  id: string;
  type: 'page_path' | 'query_param' | 'device_type' | 'environment';
  operator: 'contains' | 'equals';
  value: string;
  connector?: 'and' | 'or';
}

export interface Check {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface Environment {
  id: string;
  name: string;
  baseUrl: string;
}

export interface AuthConfiguration {
  method: AuthMethod;
  username?: string;
  password?: string;
  token?: string;
}

export interface NotificationConfiguration {
  notifyOn: NotifyOn;
  email: boolean;
  slack: boolean;
  slackWebhook?: string;
  pager: boolean;
  recipients: string[];
}