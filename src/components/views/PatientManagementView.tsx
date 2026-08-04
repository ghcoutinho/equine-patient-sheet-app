import React, { useMemo, useState } from 'react';
import type { Patient, PatientLifecycle, BodySystem } from '../../types';
import { BODY_SYSTEM_META, ALL_BODY_SYSTEMS, suggestBodySystems } from '../../data/bodySystems';

interface PatientManagementViewProps {
  patients: Patient[];
  activePatientId: string;
  clinician: string;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onSelectPatient: (id: string) => void;
  onSetClinician: (name: string) => void;
}

const lifecycleOf = (p: Patient): PatientLifecycle => p.lifecycle ?? 'ACTIVE';

const LIFECYCLE_META: Record<PatientLifecycle, { label: string; chip: string }> = {
  ACTIVE: { label: 'Active', chip: 'bg-[#ECFDF5] text-[#047857] border-[#047857]/30' },
  DISCHARGED: { label: 'Discharged', chip: 'bg-[#eff4ff] text-[#0037b0] border-[#0037b0]/30' },
  ARCHIVED: { label: 'Archived', chip: 'bg-[#F8FAFC] text-[#475569] border-[#c4c5d7]' },
};

export const PatientManagementView: React.FC<PatientManagementViewProps> = ({
  patients,
  activePatientId,
  clinician,
  onUpdatePatient,
  onDeletePatient,
  onSelectPatient,
  onSetClinician,
}) => {
  const [filter, setFilter] = useState<PatientLifecycle | 'ALL'>('ACTIVE');
  const [hideTest, setHideTest] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Patient>>({});
  const [nameInput, setNameInput] = useState(clinician);

  const visible = useMemo(
    () =>
      patients.filter((p) => {
        if (hideTest && p.isTest) return false;
        if (filter === 'ALL') return true;
        return lifecycleOf(p) === filter;
      }),
    [patients, filter, hideTest],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: patients.length, ACTIVE: 0, DISCHARGED: 0, ARCHIVED: 0 };
    patients.forEach((p) => {
      c[lifecycleOf(p)] += 1;
    });
    return c;
  }, [patients]);

  const setLifecycle = (p: Patient, next: PatientLifecycle) => {
    const now = new Date().toISOString();
    onUpdatePatient({
      ...p,
      lifecycle: next,
      dischargedAt: next === 'DISCHARGED' ? now : p.dischargedAt,
      archivedAt: next === 'ARCHIVED' ? now : p.archivedAt,
      // Archiving and discharge preserve the whole record, including every
      // charted round — nothing is deleted, so it stays available for billing.
      // Reactivation opens a new admission boundary, so rounds from the
      // stay that just ended don't read as "current" once charting resumes.
      currentAdmissionStartedAt: next === 'ACTIVE' ? now : p.currentAdmissionStartedAt,
    });
  };

  const startEdit = (p: Patient) => {
    setEditingId(p.id);
    setDraft({
      name: p.name,
      caseNumber: p.caseNumber,
      breed: p.breed,
      weightKg: p.weightKg,
      age: p.age,
      location: p.location,
      diagnosis: p.diagnosis,
      bodySystems: p.bodySystems ?? [],
      attendingClinician: p.attendingClinician,
      isTest: p.isTest,
    });
  };

  const saveEdit = (p: Patient) => {
    onUpdatePatient({ ...p, ...draft } as Patient);
    setEditingId(null);
    setDraft({});
  };

  const toggleSystem = (sys: BodySystem) => {
    const current = (draft.bodySystems ?? []) as BodySystem[];
    setDraft({
      ...draft,
      bodySystems: current.includes(sys) ? current.filter((s) => s !== sys) : [...current, sys],
    });
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-5 bg-[#F8FAFC]">
      {/* Header + clinician identity */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-[#0037b0] text-white px-2.5 py-0.5 rounded font-label-caps text-xs">
            RECORDS
          </span>
          <span className="text-xs font-derived-value text-[#434655]">
            {patients.length} patients · {counts.ACTIVE} active
          </span>
        </div>
        <h1 className="font-display text-2xl text-[#0b1c30] mt-1">Patient Management</h1>

        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-end">
          <label className="flex-1">
            <span className="font-label-caps text-xs text-[#434655] block mb-1">
              Charting as (recorded against every round you save)
            </span>
            <div className="flex gap-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                className="flex-1 min-h-[44px] px-3 bg-white border border-[#c4c5d7] rounded font-body-md text-sm focus:ring-2 focus:ring-[#0037b0] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onSetClinician(nameInput.trim())}
                className="min-h-[44px] px-4 rounded bg-[#0037b0] text-white font-label-caps text-xs font-bold"
              >
                Save
              </button>
            </div>
            {!clinician && (
              <span className="block font-derived-value text-[11px] text-[#B45309] mt-1">
                No name set — rounds will be saved as “Unattributed”.
              </span>
            )}
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-wrap gap-2 items-center">
        {(['ACTIVE', 'DISCHARGED', 'ARCHIVED', 'ALL'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`min-h-[44px] px-4 rounded-lg border font-label-caps text-xs transition ${
              filter === f
                ? 'bg-[#0037b0] border-[#0037b0] text-white font-bold'
                : 'bg-white border-[#E2E8F0] text-[#0b1c30] hover:bg-[#f8f9ff]'
            }`}
          >
            {f === 'ALL' ? 'All' : LIFECYCLE_META[f].label} ({counts[f]})
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 font-body-md text-xs text-[#434655] min-h-[44px]">
          <input
            type="checkbox"
            checked={hideTest}
            onChange={(e) => setHideTest(e.target.checked)}
            className="w-4 h-4"
          />
          Hide test patients
        </label>
      </div>

      {/* List */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="bg-white p-8 rounded-lg border border-[#E2E8F0] text-center font-body-md text-sm text-[#434655]">
            No patients in this view.
          </div>
        )}

        {visible.map((p) => {
          const lc = lifecycleOf(p);
          const isEditing = editingId === p.id;
          return (
            <div
              key={p.id}
              className={`bg-white rounded-lg border shadow-sm overflow-hidden ${
                p.id === activePatientId ? 'border-[#0037b0]' : 'border-[#E2E8F0]'
              }`}
            >
              <div className="p-4 flex flex-wrap gap-3 items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-headline text-lg font-bold text-[#0b1c30]">{p.name}</h2>
                    {p.isTest && (
                      <span className="px-1.5 py-0.5 rounded bg-[#FFFBEB] border border-[#B45309]/30 text-[#B45309] font-label-caps text-[10px]">
                        TEST
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded border font-label-caps text-[10px] ${LIFECYCLE_META[lc].chip}`}
                    >
                      {LIFECYCLE_META[lc].label}
                    </span>
                  </div>
                  <p className="font-derived-value text-xs text-[#434655] mt-0.5">
                    {p.caseNumber} · {p.breed} · {p.weightKg} kg · {p.age} · {p.location}
                  </p>
                  {p.diagnosis && (
                    <p className="font-body-md text-sm text-[#0b1c30] mt-1">{p.diagnosis}</p>
                  )}
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {(p.bodySystems ?? []).map((s) => (
                      <span
                        key={s}
                        title={BODY_SYSTEM_META[s].label}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f8f9ff] border border-[#E2E8F0] text-[10px] font-sans"
                        style={{ color: BODY_SYSTEM_META[s].colour }}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {BODY_SYSTEM_META[s].icon}
                        </span>
                        {BODY_SYSTEM_META[s].label}
                      </span>
                    ))}
                  </div>
                  <p className="font-derived-value text-[11px] text-[#747686] mt-1">
                    {p.flowsheetHistory.length} round
                    {p.flowsheetHistory.length === 1 ? '' : 's'} recorded
                    {p.dischargedAt && ` · discharged ${new Date(p.dischargedAt).toLocaleDateString()}`}
                    {p.archivedAt && ` · archived ${new Date(p.archivedAt).toLocaleDateString()}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectPatient(p.id)}
                    className="min-h-[44px] px-3 rounded border border-[#E2E8F0] bg-white hover:bg-[#f8f9ff] font-label-caps text-xs"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => (isEditing ? setEditingId(null) : startEdit(p))}
                    className="min-h-[44px] px-3 rounded border border-[#E2E8F0] bg-white hover:bg-[#f8f9ff] font-label-caps text-xs"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                  {lc === 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={() => setLifecycle(p, 'DISCHARGED')}
                      className="min-h-[44px] px-3 rounded border border-[#0037b0]/30 bg-[#eff4ff] text-[#0037b0] font-label-caps text-xs"
                    >
                      Discharge
                    </button>
                  )}
                  {lc !== 'ARCHIVED' && (
                    <button
                      type="button"
                      onClick={() => setLifecycle(p, 'ARCHIVED')}
                      className="min-h-[44px] px-3 rounded border border-[#c4c5d7] bg-[#F8FAFC] text-[#475569] font-label-caps text-xs"
                    >
                      Archive
                    </button>
                  )}
                  {lc !== 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={() => setLifecycle(p, 'ACTIVE')}
                      className="min-h-[44px] px-3 rounded border border-[#047857]/30 bg-[#ECFDF5] text-[#047857] font-label-caps text-xs"
                    >
                      Reactivate
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(p.id)}
                    className="min-h-[44px] px-3 rounded border border-[#B91C1C]/30 bg-white text-[#B91C1C] font-label-caps text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Delete confirmation — destructive and irreversible, so it asks */}
              {confirmDeleteId === p.id && (
                <div className="px-4 py-3 bg-[#B91C1C]/5 border-t border-[#B91C1C]/20">
                  <p className="font-body-md text-sm text-[#0b1c30]">
                    Permanently delete <strong>{p.name}</strong> and all{' '}
                    {p.flowsheetHistory.length} recorded round
                    {p.flowsheetHistory.length === 1 ? '' : 's'}? This cannot be undone —
                    <strong> Archive</strong> keeps the record and its charges.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDeletePatient(p.id);
                        setConfirmDeleteId(null);
                      }}
                      className="min-h-[44px] px-4 rounded bg-[#B91C1C] text-white font-label-caps text-xs font-bold"
                    >
                      Delete permanently
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="min-h-[44px] px-4 rounded border border-[#E2E8F0] bg-white font-label-caps text-xs"
                    >
                      Keep
                    </button>
                  </div>
                </div>
              )}

              {/* Edit form */}
              {isEditing && (
                <div className="px-4 py-4 border-t border-[#E2E8F0] bg-[#f8f9ff] space-y-3">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(
                      [
                        ['name', 'Name', 'text'],
                        ['caseNumber', 'Case number', 'text'],
                        ['breed', 'Breed', 'text'],
                        ['weightKg', 'Weight (kg)', 'number'],
                        ['age', 'Age', 'text'],
                        ['location', 'Location', 'text'],
                        ['attendingClinician', 'Attending clinician', 'text'],
                      ] as const
                    ).map(([field, label, type]) => (
                      <label key={field} className="block">
                        <span className="font-label-caps text-xs text-[#434655] block mb-1">
                          {label}
                        </span>
                        <input
                          type={type}
                          value={(draft[field] as string | number | undefined) ?? ''}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              [field]:
                                type === 'number'
                                  ? e.target.value === ''
                                    ? undefined
                                    : Number(e.target.value)
                                  : e.target.value,
                            })
                          }
                          className="w-full min-h-[44px] px-3 bg-white border border-[#c4c5d7] rounded font-body-md text-sm focus:ring-2 focus:ring-[#0037b0] focus:outline-none"
                        />
                      </label>
                    ))}
                  </div>

                  <label className="block">
                    <span className="font-label-caps text-xs text-[#434655] block mb-1">
                      Primary diagnosis
                    </span>
                    <input
                      value={draft.diagnosis ?? ''}
                      onChange={(e) => setDraft({ ...draft, diagnosis: e.target.value })}
                      className="w-full min-h-[44px] px-3 bg-white border border-[#c4c5d7] rounded font-body-md text-sm focus:ring-2 focus:ring-[#0037b0] focus:outline-none"
                    />
                    {suggestBodySystems(draft.diagnosis).length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({ ...draft, bodySystems: suggestBodySystems(draft.diagnosis) })
                        }
                        className="mt-1 font-derived-value text-[11px] text-[#0037b0] underline"
                      >
                        Suggest systems from this wording:{' '}
                        {suggestBodySystems(draft.diagnosis)
                          .map((s) => BODY_SYSTEM_META[s].label)
                          .join(', ')}
                      </button>
                    )}
                  </label>

                  <div>
                    <span className="font-label-caps text-xs text-[#434655] block mb-1">
                      Body systems involved
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ALL_BODY_SYSTEMS.map((sys) => {
                        const on = ((draft.bodySystems ?? []) as BodySystem[]).includes(sys);
                        const meta = BODY_SYSTEM_META[sys];
                        return (
                          <button
                            key={sys}
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggleSystem(sys)}
                            className={`min-h-[44px] px-3 rounded-lg border inline-flex items-center gap-1.5 text-xs transition ${
                              on
                                ? 'text-white border-transparent font-bold'
                                : 'bg-white border-[#E2E8F0] text-[#0b1c30] hover:bg-white'
                            }`}
                            style={on ? { backgroundColor: meta.colour } : undefined}
                          >
                            <span className="material-symbols-outlined text-base">{meta.icon}</span>
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 font-body-md text-sm text-[#0b1c30]">
                    <input
                      type="checkbox"
                      checked={!!draft.isTest}
                      onChange={(e) => setDraft({ ...draft, isTest: e.target.checked })}
                      className="w-4 h-4"
                    />
                    This is a test record
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(p)}
                      className="min-h-[44px] px-4 rounded bg-[#0037b0] text-white font-label-caps text-xs font-bold"
                    >
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setDraft({});
                      }}
                      className="min-h-[44px] px-4 rounded border border-[#E2E8F0] bg-white font-label-caps text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="font-derived-value text-[11px] text-[#747686]">
        Discharged and archived records keep every charted round, so they remain available for
        billing. Only Delete removes data, and it asks first.
      </p>
    </div>
  );
};
