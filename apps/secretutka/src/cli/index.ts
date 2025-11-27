#!/usr/bin/env node

/**
 * Secretutka - Personal Assistant CLI Bot
 * Command-line interface for work session tracking
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import {
  addEntry,
  deleteEntryById,
  findEntriesByFilter,
  calculateEarnings,
  formatCurrency,
  type WorkEntry,
} from '../storage/index.js';
import { handleUserText, isConfigured, getConfigInstructions } from '../nlp/index.js';
import { executeAction, type AgentAction, type ActionPreview } from '../core/index.js';
import { processVoiceCommand, isSpeechRecognitionAvailable, type MockAudioInput } from '../voice/index.js';

const program = new Command();

// CLI metadata
program
  .name('secretutka')
  .description('Personal assistant CLI bot for work session tracking')
  .version('1.0.0');

/**
 * Command: add
 * Add new work session
 */
program
  .command('add')
  .description('Add new work session')
  .argument('<date>', 'Date in YYYY-MM-DD format')
  .argument('<start>', 'Start time in HH:MM format')
  .argument('<end>', 'End time in HH:MM format')
  .argument('<client>', 'Client name')
  .argument('<rate>', 'Hourly rate (number)')
  .argument('[project]', 'Project name (optional)')
  .option('-c, --currency <currency>', 'Currency code (USD, EUR, etc.)', 'USD')
  .option('-n, --notes <notes>', 'Additional notes')
  .option('-s, --status <status>', 'Payment status (pending, paid, overdue)', 'pending')
  .action(async (date, start, end, client, rate, project, options) => {
    try {
      console.log(chalk.blue('📝 Adding work session...\n'));

      const result = await addEntry({
        date,
        startTime: start,
        endTime: end,
        clientName: client,
        hourlyRate: parseFloat(rate),
        currency: options.currency,
        project,
        notes: options.notes,
        paymentStatus: options.status,
      });

      if (!result.success) {
        console.error(chalk.red('❌ Error:'), result.error);
        process.exit(1);
      }

      const entry = result.data!;
      const earnings = calculateEarnings(entry);

      console.log(chalk.green('✅ Work session added successfully!\n'));
      console.log(chalk.bold('Details:'));
      console.log(`  ID:          ${chalk.cyan(entry.id)}`);
      console.log(`  Date:        ${entry.date}`);
      console.log(`  Time:        ${entry.startTime} - ${entry.endTime}`);
      console.log(`  Duration:    ${entry.durationHours} hours`);
      console.log(`  Client:      ${chalk.yellow(entry.clientName)}`);
      console.log(`  Rate:        ${formatCurrency(entry.hourlyRate, entry.currency)}/hour`);
      console.log(`  Earnings:    ${chalk.green(formatCurrency(earnings, entry.currency))}`);
      if (entry.project) {
        console.log(`  Project:     ${entry.project}`);
      }
      if (entry.notes) {
        console.log(`  Notes:       ${entry.notes}`);
      }
      console.log(`  Status:      ${getStatusBadge(entry.paymentStatus || 'pending')}`);
    } catch (error) {
      console.error(chalk.red('❌ Unexpected error:'), (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Command: list month
 * List all entries for a specific month
 */
program
  .command('list')
  .description('List work sessions')
  .argument('<period>', 'Period type (month)')
  .argument('<value>', 'Period value (YYYY-MM for month)')
  .option('-c, --client <client>', 'Filter by client name')
  .option('-s, --status <status>', 'Filter by payment status')
  .action(async (period, value, options) => {
    try {
      if (period !== 'month') {
        console.error(chalk.red('❌ Error: Only "month" period is supported currently'));
        process.exit(1);
      }

      // Validate month format
      if (!/^\d{4}-\d{2}$/.test(value)) {
        console.error(chalk.red('❌ Error: Month must be in YYYY-MM format'));
        process.exit(1);
      }

      console.log(chalk.blue(`📅 Listing work sessions for ${value}...\n`));

      // Calculate date range for the month
      const [year, month] = value.split('-');
      const dateFrom = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const dateTo = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;

      const filter: any = { dateFrom, dateTo };
      if (options.client) filter.clientName = options.client;
      if (options.status) filter.paymentStatus = options.status;

      const result = await findEntriesByFilter(filter);

      if (!result.success) {
        console.error(chalk.red('❌ Error:'), result.error);
        process.exit(1);
      }

      const entries = result.data || [];

      if (entries.length === 0) {
        console.log(chalk.yellow('📭 No entries found for this period.'));
        return;
      }

      // Sort by date
      entries.sort((a, b) => a.date.localeCompare(b.date));

      // Display entries
      console.log(chalk.bold(`Found ${entries.length} entries:\n`));

      entries.forEach((entry) => {
        const earnings = calculateEarnings(entry);
        console.log(chalk.cyan(`━━━ ${entry.date} ━━━`));
        console.log(`  ID:       ${entry.id}`);
        console.log(`  Time:     ${entry.startTime} - ${entry.endTime} (${entry.durationHours}h)`);
        console.log(`  Client:   ${chalk.yellow(entry.clientName)}`);
        if (entry.project) {
          console.log(`  Project:  ${entry.project}`);
        }
        console.log(`  Rate:     ${formatCurrency(entry.hourlyRate, entry.currency)}/hour`);
        console.log(`  Earnings: ${chalk.green(formatCurrency(earnings, entry.currency))}`);
        console.log(`  Status:   ${getStatusBadge(entry.paymentStatus || 'pending')}`);
        console.log('');
      });

      // Calculate totals
      const totalHours = entries.reduce((sum, e) => sum + e.durationHours, 0);
      const totalEarnings = entries.reduce((sum, e) => sum + calculateEarnings(e), 0);
      const primaryCurrency = entries[0]?.currency || 'USD';

      console.log(chalk.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.bold(`Total Hours:    ${totalHours.toFixed(2)}h`));
      console.log(chalk.bold(`Total Earnings: ${chalk.green(formatCurrency(totalEarnings, primaryCurrency))}`));
    } catch (error) {
      console.error(chalk.red('❌ Unexpected error:'), (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Command: delete
 * Delete work session by ID
 */
program
  .command('delete')
  .description('Delete work session by ID')
  .argument('<id>', 'Entry ID to delete')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action(async (id, options) => {
    try {
      console.log(chalk.blue(`🗑️  Deleting work session ${id}...\n`));

      // Get entry details first
      const entries = await findEntriesByFilter({ id });
      if (!entries.success || !entries.data || entries.data.length === 0) {
        console.error(chalk.red(`❌ Error: Entry with ID ${id} not found`));
        process.exit(1);
      }

      const entry = entries.data[0];

      // Show entry details
      console.log(chalk.yellow('Entry to delete:'));
      console.log(`  Date:   ${entry.date}`);
      console.log(`  Time:   ${entry.startTime} - ${entry.endTime}`);
      console.log(`  Client: ${entry.clientName}`);
      if (entry.project) {
        console.log(`  Project: ${entry.project}`);
      }
      console.log('');

      // Confirm deletion (if not using -y flag)
      if (!options.yes) {
        const { default: inquirer } = await import('inquirer');
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Are you sure you want to delete this entry?',
            default: false,
          },
        ]);

        if (!answers.confirm) {
          console.log(chalk.yellow('❌ Deletion cancelled.'));
          return;
        }
      }

      const result = await deleteEntryById(id);

      if (!result.success) {
        console.error(chalk.red('❌ Error:'), result.error);
        process.exit(1);
      }

      console.log(chalk.green('✅ Entry deleted successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Unexpected error:'), (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Command: summary month
 * Show summary for a specific month
 */
program
  .command('summary')
  .description('Show summary statistics')
  .argument('<period>', 'Period type (month)')
  .argument('<value>', 'Period value (YYYY-MM for month)')
  .option('-g, --group-by <field>', 'Group by client or project', 'client')
  .action(async (period, value, options) => {
    try {
      if (period !== 'month') {
        console.error(chalk.red('❌ Error: Only "month" period is supported currently'));
        process.exit(1);
      }

      // Validate month format
      if (!/^\d{4}-\d{2}$/.test(value)) {
        console.error(chalk.red('❌ Error: Month must be in YYYY-MM format'));
        process.exit(1);
      }

      console.log(chalk.blue(`📊 Summary for ${value}\n`));

      // Calculate date range
      const [year, month] = value.split('-');
      const dateFrom = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const dateTo = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;

      const result = await findEntriesByFilter({ dateFrom, dateTo });

      if (!result.success) {
        console.error(chalk.red('❌ Error:'), result.error);
        process.exit(1);
      }

      const entries = result.data || [];

      if (entries.length === 0) {
        console.log(chalk.yellow('📭 No entries found for this period.'));
        return;
      }

      // Overall statistics
      const totalHours = entries.reduce((sum, e) => sum + e.durationHours, 0);
      const totalEarnings = entries.reduce((sum, e) => sum + calculateEarnings(e), 0);
      const primaryCurrency = entries[0]?.currency || 'USD';
      const avgHourlyRate = entries.reduce((sum, e) => sum + e.hourlyRate, 0) / entries.length;

      console.log(chalk.bold('📈 Overall Statistics'));
      console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(`  Total Sessions:  ${entries.length}`);
      console.log(`  Total Hours:     ${totalHours.toFixed(2)}h`);
      console.log(`  Total Earnings:  ${chalk.green(formatCurrency(totalEarnings, primaryCurrency))}`);
      console.log(`  Avg Rate:        ${formatCurrency(avgHourlyRate, primaryCurrency)}/hour`);
      console.log('');

      // Payment status breakdown
      const statusCounts = entries.reduce((acc, e) => {
        const status = e.paymentStatus || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log(chalk.bold('💰 Payment Status'));
      console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${getStatusBadge(status)}: ${count} session(s)`);
      });
      console.log('');

      // Group by client or project
      const groupField = options.groupBy === 'project' ? 'project' : 'clientName';
      const grouped = entries.reduce((acc, entry) => {
        const key = (entry[groupField as keyof WorkEntry] as string) || 'Unknown';
        if (!acc[key]) {
          acc[key] = { hours: 0, earnings: 0, count: 0 };
        }
        acc[key].hours += entry.durationHours;
        acc[key].earnings += calculateEarnings(entry);
        acc[key].count += 1;
        return acc;
      }, {} as Record<string, { hours: number; earnings: number; count: number }>);

      console.log(chalk.bold(`📊 Breakdown by ${options.groupBy === 'project' ? 'Project' : 'Client'}`));
      console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

      const sortedGroups = Object.entries(grouped).sort((a, b) => b[1].earnings - a[1].earnings);

      sortedGroups.forEach(([name, stats]) => {
        console.log(chalk.yellow(`  ${name}`));
        console.log(`    Sessions: ${stats.count}`);
        console.log(`    Hours:    ${stats.hours.toFixed(2)}h`);
        console.log(`    Earnings: ${chalk.green(formatCurrency(stats.earnings, primaryCurrency))}`);
        console.log('');
      });
    } catch (error) {
      console.error(chalk.red('❌ Unexpected error:'), (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Command: agent
 * Natural language interface - accepts free-form text input
 */
program
  .command('agent')
  .description('Interact using natural language')
  .argument('<text...>', 'Your request in natural language')
  .action(async (...args) => {
    try {
      // Extract text from varargs (last arg is options object)
      const textParts = args.slice(0, -1);
      const text = textParts.join(' ');

      // Check if API key is configured
      if (!isConfigured()) {
        console.error(chalk.red('❌ Error: Anthropic API key not configured\n'));
        console.log(getConfigInstructions());
        process.exit(1);
      }

      console.log(chalk.blue('🤖 Processing your request...\n'));
      console.log(chalk.gray(`Input: "${text}"\n`));

      // Convert natural language to actions
      const spinner = ora('Analyzing with Claude AI...').start();
      let actions;
      try {
        actions = await handleUserText(text);
        spinner.succeed(chalk.green(`Parsed ${actions.length} action(s)`));
      } catch (error) {
        spinner.fail(chalk.red('Failed to parse request'));
        console.error(chalk.red('\n❌ Error:'), (error as Error).message);
        process.exit(1);
      }

      console.log('');

      // Execute each action
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        console.log(chalk.blue(`━━━ Executing Action ${i + 1}/${actions.length} ━━━`));
        console.log(chalk.gray(`Type: ${action.type}`));

        // Check if action requires confirmation
        if (requiresConfirmation(action)) {
          // Run in dry-run mode first to get preview
          const previewSpinner = ora('Generating preview...').start();
          const previewAction = { ...action, dryRun: true };

          try {
            const previewResult = await executeAction(previewAction);
            previewSpinner.stop();

            if (!previewResult.success) {
              console.error(chalk.red(`❌ Failed to generate preview: ${previewResult.error}\n`));
              continue;
            }

            if (previewResult.preview) {
              displayPreview(previewResult.preview);

              // Ask for confirmation
              const confirmed = await getConfirmation('Do you want to proceed with this action?');

              if (!confirmed) {
                console.log(chalk.yellow('⚠️  Action cancelled by user\n'));
                continue;
              }
            }
          } catch (error) {
            previewSpinner.fail(chalk.red('Preview failed'));
            console.error(chalk.red(`  ${(error as Error).message}\n`));
            continue;
          }
        }

        const spinner = ora('Processing...').start();

        try {
          const result = await executeAction(action);

          if (!result.success) {
            spinner.fail(chalk.red('Failed'));
            console.error(chalk.red(`  Error: ${result.error}\n`));
            continue;
          }

          spinner.succeed(chalk.green('Success'));

          // Display result based on action type
          if (result.message) {
            console.log(chalk.green(`  ${result.message}`));
          }

          // Format output based on data type
          if (result.data) {
            if (Array.isArray(result.data)) {
              // Array of entries
              if (result.data.length > 0 && result.data[0].id) {
                console.log(chalk.gray(`  Affected ${result.data.length} entry/entries:`));
                result.data.forEach((entry: WorkEntry) => {
                  const earnings = calculateEarnings(entry);
                  console.log(
                    `    - ${entry.date} | ${entry.clientName} | ${formatCurrency(earnings, entry.currency)}`
                  );
                });
              }
            } else if (typeof result.data === 'object' && 'totalSessions' in result.data) {
              // Summary data
              const summary = result.data as any;
              console.log(chalk.bold(`  Summary:`));
              console.log(`    Total Sessions:  ${summary.totalSessions}`);
              console.log(`    Total Hours:     ${summary.totalHours.toFixed(2)}h`);
              console.log(`    Total Earnings:  ${summary.totalEarnings.toFixed(2)}`);

              if (summary.statusBreakdown) {
                console.log(`    Payment Status:`);
                Object.entries(summary.statusBreakdown).forEach(([status, count]) => {
                  console.log(`      ${getStatusBadge(status)}: ${count}`);
                });
              }

              if (summary.grouped) {
                const groupKeys = Object.keys(summary.grouped);
                if (groupKeys.length > 0) {
                  console.log(`    Breakdown:`);
                  groupKeys.forEach((key) => {
                    const group = summary.grouped[key];
                    console.log(
                      `      ${chalk.yellow(key)}: ${group.sessions} sessions, ${group.hours.toFixed(2)}h, ${group.earnings.toFixed(2)}`
                    );
                  });
                }
              }
            } else if (typeof result.data === 'object' && 'id' in result.data) {
              // Single entry
              const entry = result.data as WorkEntry;
              const earnings = calculateEarnings(entry);
              console.log(chalk.bold(`  Entry Details:`));
              console.log(`    ID:       ${chalk.cyan(entry.id)}`);
              console.log(`    Date:     ${entry.date}`);
              console.log(`    Time:     ${entry.startTime} - ${entry.endTime}`);
              console.log(`    Client:   ${chalk.yellow(entry.clientName)}`);
              console.log(`    Earnings: ${chalk.green(formatCurrency(earnings, entry.currency))}`);
              console.log(`    Status:   ${getStatusBadge(entry.paymentStatus || 'pending')}`);
            } else {
              // Raw data
              console.log(`  Result:`, result.data);
            }
          }

          console.log('');
        } catch (error) {
          spinner.fail(chalk.red('Error'));
          console.error(chalk.red(`  ${(error as Error).message}\n`));
        }
      }

      console.log(chalk.green('✅ All actions completed!'));
    } catch (error) {
      console.error(chalk.red('❌ Unexpected error:'), (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Command: voice
 * Voice command interface - simulates voice input
 */
program
  .command('voice')
  .description('Interact using voice commands (mocked)')
  .argument('<input>', 'Voice input simulation: "microphone", "file", or text to transcribe')
  .action(async (input) => {
    try {
      // Check if speech recognition is available
      if (!isSpeechRecognitionAvailable()) {
        console.error(chalk.red('❌ Speech recognition is not available\n'));
        process.exit(1);
      }

      // Check if API key is configured (needed for NLP)
      if (!isConfigured()) {
        console.error(chalk.red('❌ Error: Anthropic API key not configured\n'));
        console.log(getConfigInstructions());
        process.exit(1);
      }

      console.log(chalk.blue('🎤 Processing voice command...\n'));

      // Step 1: Speech-to-Text
      const sttSpinner = ora('Converting speech to text...').start();
      let voiceResult;
      let actions;

      try {
        const result = await processVoiceCommand(input as MockAudioInput);
        voiceResult = result.voiceResult;
        actions = result.actions;
        sttSpinner.succeed(chalk.green('Speech recognized'));
      } catch (error) {
        sttSpinner.fail(chalk.red('Speech recognition failed'));
        console.error(chalk.red('\n❌ Error:'), (error as Error).message);
        process.exit(1);
      }

      // Display transcription
      console.log(chalk.bold('\n📝 Transcription:'));
      console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.white(`  "${voiceResult.text}"`));
      console.log(chalk.gray(`  Confidence: ${(voiceResult.confidence * 100).toFixed(1)}%`));
      console.log(chalk.gray(`  Source: ${voiceResult.audioSource}`));
      console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

      // Display parsed actions
      console.log(chalk.blue(`🤖 Parsed ${actions.length} action(s)\n`));

      // Execute each action (reuse logic from agent command)
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        console.log(chalk.blue(`━━━ Executing Action ${i + 1}/${actions.length} ━━━`));
        console.log(chalk.gray(`Type: ${action.type}`));

        // Check if action requires confirmation
        if (requiresConfirmation(action)) {
          const previewSpinner = ora('Generating preview...').start();
          const previewAction = { ...action, dryRun: true };

          try {
            const previewResult = await executeAction(previewAction);
            previewSpinner.stop();

            if (!previewResult.success) {
              console.error(chalk.red(`❌ Failed to generate preview: ${previewResult.error}\n`));
              continue;
            }

            if (previewResult.preview) {
              displayPreview(previewResult.preview);
              const confirmed = await getConfirmation('Do you want to proceed with this action?');

              if (!confirmed) {
                console.log(chalk.yellow('⚠️  Action cancelled by user\n'));
                continue;
              }
            }
          } catch (error) {
            previewSpinner.fail(chalk.red('Preview failed'));
            console.error(chalk.red(`  ${(error as Error).message}\n`));
            continue;
          }
        }

        const spinner = ora('Processing...').start();

        try {
          const result = await executeAction(action);

          if (!result.success) {
            spinner.fail(chalk.red('Failed'));
            console.error(chalk.red(`  Error: ${result.error}\n`));
            continue;
          }

          spinner.succeed(chalk.green('Success'));

          if (result.message) {
            console.log(chalk.green(`  ${result.message}\n`));
          }
        } catch (error) {
          spinner.fail(chalk.red('Error'));
          console.error(chalk.red(`  ${(error as Error).message}\n`));
        }
      }

      console.log(chalk.green('✅ Voice command completed!'));
    } catch (error) {
      console.error(chalk.red('❌ Unexpected error:'), (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Helper: Display action preview
 */
function displayPreview(preview: ActionPreview): void {
  console.log(chalk.bold('\n🔍 Preview:'));
  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.yellow(`  ${preview.action}`));

  if (preview.isDestructive) {
    console.log(chalk.red('  ⚠️  This operation is destructive and cannot be undone'));
  }

  if (preview.affectedEntries && preview.affectedEntries.length > 0) {
    console.log(chalk.gray(`\n  Affected entries (${preview.affectedEntries.length}):`));
    preview.affectedEntries.slice(0, 10).forEach((entry) => {
      console.log(chalk.gray(`    • ${entry.date} - ${entry.clientName}`));
      console.log(chalk.gray(`      ${entry.summary}`));
    });
    if (preview.affectedEntries.length > 10) {
      console.log(chalk.gray(`    ... and ${preview.affectedEntries.length - 10} more`));
    }
  }

  if (preview.changes) {
    console.log(chalk.gray('\n  Changes:'));
    Object.entries(preview.changes).forEach(([field, change]) => {
      console.log(chalk.gray(`    ${field}: ${JSON.stringify(change.from)} → ${JSON.stringify(change.to)}`));
    });
  }
  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}

/**
 * Helper: Check if action requires confirmation
 */
function requiresConfirmation(action: AgentAction): boolean {
  // Actions that modify or delete data require confirmation
  const destructiveActions = ['update_entry', 'delete_entry', 'mark_paid', 'mark_pending', 'mark_overdue'];
  return destructiveActions.includes(action.type);
}

/**
 * Helper: Get confirmation from user
 */
async function getConfirmation(question: string): Promise<boolean> {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: question,
      default: false,
    },
  ]);
  return answers.confirmed;
}

/**
 * Helper: Get colored status badge
 */
function getStatusBadge(status: string): string {
  switch (status) {
    case 'paid':
      return chalk.green('✓ paid');
    case 'pending':
      return chalk.yellow('⏳ pending');
    case 'overdue':
      return chalk.red('⚠ overdue');
    case 'cancelled':
      return chalk.gray('✗ cancelled');
    default:
      return status;
  }
}

// Parse CLI arguments
program.parse();
