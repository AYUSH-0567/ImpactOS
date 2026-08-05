import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { dataService } from '../../services/dataService';
import { 
  Upload, 
  FileCheck, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  FileSpreadsheet, 
  SlidersHorizontal, 
  PieChart as PieChartIcon, 
  RotateCcw,
  Users,
  Building2,
  Table as TableIcon,
  Search,
  Check
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DataImportViewProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

type WorkflowStep = 'UPLOAD' | 'VALIDATE' | 'PREVIEW' | 'MAP_COLUMNS' | 'CONFIRM' | 'IMPORT_STORE' | 'ANALYTICS';

interface TargetFieldDef {
  key: string;
  label: string;
  required: boolean;
  aliases: string[];
}

const BENEFICIARY_TARGET_FIELDS: TargetFieldDef[] = [
  { key: 'name', label: 'Full Name', required: true, aliases: ['name', 'full_name', 'beneficiary_name', 'candidate_name', 'participant'] },
  { key: 'gender', label: 'Gender / Sex', required: false, aliases: ['gender', 'sex', 'gender_identity'] },
  { key: 'age', label: 'Age (Years)', required: false, aliases: ['age', 'age_yrs', 'years_old'] },
  { key: 'state', label: 'State', required: true, aliases: ['state', 'state_name', 'region', 'province'] },
  { key: 'district', label: 'District / City', required: true, aliases: ['district', 'district_name', 'city', 'town'] },
  { key: 'status', label: 'Enrollment Status', required: false, aliases: ['status', 'enrollment_status', 'active_status'] },
  { key: 'incomeTier', label: 'Household Income', required: false, aliases: ['income', 'income_tier', 'monthly_income', 'household_income'] },
  { key: 'phone', label: 'Contact Phone', required: false, aliases: ['phone', 'mobile', 'contact', 'phone_number'] },
  { key: 'aadhaarMasked', label: 'Aadhaar / ID', required: false, aliases: ['aadhaar', 'uid', 'id_number', 'aadhaar_masked'] }
];

export const DataImportView: React.FC<DataImportViewProps> = ({ onNotify, onNavigateToTab }) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('UPLOAD');
  const [fileName, setFileName] = useState<string>('');
  
  // Parsed Raw File State
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);

  // Column Mapping: TargetKey -> RawHeaderName
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Validation Audit Report
  const [validationReport, setValidationReport] = useState<{
    totalRows: number;
    validRows: number;
    errorRows: { rowNum: number; errors: string[] }[];
    duplicateCount: number;
  }>({ totalRows: 0, validRows: 0, errorRows: [], duplicateCount: 0 });

  // Import Result & Analytics State
  const [importSummary, setImportSummary] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<{
    genderBreakdown: { name: string; value: number; color: string }[];
    stateBreakdown: { state: string; count: number }[];
  } | null>(null);

  // 1. UPLOAD FILE PARSER (.csv, .xlsx, .xls)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonRows.length === 0) {
          onNotify('error', 'Empty File', 'The uploaded file contains no data rows.');
          return;
        }

        const headers = Object.keys(jsonRows[0] || {});
        setRawHeaders(headers);
        setRawRows(jsonRows);

        // Smart Auto-Aliasing Assignment
        const initialMapping: Record<string, string> = {};
        BENEFICIARY_TARGET_FIELDS.forEach(field => {
          const matchedHeader = headers.find(h => {
            const cleanH = h.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
            return field.aliases.some(alias => cleanH.includes(alias));
          });
          initialMapping[field.key] = matchedHeader || '';
        });
        setColumnMapping(initialMapping);

        // Run Pre-Ingestion Audit
        runValidationAudit(jsonRows, initialMapping);
        setCurrentStep('VALIDATE');
        onNotify('success', 'File Parsed', `Loaded ${jsonRows.length} records from ${file.name}.`);

      } catch (err: any) {
        onNotify('error', 'File Error', err.message || 'Could not parse CSV/Excel file.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Sample NGO Data Template Loader
  const handleLoadSample = () => {
    const sampleRows = [
      { 'Full Name': 'Sunita Devi', 'Sex': 'Female', 'Age': '32', 'State Name': 'Delhi', 'District Name': 'Central Delhi', 'Mobile': '+91 9810233411' },
      { 'Full Name': 'Rahul Kumar', 'Sex': 'Male', 'Age': '14', 'State Name': 'Haryana', 'District Name': 'Gurugram', 'Mobile': '+91 9871144522' },
      { 'Full Name': 'Pooja Verma', 'Sex': 'Female', 'Age': '22', 'State Name': 'Uttar Pradesh', 'District Name': 'Varanasi', 'Mobile': '+91 9450188933' },
      { 'Full Name': 'Meena Sharma', 'Sex': 'Female', 'Age': '45', 'State Name': 'Rajasthan', 'District Name': 'Jaipur', 'Mobile': '+91 9414022144' },
      { 'Full Name': 'Rohan Deshmukh', 'Sex': 'Male', 'Age': '21', 'State Name': 'Maharashtra', 'District Name': 'Pune', 'Mobile': '+91 9822055655' }
    ];

    const headers = Object.keys(sampleRows[0]);
    setFileName('ngo_field_sample.xlsx');
    setRawHeaders(headers);
    setRawRows(sampleRows);

    const initialMapping: Record<string, string> = {
      name: 'Full Name',
      gender: 'Sex',
      age: 'Age',
      state: 'State Name',
      district: 'District Name',
      phone: 'Mobile'
    };

    setColumnMapping(initialMapping);
    runValidationAudit(sampleRows, initialMapping);
    setCurrentStep('VALIDATE');
  };

  // 2. VALIDATION & DUPLICATE AUDIT ENGINE
  const runValidationAudit = (rows: Record<string, any>[], mapping: Record<string, string>) => {
    const errorRows: { rowNum: number; errors: string[] }[] = [];
    const phoneSeen = new Set<string>();
    let duplicates = 0;

    rows.forEach((row, i) => {
      const rowNum = i + 1;
      const rowErrors: string[] = [];

      const nameCol = mapping.name ? row[mapping.name] : '';
      if (!nameCol || String(nameCol).trim() === '') {
        rowErrors.push('Missing required name');
      }

      const phoneCol = mapping.phone ? String(row[mapping.phone]).trim() : '';
      if (phoneCol) {
        if (phoneSeen.has(phoneCol)) {
          duplicates++;
          rowErrors.push('Duplicate phone in file');
        } else {
          phoneSeen.add(phoneCol);
        }
      }

      if (rowErrors.length > 0) {
        errorRows.push({ rowNum, errors: rowErrors });
      }
    });

    setValidationReport({
      totalRows: rows.length,
      validRows: rows.length - errorRows.length,
      errorRows,
      duplicateCount: duplicates
    });
  };

  // 6 & 7. EXECUTE IMPORT, STORE & ANALYTICS
  const handleExecuteImport = async () => {
    setCurrentStep('IMPORT_STORE');

    const mappedRecords = rawRows.map(row => {
      const record: Record<string, any> = {};
      BENEFICIARY_TARGET_FIELDS.forEach(field => {
        const colHeader = columnMapping[field.key];
        if (colHeader && row[colHeader] !== undefined) {
          record[field.key] = String(row[colHeader]).trim();
        }
      });
      return record;
    });

    try {
      const result = await dataService.importBeneficiaries(mappedRecords);
      setImportSummary({
        importedCount: result.importedCount,
        totalRecords: mappedRecords.length
      });

      const genderCounts: Record<string, number> = { Female: 0, Male: 0, Other: 0 };
      const stateCounts: Record<string, number> = {};

      mappedRecords.forEach(r => {
        const g = r.gender || 'Female';
        genderCounts[g] = (genderCounts[g] || 0) + 1;

        const s = r.state || 'Delhi';
        stateCounts[s] = (stateCounts[s] || 0) + 1;
      });

      setAnalyticsData({
        genderBreakdown: [
          { name: 'Female', value: genderCounts.Female || 0, color: '#0f766e' },
          { name: 'Male', value: genderCounts.Male || 0, color: '#0284c7' },
          { name: 'Other', value: genderCounts.Other || 0, color: '#8b5cf6' }
        ],
        stateBreakdown: Object.entries(stateCounts).map(([state, count]) => ({ state, count }))
      });

      setCurrentStep('ANALYTICS');
      onNotify('success', 'Database Import Complete', `Stored ${result.importedCount} records into the database.`);

    } catch (err: any) {
      setCurrentStep('CONFIRM');
      onNotify('error', 'Database Import Failed', err.message || 'Storage pipeline failed.');
    }
  };

  const resetPipeline = () => {
    setCurrentStep('UPLOAD');
    setFileName('');
    setRawHeaders([]);
    setRawRows([]);
    setColumnMapping({});
    setImportSummary(null);
    setAnalyticsData(null);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> Multi-Tenant Data Ingestion Pipeline
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">Enterprise Data Import Engine</h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Upload → Validate → Preview → Column Mapping → Confirm → Import → Store → Analytics
          </p>
        </div>

        {currentStep !== 'UPLOAD' && (
          <button
            onClick={resetPipeline}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Import
          </button>
        )}
      </div>

      {/* 8-STAGE WORKFLOW PROGRESS TRACKER */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs font-mono text-xs overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { step: 'UPLOAD', label: '1. Upload' },
            { step: 'VALIDATE', label: '2. Validate' },
            { step: 'PREVIEW', label: '3. Preview' },
            { step: 'MAP_COLUMNS', label: '4. Map Columns' },
            { step: 'CONFIRM', label: '5. Confirm' },
            { step: 'IMPORT_STORE', label: '6. Store DB' },
            { step: 'ANALYTICS', label: '7. Analytics' }
          ].map((s, idx) => {
            const stepsOrder = ['UPLOAD', 'VALIDATE', 'PREVIEW', 'MAP_COLUMNS', 'CONFIRM', 'IMPORT_STORE', 'ANALYTICS'];
            const isCurrent = currentStep === s.step;
            const isPast = stepsOrder.indexOf(currentStep) > idx;

            return (
              <div key={s.step} className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                  isCurrent
                    ? 'bg-teal-800 text-white border-teal-800 shadow-2xs'
                    : isPast
                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {s.label}
                </span>
                {idx < 6 && <span className="text-slate-300">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* STAGE 1: UPLOAD FILE */}
      {currentStep === 'UPLOAD' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-4 font-sans">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 hover:border-teal-500/50 transition cursor-pointer flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Upload CSV or Excel Workbook</h3>
            <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
              Supports <code>.csv</code>, <code>.xlsx</code>, and <code>.xls</code> format. Flexible column matcher supports any NGO spreadsheet format.
            </p>

            <div className="flex items-center gap-3">
              <label className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-2xs cursor-pointer">
                Select CSV / Excel File
                <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Load Sample Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: VALIDATION AUDIT REPORT */}
      {currentStep === 'VALIDATE' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-700" /> Validation & Pre-Ingestion Audit Report
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">File: {fileName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">TOTAL ROWS</span>
              <span className="font-bold text-slate-900 text-base">{validationReport.totalRows}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">VALID ROWS</span>
              <span className="font-bold text-emerald-700 text-base">{validationReport.validRows}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">ERROR ROWS</span>
              <span className="font-bold text-rose-700 text-base">{validationReport.errorRows.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">DUPLICATES DETECTED</span>
              <span className="font-bold text-amber-700 text-base">{validationReport.duplicateCount}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setCurrentStep('PREVIEW')}
              className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              Proceed to Raw Preview <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: RAW DATA PREVIEW */}
      {currentStep === 'PREVIEW' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 font-sans">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-teal-700" /> Spreadsheet Raw Data Preview (First 5 Rows)
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  {rawHeaders.map((h, i) => (
                    <th key={i} className="py-2.5 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rawRows.slice(0, 5).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/80">
                    {rawHeaders.map((h, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3 text-slate-800 text-[11px] truncate max-w-[150px]">
                        {String(row[h] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-between">
            <button onClick={() => setCurrentStep('VALIDATE')} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs">
              Back to Validation
            </button>
            <button onClick={() => setCurrentStep('MAP_COLUMNS')} className="px-5 py-2.5 rounded-xl bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5">
              Proceed to Column Mapping <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: INTERACTIVE COLUMN MAPPING */}
      {currentStep === 'MAP_COLUMNS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-700" /> Flexible Schema Column Mapping Interface
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Map custom raw spreadsheet headers to ImpactOS database fields.</p>
            </div>
          </div>

          <div className="space-y-2">
            {BENEFICIARY_TARGET_FIELDS.map((target) => {
              const currentMappedCol = columnMapping[target.key] || '';
              const isMapped = Boolean(currentMappedCol);

              return (
                <div key={target.key} className="grid grid-cols-12 gap-3 items-center p-3 rounded-xl border border-slate-200 hover:border-teal-500/50 transition text-xs">
                  <div className="col-span-5">
                    <span className="font-bold text-slate-900 block">{target.label}</span>
                    <span className="text-[10px] font-mono text-slate-400">{target.key} {target.required && <strong className="text-rose-600">*Required</strong>}</span>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${
                      isMapped ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {isMapped ? 'Mapped' : 'Optional'}
                    </span>
                  </div>

                  <div className="col-span-5">
                    <select
                      value={currentMappedCol}
                      onChange={(e) => {
                        const updated = { ...columnMapping, [target.key]: e.target.value };
                        setColumnMapping(updated);
                        runValidationAudit(rawRows, updated);
                      }}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-700"
                    >
                      <option value="">-- Ignore --</option>
                      {rawHeaders.map((header) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-between">
            <button onClick={() => setCurrentStep('PREVIEW')} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs">
              Back to Preview
            </button>
            <button onClick={() => setCurrentStep('CONFIRM')} className="px-5 py-2.5 rounded-xl bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5">
              Confirm Mapping <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 5: PRE-IMPORT CONFIRMATION */}
      {currentStep === 'CONFIRM' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 font-sans">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700" /> Confirm Import to Database
          </h3>
          <p className="text-xs text-slate-500">
            Review final import payload parameters. Executing will write {validationReport.validRows} valid records directly into your organization's private database.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs space-y-1">
            <p className="font-bold text-slate-900">Total File Records: {rawRows.length}</p>
            <p className="text-teal-800 font-bold">Valid Mapped Records: {validationReport.validRows}</p>
            <p className="text-amber-700 font-bold">Duplicates Flagged: {validationReport.duplicateCount}</p>
          </div>

          <div className="pt-2 flex justify-between">
            <button onClick={() => setCurrentStep('MAP_COLUMNS')} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs">
              Back to Column Mapping
            </button>
            <button onClick={handleExecuteImport} className="px-6 py-2.5 rounded-xl bg-teal-800 text-white font-bold text-xs shadow-2xs flex items-center gap-2">
              Confirm & Store in Database <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 6: IMPORT & STORE TO DB */}
      {currentStep === 'IMPORT_STORE' && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-3 font-sans">
          <div className="w-10 h-10 border-3 border-teal-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">Storing Records into Database...</h3>
          <p className="text-xs text-slate-500">Writing multi-tenant records to SQLite / PostgreSQL database store.</p>
        </div>
      )}

      {/* STAGE 7: IMMEDIATE INGESTION ANALYTICS */}
      {currentStep === 'ANALYTICS' && analyticsData && (
        <div className="space-y-6 font-sans">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Database Import Successfully Executed
              </h3>
              <span className="font-mono font-bold text-xs bg-emerald-100 px-3 py-1 rounded-full text-emerald-800">
                {importSummary?.importedCount} Records Saved
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              All records have been saved into your organization's private database workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-teal-700" /> Imported Gender Inclusion
                </h3>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analyticsData.genderBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                        {analyticsData.genderBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Imported State Distribution</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.stateBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="state" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '11px' }} />
                    <Bar dataKey="count" name="Beneficiaries" fill="#0f766e" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">View Ingested Beneficiaries in Directory</h4>
              <p className="text-xs text-slate-500">Access full database records, edit entries, or upload supporting documents.</p>
            </div>
            <button
              onClick={() => onNavigateToTab?.('beneficiaries')}
              className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition shadow-2xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              Open Beneficiary Directory <Users className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
