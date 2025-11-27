'use client';

import { useState, useEffect } from 'react';
import { Clock, DollarSign, Calendar, Mic, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { VoiceChatSession } from '@/components/voice-chat-session';
import { AddEntryDialog } from '@/components/add-entry-dialog';
import { EditEntryDialog } from '@/components/edit-entry-dialog';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalHours: 0,
    totalEarnings: 0,
    avgRate: 0,
    pendingEarnings: 0,
    overdueEarnings: 0,
    hoursByClient: {} as Record<string, number>,
    costByClient: {} as Record<string, number>,
  });

  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [editEntryOpen, setEditEntryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [currency, setCurrency] = useState('USD');

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setEditEntryOpen(true);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/entries');
      const data = await response.json();

      if (data.success) {
        setEntries(data.entries || []);
        calculateStats(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (entries: any[]) => {
    const totalSessions = entries.length;
    let totalHours = 0;
    let totalEarnings = 0;
    let totalRate = 0;
    let pendingEarnings = 0;
    const hoursByClient: Record<string, number> = {};
    const costByClient: Record<string, number> = {};

    entries.forEach((entry) => {
      const hours = calculateHours(entry.startTime, entry.endTime);
      totalHours += hours;
      const earnings = hours * entry.hourlyRate;
      totalEarnings += earnings;
      totalRate += entry.hourlyRate;

      // Calculate pending earnings
      if (entry.paymentStatus === 'pending' || entry.paymentStatus === 'overdue') {
        pendingEarnings += earnings;
      }

      // Calculate hours by client
      const clientName = entry.clientName || 'Unknown';
      hoursByClient[clientName] = (hoursByClient[clientName] || 0) + hours;

      // Calculate cost by client
      costByClient[clientName] = (costByClient[clientName] || 0) + earnings;
    });

    setStats({
      totalSessions,
      totalHours,
      totalEarnings,
      avgRate: totalSessions > 0 ? totalRate / totalSessions : 0,
      pendingEarnings,
      overdueEarnings: 0,
      hoursByClient,
      costByClient,
    });
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: {
            type: 'delete_entry',
            target: { id: entryId }
          }
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchDashboardData();
      } else {
        alert('Failed to delete entry: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry');
    }
  };

  const calculateHours = (start: string, end: string) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    return (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Secretutka</h1>
              <p className="text-sm text-gray-600 mt-1">Work Session Tracker</p>
            </div>
            <div className="flex gap-3">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
                <option value="GBP">GBP £</option>
                <option value="ILS">ILS ₪</option>
                <option value="JPY">JPY ¥</option>
                <option value="CAD">CAD $</option>
                <option value="AUD">AUD $</option>
              </select>
              <button
                onClick={() => setVoiceChatOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Mic className="w-4 h-4 mr-2" />
                Voice Chat
              </button>
              <button
                onClick={() => setAddEntryOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalSessions}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalHours.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalEarnings)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">{formatCurrency(stats.pendingEarnings)}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Hours by Client */}
        {Object.keys(stats.hoursByClient).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Hours by Client</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.hoursByClient)
                .sort((a, b) => b[1] - a[1])
                .map(([client, hours]) => (
                  <div key={client} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{client}</p>
                    <p className="text-lg font-bold text-indigo-600">{hours.toFixed(1)}h</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Cost by Client */}
        {Object.keys(stats.costByClient).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Cost by Client</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.costByClient)
                .sort((a, b) => b[1] - a[1])
                .map(([client, cost]) => (
                  <div key={client} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{client}</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(cost)}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent Entries */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Work Sessions</h2>
            <p className="text-sm text-gray-600 mt-1">Your latest tracked work sessions</p>
          </div>

          <div className="overflow-x-auto">
            {entries.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No work sessions yet</h3>
                <p className="text-gray-600 mb-6">Get started by adding your first work session</p>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Entry
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10).map((entry, index) => {
                    const hours = calculateHours(entry.startTime, entry.endTime);
                    const earnings = hours * entry.hourlyRate;

                    return (
                      <tr key={entry.id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(entry.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{entry.clientName}</div>
                          <div className="text-sm text-gray-500">{entry.startTime} - {entry.endTime}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.project || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {hours.toFixed(1)}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(entry.hourlyRate)}/h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(earnings)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(entry.paymentStatus)}`}>
                            {entry.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditEntry(entry)}
                              className="inline-flex items-center px-2 py-1 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Edit entry"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="inline-flex items-center px-2 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Voice Chat Session */}
      <VoiceChatSession
        open={voiceChatOpen}
        onOpenChange={setVoiceChatOpen}
        onSuccess={fetchDashboardData}
      />

      {/* Add Entry Dialog */}
      <AddEntryDialog
        open={addEntryOpen}
        onOpenChange={setAddEntryOpen}
        currency={currency}
        onSuccess={fetchDashboardData}
      />

      {/* Edit Entry Dialog */}
      <EditEntryDialog
        open={editEntryOpen}
        onOpenChange={setEditEntryOpen}
        onSuccess={fetchDashboardData}
        entry={editingEntry}
        currency={currency}
      />
    </div>
  );
}
