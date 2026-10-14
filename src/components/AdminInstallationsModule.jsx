'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  Building,
  User,
  Zap,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  RefreshCw,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  getStoredInstallationRequests,
  fetchInstallationRequests,
  updateInstallationRequestStatus,
  deleteInstallationRequest,
  INSTALLATION_STATUSES,
  INSTALLATION_ALERT_PHONE,
  INSTALLATION_ALERT_WHATSAPP,
} from '../lib/installation';
import { useToast } from '../context/ToastContext';
import { CITIES, formatPrice } from '../lib/constants';

export default function AdminInstallationsModule() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState(() => {
    try {
      return getStoredInstallationRequests();
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRequests = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    // Instant local load
    const local = getStoredInstallationRequests();
    setRequests(local);

    try {
      // Async database load
      const latest = await fetchInstallationRequests();
      setRequests(latest);
      if (isManual) {
        showToast(`Synced with Database: ${latest.length} active leads loaded.`, 'success');
      }
    } catch (e) {
      if (isManual) {
        showToast('Database sync notice: ' + (e?.message || 'Check connection'), 'info');
      }
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  }, [showToast]);

  const handleExportCSV = () => {
    if (!filteredRequests || filteredRequests.length === 0) {
      showToast('No installation leads available to export.', 'info');
      return;
    }
    const headers = ['Tracking Code', 'Date', 'Customer Name', 'Phone', 'City', 'System Capacity (kW)', 'System Type', 'Monthly Bill', 'Roof Type', 'Status', 'Address', 'Notes'];
    const rows = filteredRequests.map((req) => [
      `"${req.trackingCode || ''}"`,
      `"${new Date(req.createdAt).toISOString()}"`,
      `"${(req.fullName || '').replace(/"/g, '""')}"`,
      `"${req.phone || ''}"`,
      `"${(req.city || '').replace(/"/g, '""')}"`,
      `"${req.systemCapacityKw || ''}"`,
      `"${(req.systemType || '').replace(/"/g, '""')}"`,
      `"${req.monthlyBill || ''}"`,
      `"${(req.roofType || '').replace(/"/g, '""')}"`,
      `"${req.status || ''}"`,
      `"${(req.address || '').replace(/"/g, '""')}"`,
      `"${(req.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sellsolar-installation-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Installation leads CSV downloaded successfully!', 'success');
  };

  useEffect(() => {
    loadRequests();

    // Listen to local update events (submission or edits)
    const handleUpdate = () => {
      loadRequests(false);
    };
    window.addEventListener('sellsolar_installation_updated', handleUpdate);

    // Auto-refresh every 30 seconds to catch leads submitted from other devices
    const timer = setInterval(() => {
      loadRequests(false);
    }, 30000);

    return () => {
      window.removeEventListener('sellsolar_installation_updated', handleUpdate);
      clearInterval(timer);
    };
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    return (requests || []).filter((req) => {
      if (!req) return false;
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (cityFilter !== 'all' && (req.city || '').toLowerCase() !== cityFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (req.fullName || '').toLowerCase().includes(q);
        const matchPhone = (req.phone || '').includes(q);
        const matchCity = (req.city || '').toLowerCase().includes(q);
        const matchType = (req.systemType || '').toLowerCase().includes(q);
        const matchTracking = (req.trackingCode || '').toLowerCase().includes(q);
        const matchNotes = (req.notes || '').toLowerCase().includes(q);
        const matchAddress = (req.address || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCity && !matchType && !matchTracking && !matchNotes && !matchAddress) return false;
      }
      return true;
    });
  }, [requests, statusFilter, cityFilter, searchQuery]);

  const handleStatusChange = (trackingCode, newStatus) => {
    try {
      updateInstallationRequestStatus(trackingCode, newStatus, 'Status updated via Admin Super Dashboard');
      setRequests((prev) =>
        prev.map((r) => (r.trackingCode === trackingCode ? { ...r, status: newStatus } : r))
      );
      showToast({
        title: 'Status Updated',
        message: `Lead [${trackingCode}] set to "${INSTALLATION_STATUSES[newStatus]?.label || newStatus}".`,
        type: 'success',
      });
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleDelete = (trackingCode) => {
    if (!confirm('Are you sure you want to permanently delete this installation lead?')) return;
    try {
      deleteInstallationRequest(trackingCode);
      setRequests((prev) => prev.filter((r) => r.trackingCode !== trackingCode && r.id !== trackingCode));
      showToast({ title: 'Lead Deleted', message: `Lead [${trackingCode}] permanently removed.`, type: 'info' });
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const statusCounts = useMemo(() => {
    const counts = { all: requests.length, pending: 0, contacting: 0, survey_scheduled: 0, completed: 0, rejected: 0 };
    for (const r of requests) {
      if (counts[r.status] !== undefined) counts[r.status] += 1;
    }
    return counts;
  }, [requests]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Wrench className="h-6 w-6 text-indigo-600" />
              Turnkey Solar Installation Leads & Site Surveys
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              {requests.length} Total Leads
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real customer requests submitted through the /install portal, synced directly with Supabase database.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => loadRequests(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh and sync leads directly from Supabase Cloud Database"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Database'}</span>
          </button>

          <a
            href="https://wa.me/923083888043?text=Assalam-o-Alaikum%20SellSolar%20Installation%20Desk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-xs"
            title="Official WhatsApp Turnkey Alert Line"
          >
            <Phone className="h-3.5 w-3.5 text-emerald-600" />
            <span>Alert Desk: <strong>0308-3888043</strong></span>
          </a>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold transition-colors shadow-xs cursor-pointer"
            title="Download all leads as CSV spreadsheet"
          >
            <Download className="h-3.5 w-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl font-black text-amber-500 mt-1">{statusCounts.pending}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Contacted</p>
          <p className="text-2xl font-black text-blue-500 mt-1">{statusCounts.contacting}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Survey Scheduled</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{statusCounts.survey_scheduled}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{statusCounts.completed}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">All Leads</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{statusCounts.all}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-xs py-2 w-auto bg-white dark:bg-gray-900 font-bold"
          >
            <option value="all">All Statuses ({requests.length})</option>
            {Object.entries(INSTALLATION_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>{v.label} ({statusCounts[k] || 0})</option>
            ))}
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="input-field text-xs py-2 w-auto bg-white dark:bg-gray-900 font-bold"
          >
            <option value="all">All Cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search lead, code, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field text-xs pl-9 py-2 bg-white dark:bg-gray-900"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Lead / Tracking Code</th>
                <th className="px-4 py-3">Client & Contact</th>
                <th className="px-4 py-3">System Desired</th>
                <th className="px-4 py-3">Monthly Bill & Roof</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                    <Wrench className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-700 mb-2 opacity-50" />
                    No installation leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const statusMeta = INSTALLATION_STATUSES[req.status] || { label: req.status, color: 'bg-gray-100 text-gray-700' };
                  const isExpanded = expandedId === (req.trackingCode || req.id);

                  return (
                    <tr key={req.trackingCode || req.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {req.trackingCode}
                          </span>
                          {req.source === 'supabase_db' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" title="Live Supabase Cloud DB Record">
                              DB
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>{req.fullName}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                          <a href={`tel:${req.phone}`} className="hover:underline font-semibold text-primary-600 dark:text-primary-400 font-mono">
                            {req.phone || 'No Phone'}
                          </a>
                          <span>•</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{req.city}</span>
                        </div>
                        {req.address && (
                          <div className="text-[10px] text-gray-400 truncate max-w-xs mt-0.5" title={req.address}>
                            📍 {req.address}
                          </div>
                        )}
                        {req.notes && (
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 italic truncate max-w-xs mt-0.5" title={req.notes}>
                            📝 {req.notes}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-800 dark:text-gray-200">
                          {req.systemCapacityKw ? `${req.systemCapacityKw} kW System` : 'Custom System'}
                        </div>
                        <div className="text-[10px] text-gray-500 capitalize">
                          {req.systemType?.replace('_', ' ') || 'On-Grid Net Metering'}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-gray-700 dark:text-gray-300 font-mono">
                          {req.monthlyBill ? formatPrice(req.monthlyBill) : '—'}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {req.roofType || 'Residential Roof'}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.trackingCode || req.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border-0 cursor-pointer ${statusMeta.color}`}
                        >
                          {Object.entries(INSTALLATION_STATUSES).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`https://wa.me/${(() => {
                              let cleanWa = (req.phone || '').replace(/[^0-9]/g, '');
                              if (cleanWa.startsWith('0')) cleanWa = '92' + cleanWa.slice(1);
                              else if (!cleanWa.startsWith('92') && cleanWa) cleanWa = '92' + cleanWa;
                              return cleanWa;
                            })()}?text=${encodeURIComponent(
                              `Salam ${req.fullName || 'Sir'}, regarding your Solar Installation inquiry [${req.trackingCode}] on SellSolar.pk:`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Chat with Customer on WhatsApp"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/923083888043?text=${encodeURIComponent(
                              `🎯 *Turnkey Installation Lead [${req.trackingCode}]*\n` +
                              `• Customer: ${req.fullName}\n` +
                              `• Phone: ${req.phone}\n` +
                              `• City: ${req.city}\n` +
                              `• Capacity: ${req.systemCapacityKw ? req.systemCapacityKw + ' kW' : 'Custom'}\n` +
                              `• System Type: ${req.systemType?.replace('_', ' ') || 'On-Grid'}\n` +
                              `• Address: ${req.address || 'N/A'}\n` +
                              `• Notes: ${req.notes || 'None'}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 hover:bg-indigo-100 transition-colors"
                            title="Forward Lead to Turnkey Alert Desk (0308-3888043)"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(req.trackingCode || req.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete Lead Permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
