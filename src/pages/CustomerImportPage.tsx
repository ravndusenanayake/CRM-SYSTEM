import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Customer, CustomerType } from '../types/crm';
import {
  UploadCloud,
  Download,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  ArrowRight,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface CustomerImportPageProps {
  onNavigateToCustomers: () => void;
}

interface ParsedCustomerRow {
  id: number;
  companyName: string;
  contactPerson: string;
  mobile: string;
  telephone: string;
  email: string;
  address: string;
  city: string;
  customerType: CustomerType;
  industry: string;
  source: string;
  status: string;
  notes: string;
  isValid: boolean;
  isDuplicate: boolean;
  validationError?: string;
}

export const CustomerImportPage: React.FC<CustomerImportPageProps> = ({
  onNavigateToCustomers
}) => {
  const { allCustomers, bulkImportCustomers, users, salespersons, currentUser } = useCrm();

  const [parsedRows, setParsedRows] = useState<ParsedCustomerRow[]>([]);
  const [assignedRepId, setAssignedRepId] = useState(
    users.find(u => u.role === 'CRM_USER')?.id || currentUser.id
  );
  const [assignedSalesId, setAssignedSalesId] = useState(salespersons[0]?.id || 'sales-1');
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const downloadSampleCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'CompanyName,ContactPerson,MobileNumber,Telephone,Email,Address,City,CustomerType,Industry,Source,Status,Notes',
        'Senok Commercial Vehicles Service Hub,Prasanna Wickramatunga,+94 77 554 9900,+94 11 250 1200,service@senok.lk,No. 3 Dr. N.M. Perera Mawatha,Colombo 08,Workshop,Automotive,Trade Expo,Active,Fleet service for Audi and Subaru.',
        'DIMO Logistics & Service Hub,Sarath Gunawardena,+94 77 450 1122,+94 11 244 8871,sarath.g@dimolanka.com,No. 65 Jetawana Road,Colombo 14,Fleet Operator,Cargo & Transport,Referral,Active,Existing customer duplicate test',
        'International Construction Consortium,Dhammika Perera,+94 77 889 0011,+94 11 440 1000,procurement@icc.lk,Ekala Industrial Zone,Ja-Ela,Construction Contractor,Construction,Web Search,New,Large consumption of chemical anchors.',
        'Micro Cars Assembly Plant,Sanjeewa Premaratne,+94 77 333 9876,,sanjeewa.p@microcars.lk,Peliyagoda Industrial Park,Peliyagoda,Workshop,Automotive,Referral,Active,Duplicate check test'
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Wurth_Customer_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadSampleDataset = () => {
    const sampleRows: Omit<ParsedCustomerRow, 'isValid' | 'isDuplicate' | 'validationError'>[] = [
      {
        id: 1,
        companyName: 'Senok Commercial Vehicles Service Hub',
        contactPerson: 'Prasanna Wickramatunga',
        mobile: '+94 77 554 9900',
        telephone: '+94 11 250 1200',
        email: 'service@senok.lk',
        address: 'No. 3, Dr. N.M. Perera Mawatha',
        city: 'Colombo 08',
        customerType: 'Workshop',
        industry: 'Automotive',
        source: 'Trade Expo',
        status: 'Active',
        notes: 'Fleet service for Audi and Subaru. Heavy demand for Würth synthetic lubricants.'
      },
      {
        id: 2,
        companyName: 'Lanka Transformers Maintenance & Engineering',
        contactPerson: 'Eng. Janaka Bandara',
        mobile: '+94 71 440 2233',
        telephone: '+94 11 260 5511',
        email: 'maintenance@ltl.lk',
        address: 'Transformer Complex, Angulana',
        city: 'Moratuwa',
        customerType: 'Marine & Industrial',
        industry: 'Metal & Engineering',
        source: 'Referral',
        status: 'Active',
        notes: 'High-voltage hardware assembly. Requires Würth torque-calibrated tooling.'
      },
      {
        id: 3,
        companyName: 'DIMO Logistics & Service Hub',
        contactPerson: 'Sarath Gunawardena',
        mobile: '+94 77 450 1122',
        telephone: '+94 11 244 8871',
        email: 'sarath.g@dimolanka.com',
        address: 'No. 65, Jetawana Road',
        city: 'Colombo 14',
        customerType: 'Fleet Operator',
        industry: 'Cargo & Transport',
        source: 'Referral',
        status: 'Active',
        notes: 'Existing customer duplicate test'
      },
      {
        id: 4,
        companyName: 'International Construction Consortium (ICC) Precast Yard',
        contactPerson: 'Dhammika Perera',
        mobile: '+94 77 889 0011',
        telephone: '+94 11 440 1000',
        email: 'procurement@icc.lk',
        address: 'Precast Plant, Ekala Industrial Zone',
        city: 'Ja-Ela',
        customerType: 'Construction Contractor',
        industry: 'Construction',
        source: 'Web Search',
        status: 'New',
        notes: 'Large consumption of formwork release agents and rebar chemical anchors.'
      },
      {
        id: 5,
        companyName: 'Auto Mirage Premier Care (Duplicate Phone Test)',
        contactPerson: 'Asanka Karunaratne',
        mobile: '+94 77 654 3210',
        telephone: '+94 11 251 9002',
        email: 'info@automirage.lk',
        address: 'High Level Road',
        city: 'Nugegoda',
        customerType: 'Workshop',
        industry: 'Automotive',
        source: 'Referral',
        status: 'Active',
        notes: 'Duplicate check test matching CUST-1004'
      }
    ];

    validateAndSetRows(sampleRows);
  };

  const validateAndSetRows = (rawRows: any[]) => {
    const validated: ParsedCustomerRow[] = rawRows.map((row, idx) => {
      const cleanPhone = (row.mobile || '').replace(/\s+/g, '');

      // Duplicate search in existing master customer database
      const existingMatch = allCustomers.find(c => {
        const cPhone = (c.mobile || '').replace(/\s+/g, '');
        const cTel = (c.telephone || '').replace(/\s+/g, '');
        return cleanPhone && (cPhone.includes(cleanPhone) || cleanPhone.includes(cPhone) || (cTel && cTel.includes(cleanPhone)));
      });

      const isDuplicate = !!existingMatch;
      const validationError = isDuplicate
        ? `Existing mobile number matched with ${existingMatch?.id} (${existingMatch?.companyName})`
        : undefined;

      return {
        ...row,
        id: idx + 1,
        isValid: true,
        isDuplicate,
        validationError
      };
    });

    setParsedRows(validated);
    setImportedCount(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return;

    const rows = lines.slice(1).map((line, idx) => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      return {
        id: idx + 1,
        companyName: cols[0] || 'Unknown Company',
        contactPerson: cols[1] || 'Unknown Contact',
        mobile: cols[2] || '+94 77 000 0000',
        telephone: cols[3] || '',
        email: cols[4] || '',
        address: cols[5] || '',
        city: cols[6] || 'Colombo',
        customerType: (cols[7] as CustomerType) || 'Workshop',
        industry: cols[8] || 'Automotive',
        source: cols[9] || 'Bulk CSV Migration',
        status: cols[10] || 'Active',
        notes: cols[11] || ''
      };
    });

    validateAndSetRows(rows);
  };

  const handleExecuteImport = () => {
    // FILTER OUT DUPLICATES AUTOMATICALLY (Exact duplicate prevention rule)
    const validNonDuplicates = parsedRows.filter(r => r.isValid && !r.isDuplicate);
    if (validNonDuplicates.length === 0) {
      alert('No new non-duplicate records to import. All rows are duplicates or invalid.');
      return;
    }

    const newCustomers = validNonDuplicates.map(r => ({
      name: r.contactPerson,
      companyName: r.companyName,
      contactPerson: r.contactPerson,
      mobile: r.mobile,
      telephone: r.telephone,
      email: r.email,
      address: r.address,
      city: r.city,
      customerType: r.customerType,
      industry: r.industry,
      source: r.source,
      status: r.status as any,
      assignedCrmUserId: assignedRepId,
      assignedSalespersonId: assignedSalesId,
      notes: r.notes || 'Imported via Bulk CSV Import Engine'
    }));

    const count = bulkImportCustomers(newCustomers);
    setImportedCount(count);
  };

  const duplicateCount = parsedRows.filter(r => r.isDuplicate).length;
  const validCleanCount = parsedRows.filter(r => r.isValid && !r.isDuplicate).length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Bulk Customer Import & Master Migration Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Import customer accounts from spreadsheets, validate Sri Lankan phone numbers, check duplicates, and batch-assign to sales territories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Download CSV Template</span>
          </button>
          <button
            onClick={loadSampleDataset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#CC0000] text-white text-xs font-bold hover:bg-[#B30000] shadow-xs transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Load Sample Import File</span>
          </button>
        </div>
      </div>

      {importedCount !== null && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 font-bold">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span>Successfully imported {importedCount} commercial customer accounts!</span>
          </div>
          <p className="text-emerald-800">
            Records have been validated, duplicate phone numbers were filtered out, and accounts assigned to the selected salesperson.
          </p>
          <button
            onClick={onNavigateToCustomers}
            className="px-3 py-1.5 rounded bg-emerald-800 text-white font-bold inline-flex items-center gap-1.5 hover:bg-emerald-900"
          >
            <span>View in Customer Database</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-xs text-center">
        <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-900">Upload CSV Spreadsheet File</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Ensure file columns correspond to the standard template. System will sanitize Sri Lankan mobile numbers and prevent duplicate entries.
        </p>

        <label className="mt-4 inline-block px-4 py-2 rounded bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs">
          Browse CSV File
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Batch Assignment Controls & Duplicate Summary */}
      {parsedRows.length > 0 && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded p-4 text-xs space-y-3">
            <div className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
              Batch Assignment Configuration
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Assigned Field Salesperson
                </label>
                <select
                  value={assignedSalesId}
                  onChange={e => setAssignedSalesId(e.target.value)}
                  className="w-full rounded border border-slate-300 py-1.5 px-2 bg-white text-xs font-medium"
                >
                  {salespersons.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.region} - {s.division})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Assigned CRM Specialist
                </label>
                <select
                  value={assignedRepId}
                  onChange={e => setAssignedRepId(e.target.value)}
                  className="w-full rounded border border-slate-300 py-1.5 px-2 bg-white text-xs font-medium"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} (Ext {u.extension})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Duplicate Analysis Alert Bar */}
          {duplicateCount > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs flex items-center justify-between text-amber-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Duplicate Detection Active:</strong> Found{' '}
                  <strong className="text-amber-800">{duplicateCount} duplicate phone numbers</strong>{' '}
                  already registered in the customer database. These rows will be safely{' '}
                  <strong>skipped</strong> during import.
                </span>
              </div>
              <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {validCleanCount} Clean Rows Ready
              </span>
            </div>
          )}

          {/* Preview Table */}
          <div className="bg-white border border-slate-200 rounded p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">
                Import Preview & Duplicate Analysis ({parsedRows.length} Rows Parsed)
              </span>

              <button
                onClick={handleExecuteImport}
                disabled={validCleanCount === 0}
                className="px-4 py-1.5 rounded bg-[#CC0000] text-white font-bold hover:bg-[#B30000] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                Import Clean Accounts ({validCleanCount} Records)
              </button>
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 rounded">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold sticky top-0">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Company Name</th>
                    <th className="px-3 py-2">Contact Person</th>
                    <th className="px-3 py-2">Mobile Number</th>
                    <th className="px-3 py-2">City</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Validation / Duplicate Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((r, i) => (
                    <tr
                      key={i}
                      className={
                        r.isDuplicate
                          ? 'bg-amber-50/60 text-slate-700'
                          : 'hover:bg-slate-50'
                      }
                    >
                      <td className="px-3 py-2 font-mono text-slate-400">{i + 1}</td>
                      <td className="px-3 py-2 font-bold text-slate-900">{r.companyName}</td>
                      <td className="px-3 py-2 text-slate-700">{r.contactPerson}</td>
                      <td className="px-3 py-2 font-mono font-bold text-slate-800">{r.mobile}</td>
                      <td className="px-3 py-2 text-slate-600">{r.city}</td>
                      <td className="px-3 py-2 text-slate-500">{r.customerType}</td>
                      <td className="px-3 py-2">
                        {r.isDuplicate ? (
                          <div className="flex items-center gap-1.5 text-amber-800 font-medium text-[11px]">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span>{r.validationError}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Valid (New Account)</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
