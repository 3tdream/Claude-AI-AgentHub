"use client"

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AddEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currency?: string;
}

export function AddEntryDialog({ open, onOpenChange, onSuccess, currency = 'USD' }: AddEntryDialogProps) {
  const [clientName, setClientName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [hourlyRate, setHourlyRate] = useState('100');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [project, setProject] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      // Validate inputs
      if (!clientName.trim()) {
        setError('Client name is required');
        setProcessing(false);
        return;
      }

      if (!hourlyRate || parseFloat(hourlyRate) <= 0) {
        setError('Valid hourly rate is required');
        setProcessing(false);
        return;
      }

      // Create action for adding entry
      const action = {
        type: 'create_entry',
        payload: {
          clientName: clientName.trim(),
          startTime,
          endTime,
          hourlyRate: parseFloat(hourlyRate),
          currency,
          date,
          project: project.trim() || undefined,
          ticketId: ticketId.trim() || undefined,
          description: description.trim() || undefined,
          paymentStatus: 'pending',
        },
      };

      // Execute action
      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to add entry');
        setProcessing(false);
        return;
      }

      // Success - close dialog and refresh
      setProcessing(false);
      handleClose();
      onSuccess();

    } catch (err) {
      console.error('Add entry error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add entry');
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (!processing) {
      setClientName('');
      setStartTime('09:00');
      setEndTime('17:00');
      setHourlyRate('100');
      setDate(new Date().toISOString().split('T')[0]);
      setProject('');
      setTicketId('');
      setDescription('');
      setError('');
      onOpenChange(false);
    }
  };

  const calculateHours = () => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const hours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
    return Math.max(0, hours);
  };

  const calculateTotal = () => {
    const hours = calculateHours();
    const rate = parseFloat(hourlyRate) || 0;
    return hours * rate;
  };

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = {
      USD: '$', EUR: '€', GBP: '£', ILS: '₪', JPY: '¥', CAD: 'C$', AUD: 'A$'
    };
    return symbols[curr] || curr;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            Add Work Entry
          </DialogTitle>
          <DialogDescription>
            Manually add a work session entry
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g., Acme Corp"
              disabled={processing}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={processing}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={processing}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={processing}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Hourly Rate ({currency}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="100"
              min="0"
              step="0.01"
              disabled={processing}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Project (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Project (Optional)
            </label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g., Website Redesign"
              disabled={processing}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Ticket ID (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ticket ID (Optional)
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="e.g., PROJ-123, #456"
              disabled={processing}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the work..."
              disabled={processing}
              className="min-h-[80px]"
            />
          </div>

          {/* Calculation Summary */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hours:</span>
              <span className="font-medium">{calculateHours().toFixed(2)}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rate:</span>
              <span className="font-medium">{getCurrencySymbol(currency)}{hourlyRate || 0}/h</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t pt-2 mt-2">
              <span className="text-gray-900">Total:</span>
              <span className="text-indigo-600">{getCurrencySymbol(currency)}{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Footer Buttons */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
