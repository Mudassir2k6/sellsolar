'use client';

import { useState, useMemo, useEffect } from 'react';
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
} from 'lucide-react';
import {
  getStoredInstallationRequests,
  updateInstallationRequestStatus,
  deleteInstallationRequest,
  INSTALLATION_STATUSES,
} from '../lib/installation';
import { useToast } from '../context/ToastContext';
import { CITIES, formatPrice } from '../lib/constants';

export default function AdminInstallationsModule() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const loadRequests = () => {
    const list = getStoredInstallationRequests();
    setRequests(list);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (cityFilter !== 'all' && req.city?.toLowerCase() !== cityFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = req.fullName?.toLowerCase().includes(q);
        const matchPhone = req.phone?.includes(q);
        const matchCity = req.city?.toLowerCase().includes(q);
        const matchType = req.systemType?.toLowerCase().includes(q);
        const matchTracking = req.trackingCode?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCity && !matchType && !matchTracking) return false;
      }
      return true;
    });
  }, [requests, statusFilter, cityFilter, searchQuery]);

  const handleStatusChange = (trackingCode, newStatus) => {
    try {
      updateInstallationRequestStatus(trackingCode, newStatus, 'Status updated via Admin Super Dashboard');
      loadRequests();
      showToast({
        title: 'Status Updated',
        message: `Request [${trackingCode}] set to "${INSTALLATION_STATUSES[newStatus]?.label || newStatus}".`,
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
      loadRequests();
      showToast({ title: 'Lead Deleted', message: `Lead [${trackingCode}] removed.`, type: 'info' });
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
            Track user requests for residential & commercial net-metering, rooftop site inspections, EPC feasibility, and certified solar setups.
          </p>
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
                  <td colSpan={6} className="text-center py-10 text-gray-400 text-xs">
                    No installation leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const statusMeta = INSTALLATION_STATUSES[req.status] || { label: req.status, color: 'bg-gray-100 text-gray-700' };
                  const isExpanded = expandedId === req.trackingCode;

                  return (
                    <tr key={req.trackingCode} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {req.trackingCode}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-black text-gray-900 dark:text-white">{req.fullName}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                          <a href={`tel:${req.phone}`} className="hover:underline font-mono text-gray-700 dark:text-gray-300">
                            {req.phone}
                          </a>
                          <span>•</span>
                          <span>{req.city}</span>
                        </div>
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
                          {req.roofType || 'Concrete Roof'}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.trackingCode, e.target.value)}
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
                            href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Salam ${req.fullName}, regarding your Solar Installation inquiry [${req.trackingCode}] on SellSolar.pk:`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100"
                            title="Chat on WhatsApp"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(req.trackingCode)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-rose-600"
                            title="Delete Lead"
                          >
                            <X className="h-3.5 w-3.5" />
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
