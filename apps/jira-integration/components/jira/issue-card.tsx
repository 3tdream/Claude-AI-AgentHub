'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JiraIssue } from '@/lib/jira/types';
import {
  getIssueTypeColor,
  getPriorityColor,
  getStatusColor,
  formatJiraDate,
  getIssueTypeIcon,
  getPriorityIcon,
  isOverdue,
} from '@/lib/jira/utils';
import { cn } from '@/lib/utils';

interface IssueCardProps {
  issue: JiraIssue;
  onClick?: () => void;
  className?: string;
  showProject?: boolean;
}

export function IssueCard({ issue, onClick, className, showProject = false }: IssueCardProps) {
  const issueType = issue.fields.issuetype.name.toLowerCase();
  const priority = issue.fields.priority.name.toLowerCase();
  const statusCategory = issue.fields.status.statusCategory.key;
  const overdue = isOverdue(issue);

  // Get icon components dynamically
  const IssueTypeIcon = (Icons as any)[getIssueTypeIcon(issueType)] || Icons.Circle;
  const PriorityIcon = (Icons as any)[getPriorityIcon(priority)] || Icons.Minus;

  const fadeInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2, ease: 'easeOut' },
  };

  return (
    <motion.div {...fadeInUp} layout>
      <Card
        className={cn(
          'cursor-pointer hover:shadow-md transition-shadow duration-200 group',
          className
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        aria-label={`Issue ${issue.key}: ${issue.fields.summary}`}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header: Issue Key and Type */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <IssueTypeIcon
                size={16}
                style={{ color: getIssueTypeColor(issueType) }}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="text-xs font-mono text-muted-foreground">
                {issue.key}
              </span>
            </div>

            <PriorityIcon
              size={16}
              style={{ color: getPriorityColor(priority) }}
              strokeWidth={2}
              aria-label={`Priority: ${issue.fields.priority.name}`}
            />
          </div>

          {/* Summary */}
          <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {issue.fields.summary}
          </h3>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              style={{
                borderColor: getStatusColor(statusCategory),
                color: getStatusColor(statusCategory),
              }}
            >
              {issue.fields.status.name}
            </Badge>

            {overdue && (
              <Badge variant="destructive" className="text-xs">
                <Icons.AlertCircle size={12} className="mr-1" />
                Overdue
              </Badge>
            )}
          </div>

          {/* Footer: Assignee, Project, Updated */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {issue.fields.assignee ? (
                <div className="flex items-center gap-1">
                  <Icons.User size={12} />
                  <span className="truncate max-w-[100px]">
                    {issue.fields.assignee.displayName}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Icons.UserX size={12} />
                  <span>Unassigned</span>
                </div>
              )}

              {showProject && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="truncate max-w-[100px]">
                    {issue.fields.project.name}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Icons.Clock size={12} />
              <span>{formatJiraDate(issue.fields.updated)}</span>
            </div>
          </div>

          {/* Labels */}
          {issue.fields.labels && issue.fields.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {issue.fields.labels.slice(0, 3).map((label) => (
                <Badge key={label} variant="secondary" className="text-xs px-2 py-0">
                  {label}
                </Badge>
              ))}
              {issue.fields.labels.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  +{issue.fields.labels.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
