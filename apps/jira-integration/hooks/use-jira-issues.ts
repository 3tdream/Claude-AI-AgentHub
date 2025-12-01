'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { JiraIssue, JiraSearchResult, CreateIssuePayload, UpdateIssuePayload } from '@/lib/jira/types';

export function useJiraIssues(jql?: string, options?: { enabled?: boolean }) {
  return useQuery<JiraSearchResult, Error>({
    queryKey: ['jira-issues', jql],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (jql) params.append('jql', jql);

      const response = await axios.get(`/api/jira/issues?${params.toString()}`);
      return response.data;
    },
    enabled: options?.enabled,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useJiraIssue(issueKey: string, options?: { enabled?: boolean }) {
  return useQuery<JiraIssue, Error>({
    queryKey: ['jira-issue', issueKey],
    queryFn: async () => {
      const response = await axios.get(`/api/jira/issues/${issueKey}`);
      return response.data;
    },
    enabled: options?.enabled !== false && !!issueKey,
    staleTime: 30000,
  });
}

export function useCreateJiraIssue() {
  const queryClient = useQueryClient();

  return useMutation<JiraIssue, Error, CreateIssuePayload>({
    mutationFn: async (payload) => {
      const response = await axios.post('/api/jira/issues', payload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch issues
      queryClient.invalidateQueries({ queryKey: ['jira-issues'] });
    },
  });
}

export function useUpdateJiraIssue(issueKey: string) {
  const queryClient = useQueryClient();

  return useMutation<JiraIssue, Error, UpdateIssuePayload>({
    mutationFn: async (payload) => {
      const response = await axios.put(`/api/jira/issues/${issueKey}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      // Update specific issue in cache
      queryClient.setQueryData(['jira-issue', issueKey], data);
      // Invalidate issues list
      queryClient.invalidateQueries({ queryKey: ['jira-issues'] });
    },
  });
}

export function useDeleteJiraIssue() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (issueKey) => {
      await axios.delete(`/api/jira/issues/${issueKey}`);
    },
    onSuccess: (_, issueKey) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['jira-issue', issueKey] });
      // Invalidate issues list
      queryClient.invalidateQueries({ queryKey: ['jira-issues'] });
    },
  });
}
