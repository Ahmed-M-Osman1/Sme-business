'use client';

import {useState, useCallback, useRef, useEffect} from 'react';
import type {OcrField} from '@/lib/mock-ocr';

const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah', 'UAQ', 'DIFC', 'ADGM'];

export const ACTIVITIES = [
  'Technology',
  'Trading',
  'Manufacturing',
  'Construction',
  'Healthcare',
  'Hospitality',
  'Retail',
  'Professional Services',
  'Transport & Logistics',
  'Food & Beverage',
  'Beauty Services',
  'Education',
  'Real Estate',
  'Financial Services',
  'Media & Advertising',
  'Other',
];

function ConfidenceDot({level}: {level: OcrField['confidence']}) {
  const colors = {
    high: 'bg-primary',
    medium: 'bg-amber-500',
    low: 'bg-red-500',
  };
  const titles = {
    high: 'High confidence',
    medium: 'Medium confidence — please verify',
    low: 'Low confidence — needs correction',
  };
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${colors[level]}`}
      title={titles[level]}
    />
  );
}

export function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

function isValidDate(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;
  const [, dd, mm, yyyy] = match;
  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  const year = parseInt(yyyy, 10);
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2020 || year > 2035) return false;
  return true;
}

interface EditableFieldProps {
  field: OcrField;
  label: string;
  fieldKey: string;
  onUpdate: (value: string) => void;
}

export function EditableField({field, label, fieldKey, onUpdate}: EditableFieldProps) {
  const needsEdit = field.confidence !== 'high';
  const [editing, setEditing] = useState(needsEdit);
  const [value, setValue] = useState(field.value);
  const [originalValue] = useState(field.value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const isDate = fieldKey === 'expiryDate';
  const isEmirate = fieldKey === 'emirate';
  const isActivity = fieldKey === 'activity';
  const isDropdown = isEmirate || isActivity;
  const dropdownOptions = isEmirate ? EMIRATES : isActivity ? ACTIVITIES : [];

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const borderColor =
    field.confidence === 'low'
      ? 'border-red-300'
      : field.confidence === 'medium'
        ? 'border-amber-300'
        : 'border-gray-200';

  const handleConfirm = () => {
    if (isDate && value && !isValidDate(value)) return;
    setEditing(false);
    onUpdate(value);
  };

  const handleCancel = () => {
    setValue(originalValue);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') handleCancel();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(formatDateInput(e.target.value));
  };

  // Display mode
  if (!editing) {
    return (
      <div
        className="group flex items-center gap-3 rounded-lg px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-200"
        onClick={() => setEditing(true)}
      >
        <ConfidenceDot level={field.confidence} />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{value || '—'}</p>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <path
            d="M10.08 1.75L12.25 3.92M1.75 12.25L2.33 9.79L9.33 2.79C9.53 2.59 9.85 2.59 10.05 2.79L11.21 3.95C11.41 4.15 11.41 4.47 11.21 4.67L4.21 11.67L1.75 12.25Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // Edit mode
  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 bg-white transition-all duration-200 ${borderColor}`}>
      <ConfidenceDot level={field.confidence} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</p>
        {isDropdown ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-sm font-medium text-gray-900 bg-transparent outline-none mt-0.5 cursor-pointer"
          >
            {!dropdownOptions.includes(value) && value && (
              <option value={value}>{value}</option>
            )}
            {dropdownOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={isDate ? handleDateChange : (e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isDate ? 'DD/MM/YYYY' : ''}
            maxLength={isDate ? 10 : undefined}
            className="w-full text-sm font-medium text-gray-900 bg-transparent outline-none mt-0.5"
          />
        )}
        {isDate && value && !isValidDate(value) && value.length >= 10 && (
          <p className="text-[10px] text-red-500 mt-0.5">Invalid date format (DD/MM/YYYY)</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleConfirm}
          className="w-7 h-7 rounded-md bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
          title="Confirm"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary">
            <path d="M3.5 7.5L6 10L10.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={handleCancel}
          className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          title="Cancel"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-500">
            <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function DragDropZone({
  onFile,
  fileRef,
}: {
  onFile: (file: File) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        setSelectedFile(file);
        onFile(file);
      }
    },
    [onFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        onFile(file);
      }
    },
    [onFile],
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      className={`relative min-h-48 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
        dragOver
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-gray-300 hover:border-primary/40 bg-white hover:bg-gray-50'
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-200 ${dragOver ? 'bg-primary/10' : 'bg-gray-100'}`}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path
            d="M12 16V8M12 8L9 11M12 8L15 11M4 14.899A6.002 6.002 0 0 1 8.465 4.135a8.001 8.001 0 0 1 13.535 4.76A4.5 4.5 0 0 1 19.5 18H6a5 5 0 0 1-2-9.101Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900">Drop your trade license here</p>
        <p className="text-xs text-gray-500 mt-1">
          or{' '}
          <span className="text-primary font-medium underline underline-offset-2">browse files</span>
        </p>
      </div>
      <p className="text-[11px] text-gray-400">PDF, PNG, or JPG up to 10 MB</p>

      {selectedFile && (
        <div className="flex items-center gap-2 mt-1 px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-500">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary shrink-0">
            <path d="M8.167 1.167H3.5A1.167 1.167 0 0 0 2.333 2.333v9.334A1.167 1.167 0 0 0 3.5 12.833h7A1.167 1.167 0 0 0 11.667 11.667V4.667L8.167 1.167Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="truncate max-w-44">{selectedFile.name}</span>
          <span className="text-gray-400">{formatSize(selectedFile.size)}</span>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
