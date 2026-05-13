import React, { useState } from 'react';
import { UserPlus, Mail, Phone, Building2, Hash, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { HrService, type CreateEmployeePayload, type CreateEmployeeResult } from '../../services/hr.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (employee: CreateEmployeeResult) => void;
  departments: string[];
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  employeeCode: string;
  joiningDate: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  department?: string;
  employeeCode?: string;
  joiningDate?: string;
}

const INITIAL_FORM: FormState = {
  fullName: '',
  email: '',
  phone: '',
  department: '',
  employeeCode: '',
  joiningDate: '',
};

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (form.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  if (!form.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (form.joiningDate && isNaN(new Date(form.joiningDate).getTime())) {
    errors.joiningDate = 'Please enter a valid date';
  }

  return errors;
}

const AddEmployeeModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, departments }) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateEmployeeResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError(null);

    const payload: CreateEmployeePayload = {
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      ...(form.phone.trim() && { phone: form.phone.trim() }),
      ...(form.department.trim() && { department: form.department.trim() }),
      ...(form.employeeCode.trim() && { employeeCode: form.employeeCode.trim() }),
      ...(form.joiningDate && { joiningDate: form.joiningDate }),
    };

    try {
      const created = await HrService.createEmployee(payload);
      setResult(created);
      onSuccess(created);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create employee. Please try again.';
      setApiError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setApiError(null);
    setResult(null);
    onClose();
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Employee Added">
        <div className="flex flex-col items-center text-center gap-6 py-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            result.emailSent ? 'bg-green-100' : 'bg-amber-100'
          }`}>
            {result.emailSent ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-amber-600" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
              {result.fullName} added successfully!
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{result.email}</p>
          </div>

          <div className="w-full bg-[var(--color-bg-secondary)] rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-tertiary)] font-medium">Credentials email</span>
              <span className={`font-bold ${result.emailSent ? 'text-green-600' : 'text-amber-600'}`}>
                {result.emailSent ? 'Sent ✓' : 'Failed — resend from directory'}
              </span>
            </div>
            {result.department && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-text-tertiary)] font-medium">Department</span>
                <span className="font-bold text-[var(--color-text-primary)]">{result.department}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 w-full">
            <Button variant="secondary" className="flex-1" onClick={handleClose}>
              Done
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => { setResult(null); setForm(INITIAL_FORM); }}
            >
              Add Another
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Employee" className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* API error banner */}
        {apiError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{apiError}</p>
          </div>
        )}

        {/* Row 1: Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            icon={UserPlus}
            placeholder="John Doe"
            value={form.fullName}
            onChange={handleChange('fullName')}
            error={errors.fullName}
            autoFocus
          />
          <Input
            label="Email Address *"
            icon={Mail}
            type="email"
            placeholder="john@company.com"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
          />
        </div>

        {/* Row 2: Phone + Employee Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone"
            icon={Phone}
            placeholder="+91-9876543210"
            value={form.phone}
            onChange={handleChange('phone')}
            error={errors.phone}
          />
          <Input
            label="Employee Code"
            icon={Hash}
            placeholder="EMP001"
            value={form.employeeCode}
            onChange={handleChange('employeeCode')}
            error={errors.employeeCode}
          />
        </div>

        {/* Row 3: Department + Joining Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Department: prefer select if departments exist, else text input */}
          {departments.length > 0 ? (
            <div className="w-full space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">
                Department
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
                <select
                  value={form.department}
                  onChange={handleChange('department')}
                  className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all appearance-none"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                  <option value="__other__">Other (type below)</option>
                </select>
              </div>
              {form.department === '__other__' && (
                <Input
                  placeholder="Enter department name"
                  value=""
                  onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                />
              )}
            </div>
          ) : (
            <Input
              label="Department"
              icon={Building2}
              placeholder="Engineering"
              value={form.department}
              onChange={handleChange('department')}
              error={errors.department}
            />
          )}

          <Input
            label="Joining Date"
            icon={Calendar}
            type="date"
            value={form.joiningDate}
            onChange={handleChange('joiningDate')}
            error={errors.joiningDate}
          />
        </div>

        {/* Info note */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            A temporary password will be auto-generated and sent to the employee's email with login instructions.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1 gap-2" isLoading={loading}>
            <UserPlus className="w-4 h-4" />
            Create Employee
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEmployeeModal;
