'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Server,
  Database,
  Search,
  HardDrive,
  Cpu,
  Layers,
} from 'lucide-react';
import type { HealthCheckResponse, ServiceHealthStatus } from '@/src/types';

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemHealthModal({ isOpen, onClose }: SystemHealthModalProps) {
  const [data, setData] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Failed to inspect system health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    fetch('/api/health')
      .then((res) => res.json())
      .then((json) => {
        if (!isCancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (!isCancelled) {
          setError(err?.message || 'Failed to inspect system health');
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const renderServiceIcon = (name: string) => {
    if (name.includes('PostgreSQL')) return <Database className="w-5 h-5 text-indigo-600" />;
    if (name.includes('Elasticsearch')) return <Search className="w-5 h-5 text-emerald-600" />;
    if (name.includes('Redis')) return <Layers className="w-5 h-5 text-red-500" />;
    if (name.includes('Storage')) return <HardDrive className="w-5 h-5 text-amber-500" />;
    return <Cpu className="w-5 h-5 text-purple-600" />;
  };

  const renderStatusBadge = (status: ServiceHealthStatus['status']) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </span>
        );
      case 'unconfigured':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
            <AlertTriangle className="w-3.5 h-3.5 text-stone-500" />
            Awaiting Credentials
          </span>
        );
      case 'disconnected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            Disconnected
          </span>
        );
      case 'error':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            Error
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/75">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-stone-900 text-white">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-base">livo System Infrastructure</h3>
              <p className="text-xs text-stone-500">Live health telemetry from Node.js REST API</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="health-modal-refresh"
              type="button"
              onClick={fetchHealth}
              disabled={loading}
              className="p-1.5 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors disabled:opacity-40"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="health-modal-close"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {loading && !data && (
            <div className="py-12 text-center text-sm text-stone-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-stone-400" />
              <span>Pinging backend infrastructure services...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {data && (
            <>
              {/* Overall Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-stone-200 bg-stone-50/50">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Overall Health Status
                    </span>
                    <p className="text-sm font-bold text-stone-900 capitalize">{data.status}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-stone-500">
                  <p>Uptime: {data.uptimeSeconds}s</p>
                  <p>Environment: {data.environment}</p>
                </div>
              </div>

              {/* Service Grid */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Configured Services & Integrations
                </span>

                {Object.entries(data.services).map(([key, service]) => (
                  <div
                    key={key}
                    className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {renderServiceIcon(service.name)}
                        <div>
                          <h4 className="text-sm font-semibold text-stone-900">{service.name}</h4>
                          {service.latencyMs !== undefined && (
                            <span className="text-[11px] text-stone-400">Latency: {service.latencyMs}ms</span>
                          )}
                        </div>
                      </div>
                      {renderStatusBadge(service.status)}
                    </div>
                    {service.message && (
                      <p className="text-xs text-stone-600 font-mono bg-stone-50 p-2 rounded-md border border-stone-100">
                        {service.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Info Note */}
              <div className="p-3 bg-stone-100 rounded-lg text-[11px] text-stone-600">
                <strong>Architectural Note:</strong> External services (PostgreSQL, Elasticsearch, Redis, S3/MinIO) are isolated with safe fallback mechanisms per user instructions (&quot;Do not connect to external services yet if credentials are unavailable&quot;). Once environment credentials are provided, connections will automatically activate.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
