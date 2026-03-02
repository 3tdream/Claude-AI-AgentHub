"use client";

import useSWR from "swr";
import type { Team, CreateTeamParams, UpdateTeamParams } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTeams() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/agent-hub/teams",
    fetcher,
    { revalidateOnFocus: false },
  );

  return {
    teams: (data?.data ?? data ?? []) as Team[],
    isLoading,
    error,
    mutate,
  };
}

export function useTeam(teamId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    teamId ? `/api/agent-hub/teams/${teamId}` : null,
    fetcher,
  );

  return {
    team: (data?.data ?? null) as Team | null,
    isLoading,
    error,
    mutate,
  };
}

export async function createTeam(params: CreateTeamParams) {
  const res = await fetch("/api/agent-hub/teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function updateTeam(teamId: string, params: UpdateTeamParams) {
  const res = await fetch(`/api/agent-hub/teams/${teamId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function deleteTeam(teamId: string) {
  const res = await fetch(`/api/agent-hub/teams/${teamId}`, {
    method: "DELETE",
  });
  return res.json();
}
