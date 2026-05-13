import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { HrService, type BulkImportResult, type CsvRowError } from '../../services/hr.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: BulkImportResult) => void;
}

type ImportStep = 'upload' | 'importing' | 'result';

const ACCEPTED_TYPES = '.csv,text/csv,application/vnd.ms-excel';

const BulkImportModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [expandedErrors, setExpandedErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload');
    setFile(null);
    setResult(null);
    setApiError(null);
    setExpandedErrors(false);
  };

  const handleClose = () => { reset(); onClose(); };

  // ── File selection ─────────────────────────────────────────────────────────
  const handleFileSelect = useCallback((selected: File | null) => {
    if (!selected) return;
    if (!selected.name.endsWith('.csv') && selected.type !== 'text/csv') {
      setApiError('Please upload a valid CSV file (.csv)');
      return;
    }
    if (selected.size > 2 * 1024 * 1024) {
      setApiError('File size must be under 2 MB');
      return;
    }
    setApiError(null);
    setFile(selected);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files?.[0] ?? null);
  };

  // ── Import ─────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!file) return;
    setStep('importing');
    setApiError(null);

    try {
      const importResult = await HrService.uploadCsv(file);
      setResult(importResult);
      setStep('result');
      if (importResult.successRows > 0) onSuccess(importResult);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Import failed. Please check the file format and try again.';
      setApiError(Array.isArray(msg) ? msg.join(', ') : msg);
      setStep('upload');
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderUploadStep = () => (
    <div className="space-y-5">
      {/* Template download */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div>
          <p className="text-sm font-bold text-blue-900">Need a template?</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Download the CSV template with correct headers
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="gap-2 shrink-0"
          onClick={HrService.downloadCsvTemplate}
        >
          <Download className="w-4 h-4" />
          Template
        </Button>
      </div>

      {/* Required columns info */}
      <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl">
        <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
          CSV Columns
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { col: 'fullName', req: true },
            { col: 'email', req: true },
            { col: 'phone', req: false },
            { col: 'department', req: false },
            { col: 'employeeCode', req: false },
            { col: 'joiningDate', req: false },
          ].map(({ col, req }) => (
            <div key={col} className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${req ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-text-tertiary)]'}`} />
              <code className="text-xs text-[var(--color-text-primary)] font-mono">{col}</code>
              {req && <span className="text-xs text-[var(--color-error)] font-bold">*</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-3">* required fields</p>
      </div>

      {/* Drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
            : file
            ? 'border-green-400 bg-green-50'
            : 'border-[var(--color-border-primary)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-bg-secondary)]'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleInputChange}
          className="hidden"
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-[var(--color-text-primary)] text-sm">{file.name}</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              className="text-xs text-[var(--color-error)] font-bold hover:underline"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-[var(--color-bg-secondary)] rounded-2xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-[var(--color-text-tertiary)]" />
            </div>
            <div>
              <p className="font-bold text-[var(--color-text-primary)] text-sm">
                Drop CSV here or <span className="text-[var(--color-primary)]">browse</span>
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                Max 200 rows · 2 MB limit
              </p>
            </div>
          </div>
        )}
      </div>

      {apiError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{apiError}</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button variant="secondary" className="flex-1" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          className="flex-1 gap-2"
          disabled={!file}
          onClick={handleImport}
        >
          <Upload className="w-4 h-4" />
          Import Employees
        </Button>
      </div>
    </div>
  );

  const renderImportingStep = () => (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      <div className="text-center">
        <p className="font-bold text-[var(--color-text-primary)]">Importing employees…</p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Validating rows, creating accounts and sending credentials
        </p>
      </div>
    </div>
  );

  const renderResultStep = () => {
    if (!result) return null;
    const allSuccess = result.failedRows === 0;
    const allFailed = result.successRows === 0;

    return (
      <div className="space-y-5">
        {/* Summary banner */}
        <div className={`p-5 rounded-2xl border ${
          allSuccess ? 'bg-green-50 border-green-200' :
          allFailed ? 'bg-red-50 border-red-200' :
          'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {allSuccess ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : allFailed ? (
              <XCircle className="w-6 h-6 text-red-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            )}
            <h3 className={`font-bold text-base ${
              allSuccess ? 'text-green-800' : allFailed ? 'text-red-800' : 'text-amber-800'
            }`}>
              {allSuccess
                ? 'Import completed successfully!'
                : allFailed
                ? 'Import failed — no employees created'
                : 'Import completed with some errors'}
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Rows', value: result.totalRows, color: 'text-[var(--color-text-primary)]' },
              { label: 'Created', value: result.successRows, color: 'text-green-700' },
              { label: 'Failed', value: result.failedRows, color: result.failedRows > 0 ? 'text-red-700' : 'text-green-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/60 rounded-xl p-3 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {result.emailFailures.length > 0 && (
            <p className="mt-3 text-xs text-amber-700 font-medium">
              ⚠️ Credential emails failed for {result.emailFailures.length} employee(s). Use "Resend" from the directory.
            </p>
          )}
        </div>

        {/* Row-level errors */}
        {result.errors.length > 0 && (
          <div className="border border-[var(--color-border-primary)] rounded-2xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-5 py-3.5 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
              onClick={() => setExpandedErrors((v) => !v)}
            >
              <span className="text-sm font-bold text-[var(--color-text-primary)]">
                {result.errors.length} row{result.errors.length !== 1 ? 's' : ''} with errors
              </span>
              {expandedErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expandedErrors && (
              <div className="divide-y divide-[var(--color-border-primary)] max-h-64 overflow-y-auto">
                {result.errors.map((err: CsvRowError) => (
                  <div key={err.row} className="px-5 py-3 bg-white">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded-lg shrink-0 mt-0.5">
                        Row {err.row}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">
                          {err.fullName || '(no name)'}{' '}
                          <span className="font-normal text-[var(--color-text-tertiary)]">
                            {err.email ? `<${err.email}>` : ''}
                          </span>
                        </p>
                        <ul className="mt-1 space-y-0.5">
                          {err.errors.map((e, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-red-600">
                              <X className="w-3 h-3 shrink-0" />
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Created employees list */}
        {result.created.length > 0 && (
          <div className="border border-[var(--color-border-primary)] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-primary)]">
              <span className="text-sm font-bold text-[var(--color-text-primary)]">
                {result.created.length} employee{result.created.length !== 1 ? 's' : ''} created
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-[var(--color-border-primary)]">
              {result.created.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 px-5 py-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] text-xs font-bold shrink-0">
                    {emp.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">{emp.fullName}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)] truncate">{emp.email}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          {result.errors.length > 0 && (
            <Button
              variant="secondary"
              className="gap-2"
              onClick={reset}
            >
              <RefreshCw className="w-4 h-4" />
              Import Again
            </Button>
          )}
          <Button variant="primary" className="flex-1" onClick={handleClose}>
            Done
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 'upload' ? 'Bulk Import Employees' :
        step === 'importing' ? 'Importing...' :
        'Import Results'
      }
      className="max-w-xl"
    >
      {step === 'upload' && renderUploadStep()}
      {step === 'importing' && renderImportingStep()}
      {step === 'result' && renderResultStep()}
    </Modal>
  );
};

export default BulkImportModal;
