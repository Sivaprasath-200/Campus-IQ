import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Sparkles, X, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const AIAssistantModal: React.FC = () => {
  const { isAiModalOpen, setIsAiModalOpen, addToast, triggerRefresh } = useApp();
  const { user } = useAuth();

  const [prompt, setPrompt] = useState(
    'I need a computer lab for 55 students tomorrow from 2 to 4 PM with projector and internet.'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);

  if (!isAiModalOpen) return null;

  const handleProcess = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await api.parseAIRequest(prompt);
      setResult(res);
      addToast('info', 'AI Analysis Complete', 'Extracted structured parameters and ran allocation engine.');
    } catch (err: any) {
      addToast('error', 'AI Assistant Error', err.message || 'Failed to process natural language request.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!result?.allocationResult?.recommendedFacility) return;
    setConfirming(true);

    const f = result.allocationResult.recommendedFacility;
    const p = result.structuredParameters;

    try {
      await api.confirmAllocation({
        facility_id: f.id,
        date: p.date,
        start_time: p.startTime,
        end_time: p.endTime,
        purpose: `AI Requested: ${result.originalPrompt.slice(0, 60)}...`,
        priority: 'HIGH',
        students_count: p.capacity,
        department: user?.department || 'CSE',
      });

      addToast(
        'success',
        'Allocation Confirmed',
        `Successfully booked ${f.name} for ${p.date} (${p.startTime} - ${p.endTime}).`
      );
      triggerRefresh();
      setIsAiModalOpen(false);
    } catch (err: any) {
      addToast('error', 'Booking Blocked', err.message || 'Scheduling conflict detected.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-[#D7D7D5] rounded-[16px] shadow-xl p-8 overflow-hidden text-[#30383D]">
        <div className="flex items-center justify-between pb-5 border-b border-[#D7D7D5]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] text-[#30383D]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#30383D]">CampusIQ AI Assistant</h3>
              <p className="text-xs text-[#73777A] font-sans">
                Natural Language Facility Allocation & Constraint Optimization
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="text-[#73777A] hover:text-[#30383D] p-1.5 rounded-lg hover:bg-[#F7F7F5] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#30383D] uppercase tracking-wider mb-1.5 font-sans">
              Enter Natural Language Request
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g. I need a seminar hall for 150 students next Monday from 10 AM to 1 PM with audio system and video conferencing."
              className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[12px] px-4 py-3 text-sm text-[#30383D] placeholder-[#9CA3AF] focus:outline-none focus:border-[#30383D] focus:bg-white font-sans"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setPrompt('I need a computer lab for 55 students tomorrow from 2 to 4 PM with projector and internet.')
                }
                className="text-xs px-3 py-1.5 rounded-[8px] bg-[#F7F7F5] border border-[#D7D7D5] text-[#30383D] hover:bg-[#E5E7EB] transition font-sans"
              >
                Sample 1 (55 Students Lab)
              </button>
              <button
                type="button"
                onClick={() =>
                  setPrompt('Need Seminar Hall for 120 people today from 9 to 11 am with audio system and microphones.')
                }
                className="text-xs px-3 py-1.5 rounded-[8px] bg-[#F7F7F5] border border-[#D7D7D5] text-[#30383D] hover:bg-[#E5E7EB] transition font-sans"
              >
                Sample 2 (Seminar Hall)
              </button>
            </div>

            <button
              onClick={handleProcess}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#30383D] hover:bg-[#1F2428] text-white font-medium text-xs shadow-sm disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <span>Process with AI</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* AI Result Display */}
          {result && (
            <div className="mt-5 p-5 rounded-[14px] bg-[#F7F7F5] border border-[#D7D7D5] space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-[#D7D7D5] font-sans">
                <span className="font-semibold text-[#73777A] uppercase tracking-wider">
                  Extracted Constraints:
                </span>
                <span className="px-2.5 py-0.5 rounded-[6px] bg-white text-[#30383D] border border-[#D7D7D5] font-mono text-[11px] font-bold">
                  {result.structuredParameters.facilityType} • {result.structuredParameters.capacity} seats •{' '}
                  {result.structuredParameters.date} ({result.structuredParameters.startTime} -{' '}
                  {result.structuredParameters.endTime})
                </span>
              </div>

              {result.allocationResult.recommendedFacility ? (
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-serif text-lg font-bold text-[#30383D]">
                          {result.allocationResult.recommendedFacility.name}
                        </h4>
                      </div>
                      <p className="text-xs text-[#73777A] mt-0.5 font-sans">
                        Capacity: {result.allocationResult.recommendedFacility.capacity} seats • Building:{' '}
                        {result.allocationResult.recommendedFacility.building} • Floor{' '}
                        {result.allocationResult.recommendedFacility.floor}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-3xl font-bold text-[#30383D]">
                        {result.allocationResult.score}%
                      </span>
                      <p className="text-[10px] text-[#73777A] uppercase tracking-wider font-semibold">
                        Match Score
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 p-3.5 rounded-[10px] bg-white border border-[#D7D7D5] text-xs text-[#30383D] leading-relaxed font-sans">
                    <span className="font-bold text-[#30383D] block mb-1">AI Recommendation Rationale:</span>
                    {result.aiExplanation}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleConfirm}
                      disabled={confirming}
                      className="px-5 py-2 rounded-[8px] bg-[#30383D] hover:bg-[#1F2428] text-white font-medium text-xs flex items-center gap-2 shadow-sm disabled:opacity-50 transition"
                    >
                      {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Confirm Booking Instantly</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-700 text-xs p-3.5 rounded-[10px] bg-rose-50 border border-rose-200 font-sans">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{result.aiExplanation}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
