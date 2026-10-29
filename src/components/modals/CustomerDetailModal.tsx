import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Modal } from '../common/Modal';
import { Logo } from '../common/Logo';
import { Customer, VisitNote } from '../../types/crm';
import {
  PhoneCall,
  Edit,
  Building,
  User,
  Mail,
  MapPin,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  FileQuestion,
  Star,
  Award,
  ThumbsUp,
  ThumbsDown,
  Check,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  customerId?: string | null;
  onEdit: (customer: Customer) => void;
  onLogCall: (customer: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
  customerId,
  onEdit,
  onLogCall
}) => {
  const {
    allCustomers,
    calls,
    inquiries,
    complaints,
    salespersons,
    users,
    currentUser,
    addCustomerVisitNotes,
    reassignCustomer
  } = useCrm();

  const [activeTab, setActiveTab] = useState<
    'notes' | 'overview' | 'calls' | 'inquiries' | 'complaints' | 'reassign'
  >('notes');

  const targetCustomer = customer || (customerId ? allCustomers.find(c => c.id === customerId) : null);

  // Form state for Record Customer Interaction & Visit Note
  const [serviceFeedback, setServiceFeedback] = useState('Good (Satisfied with current arrangement)');
  const [brandPerception, setBrandPerception] = useState('Highly Respected / Premium German Quality');
  const [lastVisitDate, setLastVisitDate] = useState('');
  const [isProductive, setIsProductive] = useState<boolean>(true);
  const [summaryNote, setSummaryNote] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Reassign state
  const [selectedRepId, setSelectedRepId] = useState('');
  const [selectedSalesId, setSelectedSalesId] = useState('');
  const [reassignSaved, setReassignSaved] = useState(false);

  useEffect(() => {
    if (targetCustomer) {
      setServiceFeedback(
        targetCustomer.serviceRating
          ? targetCustomer.serviceRating.includes('Good')
            ? 'Good (Satisfied with current arrangement)'
            : targetCustomer.serviceRating.includes('Excellent')
            ? 'Excellent (Very happy with delivery & tools)'
            : targetCustomer.serviceRating
          : 'Good (Satisfied with current arrangement)'
      );
      setBrandPerception(
        targetCustomer.brandPerception || 'Highly Respected / Premium German Quality'
      );
      setLastVisitDate(
        targetCustomer.lastVisitDate || new Date().toISOString().split('T')[0]
      );
      setIsProductive(
        targetCustomer.isLastCallProductive !== undefined
          ? targetCustomer.isLastCallProductive
          : true
      );
      setSummaryNote('');
      setSelectedRepId(targetCustomer.assignedCrmUserId || '');
      setSelectedSalesId(targetCustomer.assignedSalespersonId || '');
      setSaveSuccessNotice(false);
      setReassignSaved(false);
    }
  }, [targetCustomer]);

  if (!targetCustomer) return null;

  const assignedRep = users.find(u => u.id === targetCustomer.assignedCrmUserId);
  const assignedSales = salespersons.find(s => s.id === targetCustomer.assignedSalespersonId);

  const customerCalls = calls.filter(c => c.customerId === targetCustomer.id);
  const customerInquiries = inquiries.filter(i => i.customerId === targetCustomer.id);
  const customerComplaints = complaints.filter(c => c.customerId === targetCustomer.id);
  const customerVisitNotes: VisitNote[] = targetCustomer.visitNotes || [];

  const handleSaveVisitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryNote.trim()) return;

    addCustomerVisitNotes(targetCustomer.id, {
      summaryNote: summaryNote.trim(),
      serviceFeedback: serviceFeedback.split(' (')[0],
      brandPerception: brandPerception.split(' (')[0],
      lastVisitDate: lastVisitDate || new Date().toISOString().split('T')[0],
      isProductive
    });

    setSummaryNote('');
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setLastVisitDate(today);
  };

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    reassignCustomer(targetCustomer.id, selectedRepId, selectedSalesId);
    setReassignSaved(true);
    setTimeout(() => setReassignSaved(false), 3000);
  };

  const nowFormatted = new Date().toISOString().replace('T', ' ').slice(0, 16);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={targetCustomer.companyName}
      subtitle={`Customer ID: ${targetCustomer.id} • Registered: ${targetCustomer.createdAt} by ${targetCustomer.createdBy || 'Commercial Ops'}`}
      maxWidth="4xl"
    >
      <div className="space-y-4 text-xs">
        {/* Top Header Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                {targetCustomer.contactPerson}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  targetCustomer.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {targetCustomer.status}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-medium">{targetCustomer.customerType}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-medium">{targetCustomer.industry}</span>
            </div>

            {/* Phone & Email */}
            <div className="flex flex-wrap items-center gap-3 text-slate-600 text-[11px]">
              <span className="font-mono text-slate-800 font-semibold flex items-center gap-1">
                <PhoneCall className="h-3 w-3 text-red-600" />
                {targetCustomer.mobile}
                {targetCustomer.telephone && ` | ${targetCustomer.telephone}`}
              </span>
              {targetCustomer.email && (
                <span className="flex items-center gap-1 text-slate-500">
                  <Mail className="h-3 w-3 text-slate-400" />
                  {targetCustomer.email}
                </span>
              )}
            </div>

            {/* Address */}
            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                {targetCustomer.address}, {targetCustomer.city}
              </span>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                <Star className="h-3 w-3 text-emerald-600 fill-emerald-500" />
                Service: {targetCustomer.serviceRating || 'Good'}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                <Award className="h-3 w-3 text-blue-600" />
                Brand: {targetCustomer.brandPerception || 'Highly Respected / Premium'}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200 font-mono">
                <Calendar className="h-3 w-3 text-slate-400" />
                Last Field Visit: {targetCustomer.lastVisitDate || '2026-09-18'}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ThumbsUp className="h-3 w-3 text-emerald-600" />
                Last Call: {targetCustomer.isLastCallProductive !== false ? 'Productive' : 'Non-Productive'}
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col items-end justify-between gap-3 shrink-0">
            <Logo variant="card" showSubtitle={false} />

            <div className="flex items-center gap-2">
              <button
                onClick={() => onLogCall(targetCustomer)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#CC0000] text-white font-bold hover:bg-[#B30000] transition-colors shadow-xs"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Call Customer</span>
              </button>
              <button
                onClick={() => onEdit(targetCustomer)}
                className="flex items-center gap-1.5 px-3 py-2 rounded border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 px-3.5 font-bold transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Service & Visit Notes</span>
            <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] font-mono text-slate-600">
              {customerVisitNotes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3.5 font-bold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Salesperson
          </button>

          <button
            onClick={() => setActiveTab('calls')}
            className={`pb-2.5 px-3.5 font-bold transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'calls'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Call History</span>
            <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] font-mono text-slate-600">
              {customerCalls.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`pb-2.5 px-3.5 font-bold transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Inquiries</span>
            <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] font-mono text-slate-600">
              {customerInquiries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`pb-2.5 px-3.5 font-bold transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'complaints'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Complaints</span>
            <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] font-mono text-slate-600">
              {customerComplaints.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reassign')}
            className={`pb-2.5 px-3.5 font-bold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'reassign'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Reassign
          </button>
        </div>

        {/* Tab 1: Service & Visit Notes (Original Screenshot UI) */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Record Customer Interaction & Visit Note Box */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="font-bold text-slate-900 text-xs">
                    Record Customer Interaction & Visit Note
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  <User className="h-3 w-3 text-slate-400" />
                  <span>
                    Auto-saving as: {currentUser.name} • {nowFormatted}
                  </span>
                </div>
              </div>

              {saveSuccessNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Interaction note saved and customer profile updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveVisitNote} className="space-y-3">
                {/* 2x2 Field Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* How is service? */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      ⭐ How is service? (Customer Service Feedback) *
                    </label>
                    <select
                      value={serviceFeedback}
                      onChange={e => setServiceFeedback(e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-900 focus:border-[#CC0000] focus:outline-hidden"
                    >
                      <option value="Good (Satisfied with current arrangement)">
                        ⭐⭐⭐⭐ Good (Satisfied with current arrangement)
                      </option>
                      <option value="Excellent (Very happy with delivery & tools)">
                        ⭐⭐⭐⭐⭐ Excellent (Very happy with delivery & tools)
                      </option>
                      <option value="Average (Needs improvement on supply)">
                        ⭐⭐⭐ Average (Needs improvement on supply)
                      </option>
                      <option value="Poor (Frequent stockouts / delays)">
                        ⭐⭐ Poor (Frequent stockouts / delays)
                      </option>
                    </select>
                  </div>

                  {/* How is brand? */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      🏆 How is brand? (Würth Brand Perception) *
                    </label>
                    <select
                      value={brandPerception}
                      onChange={e => setBrandPerception(e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-900 focus:border-[#CC0000] focus:outline-hidden"
                    >
                      <option value="Highly Respected / Premium German Quality">
                        🏆 Highly Respected / Premium German Quality
                      </option>
                      <option value="Acceptable / Standard Quality">
                        Acceptable / Standard Quality
                      </option>
                      <option value="Pricey / Expensive compared to local alternatives">
                        Pricey / Expensive compared to local alternatives
                      </option>
                      <option value="Negative Perception">Negative Perception</option>
                    </select>
                  </div>

                  {/* Last visit update */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      📅 Last visit update (Field Salesperson Visit Date) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        required
                        value={lastVisitDate}
                        onChange={e => setLastVisitDate(e.target.value)}
                        className="flex-1 rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleSetToday}
                        className="px-3 py-1.5 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 text-xs shrink-0"
                      >
                        Today
                      </button>
                    </div>
                  </div>

                  {/* Is this call productive or not? */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Is this call productive or not? *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsProductive(true)}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded border font-bold text-xs transition-colors ${
                          isProductive
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Productive (Yes)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsProductive(false)}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded border font-bold text-xs transition-colors ${
                          !isProductive
                            ? 'bg-red-50 border-red-500 text-red-800 ring-1 ring-red-500'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
                        <span>Not Productive (No)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Summary note */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Summary note (Discussion, Customer Feedback & Next Actions) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={summaryNote}
                    onChange={e => setSummaryNote(e.target.value)}
                    placeholder="Discussed monthly consumable refill, zebra tool requirements, client satisfaction with delivery..."
                    className="w-full rounded border border-slate-300 py-2 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden leading-relaxed"
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-[#CC0000] text-white font-bold hover:bg-[#B30000] transition-colors shadow-xs"
                  >
                    Save Interaction & Visit Note
                  </button>
                </div>
              </form>
            </div>

            {/* Previous Visit Notes History */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Interaction & Field Visit History ({customerVisitNotes.length})
              </div>

              {customerVisitNotes.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded text-center text-slate-500">
                  No previous visit notes logged yet. Use the form above to record customer feedback.
                </div>
              ) : (
                customerVisitNotes.map(n => (
                  <div
                    key={n.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {n.id}
                        </span>
                        <span className="font-bold text-slate-900">
                          {n.loggedInUserName}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-slate-500 text-[10px]">
                          {n.date} {n.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {n.isProductive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <ThumbsUp className="h-3 w-3" />
                            Productive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            <ThumbsDown className="h-3 w-3" />
                            Non-Productive
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line">
                      {n.summaryNote}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] pt-1">
                      {n.serviceFeedback && (
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                          ⭐ Service: {n.serviceFeedback}
                        </span>
                      )}
                      {n.brandPerception && (
                        <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-semibold border border-blue-200">
                          🏆 Brand: {n.brandPerception}
                        </span>
                      )}
                      {n.lastVisitDate && (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                          📅 Field Visit: {n.lastVisitDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Overview & Salesperson */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Assignments
                </div>
                <div>
                  <span className="text-slate-500">Tele-Sales Rep: </span>
                  <span className="font-semibold text-slate-900">
                    {assignedRep ? `${assignedRep.name} (Ext ${assignedRep.extension})` : 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Field Consultant: </span>
                  <span className="font-semibold text-slate-900">
                    {assignedSales ? `${assignedSales.name} (${assignedSales.code} • ${assignedSales.region})` : 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Industry & Type: </span>
                  <span className="font-semibold text-slate-900">
                    {targetCustomer.industry} • {targetCustomer.customerType}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Engagement Timetable
                </div>
                <div>
                  <span className="text-slate-500">Last Outbound Contact: </span>
                  <span className="font-mono font-medium text-slate-900">
                    {targetCustomer.lastContactDate || 'No record'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Next Scheduled Follow-up: </span>
                  <span className="font-mono font-bold text-[#CC0000]">
                    {targetCustomer.nextFollowUpDate || 'None scheduled'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Acquisition Source: </span>
                  <span className="font-medium text-slate-900">{targetCustomer.source}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-lg">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Account Requirements & Consumables Notes
              </div>
              <div className="text-slate-700 whitespace-pre-line leading-relaxed font-mono text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200">
                {targetCustomer.notes || 'No account notes recorded.'}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Call History */}
        {activeTab === 'calls' && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {customerCalls.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded">
                No outbound calls recorded for this customer yet.
              </div>
            ) : (
              customerCalls.map(c => (
                <div key={c.id} className="p-3 bg-white border border-slate-200 rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                        {c.id}
                      </span>
                      <span className="font-bold text-slate-900">{c.outcome}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[10px]">{c.callDate}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{c.notes}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                    <span>
                      Talk time: {Math.floor(c.durationSeconds / 60)}m {c.durationSeconds % 60}s
                    </span>
                    {c.nextFollowUpDate && <span>Next Follow-up: {c.nextFollowUpDate}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {customerInquiries.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded">
                No product inquiries registered for this customer.
              </div>
            ) : (
              customerInquiries.map(i => (
                <div key={i.id} className="p-3 bg-white border border-slate-200 rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#CC0000]">{i.id}</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      LKR {i.estimatedValueLkr.toLocaleString()}
                    </span>
                  </div>
                  <div className="font-medium text-slate-800">{i.requirementDetails}</div>
                  <div className="text-[10px] text-slate-500">
                    Division: {i.division} • Status: {i.status} • Logged: {i.createdAt}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Complaints */}
        {activeTab === 'complaints' && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {customerComplaints.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded">
                No active complaints on file for this customer.
              </div>
            ) : (
              customerComplaints.map(c => (
                <div key={c.id} className="p-3 bg-red-50/50 border border-red-200 rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#CC0000]">{c.id}</span>
                    <span className="font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded text-[10px]">
                      {c.priority} Priority
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900">{c.nature}</div>
                  <p className="text-slate-700 text-[11px]">{c.description}</p>
                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    SLA Deadline: {c.slaDeadline} • Status: {c.status}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 6: Reassign */}
        {activeTab === 'reassign' && (
          <form onSubmit={handleReassign} className="p-4 bg-white border border-slate-200 rounded-lg space-y-4">
            <div className="font-bold text-slate-900 text-xs">
              Reassign Customer Ownership & Field Sales Consultant
            </div>
            <p className="text-slate-500 text-xs">
              Update the responsible Tele-sales CRM rep or the Field Sales Consultant for this account.
            </p>

            {reassignSaved && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Account successfully reassigned!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Assigned Tele-Sales CRM User
                </label>
                <select
                  value={selectedRepId}
                  onChange={e => setSelectedRepId(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-900 focus:border-[#CC0000] focus:outline-hidden"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role} • Ext {u.extension})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Assigned Field Sales Consultant
                </label>
                <select
                  value={selectedSalesId}
                  onChange={e => setSelectedSalesId(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-900 focus:border-[#CC0000] focus:outline-hidden"
                >
                  {salespersons.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} • {s.region})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded bg-[#CC0000] text-white font-bold hover:bg-[#B30000] shadow-xs text-xs"
              >
                Save Reassignment
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
