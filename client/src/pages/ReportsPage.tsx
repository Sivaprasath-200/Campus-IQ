import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  Download,
  Printer,
  Building2,
  Layers,
  AlertTriangle,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { addToast } = useApp();

  const [activeReport, setActiveReport] = useState<'utilization' | 'bookings' | 'conflicts'>('utilization');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        if (activeReport === 'utilization') {
          const res = await api.getUtilizationReport();
          setReportData(res.data);
        } else if (activeReport === 'bookings') {
          const res = await api.getBookingsReport();
          setReportData(res.data);
        } else if (activeReport === 'conflicts') {
          const res = await api.getConflictsReport();
          setReportData(res.data);
        }
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [activeReport]);

  const exportToCSV = () => {
    if (!reportData || reportData.length === 0) {
      addToast('warning', 'No Data', 'No records available to export.');
      return;
    }

    const headers = Object.keys(reportData[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of reportData) {
      const values = headers.map((header) => {
        const val = row[header] !== undefined ? String(row[header]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CampusIQ_${activeReport}_manifest_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    addToast('success', 'CSV Exported', `Generated ${reportData.length} records in CSV.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#D7D7D5]">
        <div>
          <span className="text-[11px] font-semibold text-[#73777A] uppercase tracking-wider block mb-1">
            Data Manifests & Export
          </span>
          <h1 className="font-serif text-[38px] sm:text-[46px] font-bold leading-[1.0] text-[#30383D]">
            Campus Audit Reports
          </h1>
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-[#73777A]">
            Export comprehensive administrative logs and resource accountability manifests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-[10px] bg-white hover:bg-[#F7F7F5] border border-[#D7D7D5] text-xs font-semibold text-[#30383D] flex items-center gap-2 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-[10px] bg-white hover:bg-[#F7F7F5] border border-[#D7D7D5] text-xs font-semibold text-[#30383D] flex items-center gap-2 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex border-b border-[#D7D7D5] gap-6 text-xs font-semibold">
        {[
          { id: 'utilization', label: 'Facility Utilization Manifest', icon: Building2 },
          { id: 'bookings', label: 'Reservations Audit Log', icon: Layers },
          { id: 'conflicts', label: 'Conflict Manifest', icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`flex items-center gap-2 pb-3.5 transition relative font-sans ${
                isActive ? 'text-[#30383D] font-bold border-b-2 border-[#30383D]' : 'text-[#73777A] hover:text-[#30383D]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Table Manifest */}
      <div className="rounded-[16px] bg-white border border-[#D7D7D5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {reportData.length > 0 ? (
            <table className="w-full text-left text-xs text-[#30383D]">
              <thead className="bg-[#F7F7F5] text-[#73777A] font-semibold uppercase tracking-wider text-[11px] border-b border-[#D7D7D5]">
                <tr>
                  {Object.keys(reportData[0]).map((k) => (
                    <th key={k} className="p-4 font-sans">
                      {k.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7D7D5]/60 font-medium font-sans">
                {reportData.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F7F7F5] transition">
                    {Object.values(row).map((v: any, cIdx) => (
                      <td key={cIdx} className="p-4 truncate max-w-xs">
                        {String(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-12 text-center text-xs text-[#73777A] font-sans">No records found for this report.</p>
          )}
        </div>
      </div>
    </div>
  );
};
