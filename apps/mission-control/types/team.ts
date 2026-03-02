export interface Team {
  id: string;
  name: string;
  description: string;
  icon?: string;
  iconType?: "emoji" | "lucide" | "workspace";
  agentCount?: number;
}

export interface CreateTeamParams {
  name: string;
  description: string;
  icon?: string;
  iconType?: "emoji" | "lucide" | "workspace";
}

export interface UpdateTeamParams {
  name?: string;
  description?: string;
  icon?: string;
  iconType?: "emoji" | "lucide" | "workspace";
}
