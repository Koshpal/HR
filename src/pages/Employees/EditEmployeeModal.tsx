import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { HrService } from '../../services/hr.service';
import type { Employee } from '../../types/employee.types';

interface Props {
  employee: Employee | null;
  departments: string[];
  onClose: () => void;
  onSaved: () => void;
}

/** Fix a typo, change a department or add a code. The email is the employee's login, so it is not editable here. */
const EditEmployeeModal: React.FC<Props> = ({ employee, ...rest }) => (
  // Keyed by employee so the form starts fresh (no reset effect needed) for whoever is being edited.
  <EditForm key={employee?.id ?? 'none'} employee={employee} {...rest} />
);

const EditForm: React.FC<Props> = ({ employee, departments, onClose, onSaved }) => {
  const [form, setForm] = useState({
    fullName: employee?.name ?? '', phone: employee?.phone ?? '',
    department: employee?.department === 'N/A' ? '' : employee?.department ?? '', employeeCode: employee?.employeeCode ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    if (form.fullName.trim().length < 2) { setError('Please enter the full name.'); return; }
    setBusy(true);
    setError('');
    try {
      await HrService.updateEmployee(employee.id, {
        fullName: form.fullName.trim(), phone: form.phone.trim() || null, department: form.department.trim() || null, employeeCode: form.employeeCode.trim() || null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not save the changes. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal isOpen={!!employee} onClose={busy ? () => undefined : onClose} title="Edit employee">
      <form onSubmit={save} className="space-y-4" noValidate>
        <p className="text-sm text-[var(--color-text-secondary)]">{employee?.email}</p>
        <Input label="Full name" value={form.fullName} onChange={set('fullName')} maxLength={100} autoFocus />
        <Input label="Phone" value={form.phone} onChange={set('phone')} maxLength={30} />
        <div>
          <Input label="Department" value={form.department} onChange={set('department')} maxLength={80} list="edit-dept-list" />
          <datalist id="edit-dept-list">{departments.map((d) => <option key={d} value={d} />)}</datalist>
        </div>
        <Input label="Employee code" value={form.employeeCode} onChange={set('employeeCode')} maxLength={40} />
        {error && <p role="alert" className="text-sm text-[var(--color-error)]">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditEmployeeModal;
