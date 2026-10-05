import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import {
  FiAlertCircle,
  FiActivity,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiEdit2,
  FiHeart,
  FiLock,
  FiPlus,
  FiSearch,
  FiShield,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';

type Role = 'patient' | 'specialist' | 'admin';
type Page = 'appointments' | 'availability' | 'profile' | 'agenda' | 'specialties' | 'specialists';
type AppointmentStatus = 'Confirmada' | 'Pendiente' | 'Cancelada';
type SlotStatus = 'Disponible' | 'Reservado' | 'Bloqueado';

interface Specialty {
  id: string;
  name: string;
  description: string;
  duration: number;
  doctor: string;
  room: string;
}

interface Appointment {
  id: string;
  specialtyId: string;
  specialty: string;
  specialist: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  slotId: string;
}

interface ScheduleSlot {
  id: string;
  specialtyId: string;
  date: string;
  time: string;
  status: SlotStatus;
  appointmentId?: string;
}

interface Profile {
  name: string;
  email: string;
  phone: string;
}

interface SpecialistRecord {
  id: string;
  name: string;
  email: string;
  specialty: string;
  document: string;
  status: 'Activo' | 'Invitación enviada';
}

interface DemoStore {
  profile: Profile;
  appointments: Appointment[];
  slots: ScheduleSlot[];
  specialties: Specialty[];
  specialists: SpecialistRecord[];
}

const STORAGE_KEY = 'vitalis-sprint2-demo-v1';
const specialtySeed: Specialty[] = [
  {
    id: 'cardiology',
    name: 'Cardiología',
    description: 'Prevención, diagnóstico y tratamiento de enfermedades del corazón.',
    duration: 30,
    doctor: 'Dr. Carlos Ramírez',
    room: 'Consultorio 204',
  },
  {
    id: 'dermatology',
    name: 'Dermatología',
    description: 'Cuidado y tratamiento de la piel, el cabello y las uñas.',
    duration: 45,
    doctor: 'Dra. Laura Gómez',
    room: 'Consultorio 108',
  },
  {
    id: 'pediatrics',
    name: 'Pediatría',
    description: 'Atención integral para la salud y el desarrollo de niños y niñas.',
    duration: 30,
    doctor: 'Dr. Andrés Ruiz',
    room: 'Consultorio 105',
  },
  {
    id: 'dentistry',
    name: 'Odontología',
    description: 'Valoración y cuidado de la salud oral.',
    duration: 30,
    doctor: 'Dra. Paula Ríos',
    room: 'Consultorio 302',
  },
];

function dateAt(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }) {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-CO', options).format(new Date(year, month - 1, day, 12));
}

function formatShortDate(value: string) {
  return formatDate(value, { weekday: 'short', day: '2-digit', month: 'short' }).replace('.', '');
}

function createSeedSlots(): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  const times = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  specialtySeed.forEach((specialty) => {
    for (let day = 1; day <= 14; day += 1) {
      times.forEach((time, index) => {
        const id = `${specialty.id}-${day}-${index}`;
        let status: SlotStatus = 'Disponible';
        let appointmentId: string | undefined;
        if (day === 2 && time === '09:00' && specialty.id === 'cardiology') {
          status = 'Reservado';
          appointmentId = 'appointment-1';
        } else if (day === 4 && time === '11:00' && specialty.id === 'dermatology') {
          status = 'Reservado';
          appointmentId = 'appointment-2';
        } else if (day === 6 && time === '14:00' && specialty.id === 'pediatrics') {
          status = 'Reservado';
          appointmentId = 'appointment-3';
        } else if (day === 3 && time === '11:00' && specialty.id === 'cardiology') {
          status = 'Bloqueado';
        }
        slots.push({ id, specialtyId: specialty.id, date: dateAt(day), time, status, appointmentId });
      });
    }
  });
  return slots;
}

function seedAppointments(): Appointment[] {
  return [
    {
      id: 'appointment-1', specialtyId: 'cardiology', specialty: 'Cardiología', specialist: 'Dr. Carlos Ramírez',
      date: dateAt(2), time: '09:00', duration: 30, status: 'Confirmada', slotId: 'cardiology-2-1',
    },
    {
      id: 'appointment-2', specialtyId: 'dermatology', specialty: 'Dermatología', specialist: 'Dra. Laura Gómez',
      date: dateAt(4), time: '11:00', duration: 45, status: 'Confirmada', slotId: 'dermatology-4-3',
    },
    {
      id: 'appointment-3', specialtyId: 'pediatrics', specialty: 'Pediatría', specialist: 'Dr. Andrés Ruiz',
      date: dateAt(6), time: '14:00', duration: 30, status: 'Pendiente', slotId: 'pediatrics-6-4',
    },
  ];
}

function defaultStore(): DemoStore {
  return {
    profile: { name: 'Ana María Pérez', email: 'ana.perez@correo.com', phone: '+57 300 123 4567' } as Profile,
    appointments: seedAppointments(),
    slots: createSeedSlots(),
    specialties: specialtySeed,
    specialists: [
      { id: 'specialist-1', name: 'Dr. Carlos Ramírez', email: 'carlos.ramirez@vitalis.co', specialty: 'Cardiología', document: 'CC 1234567890', status: 'Activo' as const },
      { id: 'specialist-2', name: 'Dra. Laura Gómez', email: 'laura.gomez@vitalis.co', specialty: 'Dermatología', document: 'CC 1020304050', status: 'Activo' as const },
    ],
  };
}

function loadStore(): DemoStore {
  const fallback = defaultStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw) as Partial<DemoStore>;
    return {
      profile: { ...fallback.profile, ...saved.profile },
      appointments: Array.isArray(saved.appointments) ? saved.appointments : fallback.appointments,
      slots: Array.isArray(saved.slots) ? saved.slots : fallback.slots,
      specialties: Array.isArray(saved.specialties) ? saved.specialties : fallback.specialties,
      specialists: Array.isArray(saved.specialists) ? saved.specialists : fallback.specialists,
    };
  } catch {
    return fallback;
  }
}

const pageLabels: Record<Page, string> = {
  appointments: 'Mis citas', availability: 'Disponibilidad', profile: 'Mi perfil',
  agenda: 'Mi agenda', specialties: 'Mis especialidades', specialists: 'Especialistas',
};

function Logo() {
  return (
    <div className="brand" aria-label="Vitalis, plataforma de reservas">
      <img className="brand-logo" src="/assets/vitalis-logo.png" alt="Vitalis · Clínica Privada" />
    </div>
  );
}

function StatusPill({ status }: { status: AppointmentStatus | SlotStatus | SpecialistRecord['status'] }) {
  const className = status === 'Confirmada' || status === 'Disponible' || status === 'Activo'
    ? 'status-pill status-positive'
    : status === 'Pendiente' || status === 'Invitación enviada'
      ? 'status-pill status-pending'
      : status === 'Bloqueado' || status === 'Cancelada'
        ? 'status-pill status-muted'
        : 'status-pill status-muted';
  return <span className={className}><span className="status-dot" />{status}</span>;
}

function App() {
  const [store, setStore] = useState(loadStore);
  const [role, setRole] = useState<Role>('patient');
  const [page, setPage] = useState<Page>('appointments');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('appointment-1');
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [modal, setModal] = useState<{ type: 'cancel' | 'reschedule'; appointment: Appointment } | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const rolePages: Record<Role, Page[]> = {
    patient: ['appointments', 'availability', 'profile'],
    specialist: ['agenda', 'specialties'],
    admin: ['specialists'],
  };

  function changeRole(nextRole: Role) {
    setRole(nextRole);
    setPage(rolePages[nextRole][0]);
    setNotice(null);
  }

  function updateProfile(profile: Profile) {
    setStore((current) => ({ ...current, profile }));
    setNotice({ kind: 'success', message: 'Guardamos los cambios de tu perfil.' });
  }

  function registerSpecialist(record: Omit<SpecialistRecord, 'id' | 'status'>) {
    if (store.specialists.some((item) => item.email.trim().toLowerCase() === record.email.trim().toLowerCase())) {
      return { ok: false, message: 'Ya existe un especialista con ese correo electrónico.' };
    }
    setStore((current) => ({
      ...current,
      specialists: [...current.specialists, { ...record, id: `specialist-${Date.now()}`, status: 'Invitación enviada' }],
    }));
    setNotice({ kind: 'success', message: 'Registramos al especialista. Ya puede activar su cuenta e iniciar sesión.' });
    return { ok: true, message: '' };
  }

  function saveSpecialty(updated: Specialty) {
    setStore((current) => ({
      ...current,
      specialties: current.specialties.map((item) => item.id === updated.id ? updated : item),
    }));
    setNotice({ kind: 'success', message: 'Actualizamos la información de la especialidad.' });
  }

  function setSlotStatus(slotId: string, nextStatus: SlotStatus) {
    const slot = store.slots.find((item) => item.id === slotId);
    if (!slot) return;
    if (slot.status === 'Reservado') {
      setNotice({ kind: 'error', message: 'Ese horario tiene una cita reservada. No se puede bloquear.' });
      return;
    }
    setStore((current) => ({
      ...current,
      slots: current.slots.map((item) => item.id === slotId ? { ...item, status: nextStatus } : item),
    }));
    setNotice({ kind: 'success', message: nextStatus === 'Bloqueado' ? 'Bloqueamos el horario; ya no aparece disponible para reservar.' : 'Liberamos el horario y vuelve a estar disponible.' });
  }

  function cancelAppointment(appointment: Appointment) {
    setStore((current) => ({
      ...current,
      appointments: current.appointments.map((item) => item.id === appointment.id ? { ...item, status: 'Cancelada' } : item),
      slots: current.slots.map((slot) => slot.id === appointment.slotId ? { ...slot, status: 'Disponible', appointmentId: undefined } : slot),
    }));
    setSelectedAppointmentId(appointment.id);
    setModal(null);
    setNotice({ kind: 'success', message: 'Cancelamos la cita y liberamos el horario para otros pacientes.' });
  }

  function rescheduleAppointment(appointment: Appointment, newSlotId: string) {
    const newSlot = store.slots.find((slot) => slot.id === newSlotId);
    if (!newSlot || newSlot.status !== 'Disponible') {
      setNotice({ kind: 'error', message: 'Ese horario acaba de dejar de estar disponible. Elige otro para conservar tu cita.' });
      return false;
    }
    const specialty = store.specialties.find((item) => item.id === appointment.specialtyId);
    setStore((current) => ({
      ...current,
      appointments: current.appointments.map((item) => item.id === appointment.id
        ? { ...item, date: newSlot.date, time: newSlot.time, slotId: newSlot.id, duration: specialty?.duration ?? item.duration }
        : item),
      slots: current.slots.map((slot) => {
        if (slot.id === appointment.slotId) return { ...slot, status: 'Disponible', appointmentId: undefined };
        if (slot.id === newSlot.id) return { ...slot, status: 'Reservado', appointmentId: appointment.id };
        return slot;
      }),
    }));
    setSelectedAppointmentId(appointment.id);
    setModal(null);
    setNotice({ kind: 'success', message: 'Reprogramamos tu cita y liberamos el horario anterior.' });
    return true;
  }

  const selectedAppointment = store.appointments.find((appointment) => appointment.id === selectedAppointmentId)
    ?? store.appointments[0];

  function renderPage() {
    if (page === 'profile') return <ProfilePage profile={store.profile} onSave={updateProfile} />;
    if (page === 'availability') return <AvailabilityPage slots={store.slots} specialties={store.specialties} />;
    if (page === 'agenda') return <AgendaPage slots={store.slots} specialties={store.specialties} onChangeStatus={setSlotStatus} />;
    if (page === 'specialties') return <SpecialtiesPage specialties={store.specialties} appointments={store.appointments} onSave={saveSpecialty} />;
    if (page === 'specialists') return <SpecialistsPage specialists={store.specialists} onRegister={registerSpecialist} />;
    return (
      <AppointmentsPage
        appointments={store.appointments}
        selectedAppointment={selectedAppointment}
        onSelect={setSelectedAppointmentId}
        onCancel={(appointment) => setModal({ type: 'cancel', appointment })}
        onReschedule={(appointment) => setModal({ type: 'reschedule', appointment })}
        onGoToAvailability={() => setPage('availability')}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Logo />
        <nav className="main-nav" aria-label="Secciones principales">
          {rolePages[role].map((item) => (
            <button key={item} className={`nav-link ${page === item ? 'nav-link-active' : ''}`} onClick={() => setPage(item)}>
              {pageLabels[item]}
            </button>
          ))}
        </nav>
        <div className="topbar-actions">
          <label className="demo-role-select">
            <FiShield aria-hidden="true" />
            <span className="sr-only">Perfil de demostración</span>
            <select aria-label="Cambiar perfil de demostración" value={role} onChange={(event) => changeRole(event.target.value as Role)}>
              <option value="patient">Paciente</option>
              <option value="specialist">Especialista</option>
              <option value="admin">Administrador</option>
            </select>
            <FiChevronDown aria-hidden="true" />
          </label>
          <div className="user-chip" aria-label={role === 'patient' ? store.profile.name : role === 'specialist' ? 'Dr. Carlos Ramírez' : 'Administrador'}>
            <span className="avatar">{role === 'patient' ? store.profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('') : role === 'specialist' ? 'CR' : 'AD'}</span>
            <span className="user-chip-name">{role === 'patient' ? store.profile.name.split(' ')[0] : role === 'specialist' ? 'Carlos' : 'Admin'}</span>
          </div>
        </div>
      </header>

      <main className="page-shell">
        <div className="page-context">
          <div className="breadcrumb"><span>Vitalis</span><span className="breadcrumb-separator">/</span>{role === 'patient' ? 'Espacio del paciente' : role === 'specialist' ? 'Espacio del especialista' : 'Administración'}</div>
          {role !== 'patient' && <span className="role-note"><FiShield aria-hidden="true" /> Vista de demostración</span>}
        </div>
        {notice && (
          <div className={`toast toast-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
            {notice.kind === 'success' ? <FiCheckCircle aria-hidden="true" /> : <FiAlertCircle aria-hidden="true" />}
            <span>{notice.message}</span>
            <button className="icon-button toast-close" aria-label="Cerrar mensaje" onClick={() => setNotice(null)}><FiX /></button>
          </div>
        )}
        {renderPage()}
        <footer className="app-footer"><span>© {new Date().getFullYear()} Vitalis</span><span>Atención clara, en el momento adecuado.</span></footer>
      </main>

      {modal?.type === 'cancel' && <CancelDialog appointment={modal.appointment} onClose={() => setModal(null)} onConfirm={() => cancelAppointment(modal.appointment)} />}
      {modal?.type === 'reschedule' && (
        <RescheduleDialog
          appointment={modal.appointment}
          slots={store.slots}
          onClose={() => setModal(null)}
          onConfirm={(slotId) => rescheduleAppointment(modal.appointment, slotId)}
        />
      )}
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}

function AppointmentsPage({
  appointments, selectedAppointment, onSelect, onCancel, onReschedule, onGoToAvailability,
}: {
  appointments: Appointment[];
  selectedAppointment: Appointment;
  onSelect: (id: string) => void;
  onCancel: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
  onGoToAvailability: () => void;
}) {
  const activeAppointments = [...appointments].filter((item) => item.status !== 'Cancelada').sort((a, b) => a.date.localeCompare(b.date));
  const cancelledCount = appointments.filter((item) => item.status === 'Cancelada').length;
  const isSelectedActive = selectedAppointment?.status !== 'Cancelada';

  return (
    <>
      <PageHeader eyebrow="TU ATENCIÓN, ORGANIZADA" title="Mis citas" description="Consulta y gestiona tus próximas citas médicas." action={
        <button className="button button-primary" onClick={onGoToAvailability}><FiPlus /> Consultar disponibilidad</button>
      } />
      {activeAppointments.length === 0 ? (
        <section className="empty-state panel">
          <div className="empty-icon"><FiCalendar /></div>
          <h2>No tienes citas programadas</h2>
          <p>Cuando reserves una consulta, encontrarás aquí la fecha, el especialista y su estado.</p>
          <button className="button button-primary" onClick={onGoToAvailability}>Consultar disponibilidad <FiArrowRight /></button>
        </section>
      ) : (
        <div className="appointments-layout">
          <section className="appointments-list panel" aria-label="Citas programadas">
            <div className="panel-heading">
              <div><h2>Próximas citas</h2><p>{activeAppointments.length} citas programadas</p></div>
              <span className="soft-badge"><FiCalendar /> {activeAppointments.length}</span>
            </div>
            <div className="appointment-items">
              {activeAppointments.map((appointment) => (
                <button
                  key={appointment.id}
                  className={`appointment-item ${selectedAppointment.id === appointment.id ? 'appointment-item-selected' : ''}`}
                  onClick={() => onSelect(appointment.id)}
                  aria-pressed={selectedAppointment.id === appointment.id}
                >
                  <span className="appointment-date-block">
                    <span>{new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(new Date(`${appointment.date}T12:00:00`)).replace('.', '')}</span>
                    <strong>{appointment.date.slice(-2)}</strong>
                  </span>
                  <span className="appointment-summary">
                    <strong>{appointment.specialty}</strong>
                    <span>{appointment.specialist}</span>
                    <span className="appointment-time"><FiClock /> {formatShortDate(appointment.date)} · {appointment.time}</span>
                  </span>
                  <StatusPill status={appointment.status} />
                </button>
              ))}
            </div>
            {cancelledCount > 0 && <div className="list-footnote"><FiCheck /> {cancelledCount} cita{cancelledCount > 1 ? 's' : ''} cancelada{cancelledCount > 1 ? 's' : ''} en esta demostración</div>}
          </section>
          <aside className="appointment-detail panel">
            {selectedAppointment ? (
              <>
                <div className="detail-heading"><div><span className="eyebrow">DETALLE DE LA CITA</span><h2>{selectedAppointment.specialty}</h2></div><StatusPill status={selectedAppointment.status} /></div>
      <div className="detail-doctor"><span className="doctor-avatar"><FiActivity /></span><span><strong>{selectedAppointment.specialist}</strong><small>Especialista</small></span></div>
                <dl className="detail-list">
                  <div><dt><FiCalendar /> Fecha</dt><dd>{formatDate(selectedAppointment.date)}</dd></div>
                  <div><dt><FiClock /> Hora</dt><dd>{selectedAppointment.time} · {selectedAppointment.duration} minutos</dd></div>
                  <div><dt><FiUser /> Modalidad</dt><dd>Atención presencial</dd></div>
                </dl>
                {isSelectedActive ? (
                  <div className="detail-actions">
                    <button className="button button-secondary" onClick={() => onReschedule(selectedAppointment)}><FiCalendar /> Reprogramar</button>
                    <button className="button button-danger-outline" onClick={() => onCancel(selectedAppointment)}>Cancelar cita</button>
                  </div>
                ) : <div className="inline-note"><FiCheckCircle /> Esta cita fue cancelada. El horario quedó disponible.</div>}
              </>
            ) : (
              <div className="empty-detail"><FiCalendar /><h2>Selecciona una cita</h2><p>Elige una cita de la lista para ver sus detalles.</p></div>
            )}
          </aside>
        </div>
      )}
      <div className="helper-banner"><div className="helper-icon"><FiHeart /></div><div><strong>¿Necesitas cambiar tu cita?</strong><span>Puedes elegir otro horario disponible desde el detalle de la cita.</span></div><button className="text-button" onClick={onGoToAvailability}>Ver disponibilidad <FiArrowRight /></button></div>
    </>
  );
}

function ProfilePage({ profile, onSave }: { profile: Profile; onSave: (profile: Profile) => void }) {
  const [form, setForm] = useState(profile);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});
  useEffect(() => setForm(profile), [profile]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof Profile, string>> = {};
    if (!form.name.trim()) nextErrors.name = 'Ingresa tu nombre completo.';
    if (!form.email.trim()) nextErrors.email = 'Ingresa tu correo electrónico.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Revisa el formato del correo electrónico.';
    if (!form.phone.trim()) nextErrors.phone = 'Ingresa un teléfono de contacto.';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setErrors({});
    onSave({ ...form, name: form.name.trim(), email: form.email.trim() });
  }

  return (
    <>
      <PageHeader eyebrow="TUS DATOS" title="Mi perfil" description="Consulta y actualiza tus datos personales." />
      <div className="profile-layout">
        <section className="profile-card panel">
          <div className="profile-card-top"><div className="profile-avatar">{form.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div><h2>Información personal</h2><p>Estos datos nos ayudan a identificarte y contactarte.</p></div></div>
          <form onSubmit={submit} noValidate>
            <div className="form-grid">
              <TextField label="Nombre completo" value={form.name} placeholder="Ej. Ana María Pérez" error={errors.name} autoComplete="name" onChange={(value) => setForm({ ...form, name: value })} />
              <TextField label="Correo electrónico" value={form.email} placeholder="nombre@correo.com" error={errors.email} type="email" autoComplete="email" onChange={(value) => setForm({ ...form, email: value })} />
              <TextField label="Teléfono" value={form.phone} placeholder="+57 300 123 4567" error={errors.phone} type="tel" autoComplete="tel" onChange={(value) => setForm({ ...form, phone: value })} />
            </div>
            <div className="form-actions"><span className="form-hint"><FiLock /> Solo tú puedes consultar y modificar tu información.</span><button className="button button-primary" type="submit"><FiCheck /> Guardar cambios</button></div>
          </form>
        </section>
        <aside className="profile-aside">
          <div className="aside-kicker"><FiShield /> PRIVACIDAD</div>
          <h2>Tus datos, bajo tu control.</h2>
          <p>La información de tu perfil se presenta únicamente en esta sesión de demostración.</p>
          <div className="privacy-row"><FiCheckCircle /><span>Campos validados antes de guardar</span></div>
          <div className="privacy-row"><FiCheckCircle /><span>Confirmación al actualizar</span></div>
        </aside>
      </div>
    </>
  );
}

function AvailabilityPage({ slots, specialties }: { slots: ScheduleSlot[]; specialties: Specialty[] }) {
  const [specialtyId, setSpecialtyId] = useState(specialties[0]?.id ?? '');
  const [date, setDate] = useState(dateAt(1));
  const [appliedFilter, setAppliedFilter] = useState({ specialtyId: specialties[0]?.id ?? '', date: dateAt(1) });
  const [selectedSlot, setSelectedSlot] = useState('');
  const specialty = specialties.find((item) => item.id === appliedFilter.specialtyId);
  const available = slots.filter((slot) => slot.specialtyId === appliedFilter.specialtyId && slot.date === appliedFilter.date && slot.status === 'Disponible').sort((a, b) => a.time.localeCompare(b.time));
  const selected = available.find((slot) => slot.id === selectedSlot);
  const visibleSlots = available.length > 0 ? available : [];

  function searchAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilter({ specialtyId, date });
    setSelectedSlot('');
  }

  return (
    <>
      <PageHeader eyebrow="ENCUENTRA TU HORARIO" title="Disponibilidad del especialista" description="Filtra por especialidad y fecha. Solo mostramos horarios libres para reservar." />
      <section className="availability-panel panel">
        <form className="availability-filters" onSubmit={searchAvailability}>
          <label className="field"><span>Especialidad</span><select value={specialtyId} onChange={(event) => setSpecialtyId(event.target.value)}>{specialties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="field"><span>Fecha</span><input type="date" value={date} min={dateAt(0)} onChange={(event) => setDate(event.target.value)} /></label>
          <button className="button button-primary filter-button" type="submit"><FiSearch /> Consultar horarios</button>
        </form>
        {specialty && <div className="availability-doctor"><span className="doctor-avatar"><FiActivity /></span><div><strong>{specialty.doctor}</strong><span>{specialty.name} · {specialty.duration} min · {specialty.room}</span></div><StatusPill status="Disponible" /></div>}
        <div className="availability-results">
          <div className="results-heading"><div><h2>Horarios disponibles</h2><p>{formatDate(appliedFilter.date)}{specialty ? ` · ${specialty.name}` : ''}</p></div><span className="results-count">{visibleSlots.length} horarios</span></div>
          {visibleSlots.length ? (
            <div className="time-grid">
              {visibleSlots.map((slot) => <button key={slot.id} className={`time-option ${selectedSlot === slot.id ? 'time-option-selected' : ''}`} onClick={() => setSelectedSlot(slot.id)} aria-pressed={selectedSlot === slot.id}><FiClock /> {slot.time}{selectedSlot === slot.id && <FiCheck />}</button>)}
            </div>
          ) : (
            <div className="empty-inline"><FiCalendar /><div><strong>No hay horarios disponibles para esta fecha</strong><span>Prueba con otro día o consulta una especialidad diferente.</span></div></div>
          )}
        </div>
        {selected && <div className="selected-slot-note"><FiCheckCircle /><span>Seleccionaste las {selected.time} con {specialty?.doctor}. Este horario está libre y se mantiene disponible en la agenda.</span></div>}
      </section>
      <div className="helper-banner"><div className="helper-icon"><FiCalendar /></div><div><strong>La disponibilidad se actualiza al consultar.</strong><span>Los horarios reservados o bloqueados no aparecen en los resultados.</span></div></div>
    </>
  );
}

function AgendaPage({ slots, specialties, onChangeStatus }: { slots: ScheduleSlot[]; specialties: Specialty[]; onChangeStatus: (slotId: string, status: SlotStatus) => void }) {
  const [specialtyId, setSpecialtyId] = useState(specialties[0]?.id ?? '');
  const [dateFilter, setDateFilter] = useState('all');
  const specialty = specialties.find((item) => item.id === specialtyId);
  const sortedSlots = slots.filter((slot) => slot.specialtyId === specialtyId && (dateFilter === 'all' || slot.date === dateFilter)).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const dates = [...new Set(slots.filter((slot) => slot.specialtyId === specialtyId).map((slot) => slot.date))];

  return (
    <>
      <PageHeader eyebrow="AGENDA DEL ESPECIALISTA" title="Gestionar agenda" description="Bloquea los horarios que no puedes atender y libéralos cuando vuelvan a estar disponibles." />
      <section className="agenda-panel panel">
        <div className="agenda-toolbar">
          <label className="field"><span>Especialidad</span><select value={specialtyId} onChange={(event) => { setSpecialtyId(event.target.value); setDateFilter('all'); }}>{specialties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="field"><span>Fecha</span><select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}><option value="all">Todas las fechas</option>{dates.slice(0, 14).map((value) => <option key={value} value={value}>{formatDate(value)}</option>)}</select></label>
          {specialty && <div className="agenda-owner"><span className="avatar avatar-small">{specialty.doctor.split(' ').filter(Boolean).slice(1, 3).map((part) => part[0]).join('')}</span><span><strong>{specialty.doctor}</strong><small>Tu agenda</small></span></div>}
        </div>
        <div className="agenda-legend"><span><i className="legend-dot legend-available" />Disponible</span><span><i className="legend-dot legend-booked" />Reservado</span><span><i className="legend-dot legend-blocked" />Bloqueado</span></div>
        <div className="table-scroll"><table className="data-table agenda-table"><thead><tr><th>Fecha</th><th>Horario</th><th>Estado</th><th><span className="sr-only">Acción</span></th></tr></thead><tbody>
          {sortedSlots.slice(0, 24).map((slot) => (
            <tr key={slot.id}>
              <td><strong>{formatDate(slot.date, { weekday: 'long', day: 'numeric', month: 'short' })}</strong></td>
              <td>{slot.time} <span className="table-meta">· {specialty?.duration ?? 30} min</span></td>
              <td><StatusPill status={slot.status} /></td>
              <td className="table-action-cell">
                {slot.status === 'Reservado' ? <span className="table-protected"><FiLock /> Tiene una cita</span> : (
                  <button className={`button button-small ${slot.status === 'Bloqueado' ? 'button-secondary' : 'button-outline'}`} onClick={() => onChangeStatus(slot.id, slot.status === 'Bloqueado' ? 'Disponible' : 'Bloqueado')}>
                    {slot.status === 'Bloqueado' ? 'Desbloquear' : 'Bloquear horario'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody></table></div>
        {sortedSlots.length === 0 && <div className="empty-inline"><FiCalendar /><div><strong>No hay horarios registrados</strong><span>Elige otra especialidad o fecha para consultar tu agenda.</span></div></div>}
        <div className="table-footnote">Los horarios reservados no se pueden bloquear. Al desbloquear un horario, vuelve a estar disponible para los pacientes.</div>
      </section>
    </>
  );
}

function SpecialtiesPage({ specialties, appointments, onSave }: { specialties: Specialty[]; appointments: Appointment[]; onSave: (specialty: Specialty) => void }) {
  const [editingId, setEditingId] = useState(specialties[0]?.id ?? '');
  const [form, setForm] = useState<Specialty>(specialties[0] ?? specialtySeed[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [impact, setImpact] = useState(false);
  const [saved, setSaved] = useState(false);
  const editingAppointments = appointments.filter((appointment) => appointment.specialtyId === editingId && appointment.status !== 'Cancelada');

  useEffect(() => {
    const next = specialties.find((item) => item.id === editingId) ?? specialties[0] ?? specialtySeed[0];
    setForm(next);
    setErrors({});
    setImpact(false);
  }, [editingId, specialties]);

  if (!form) return <div className="empty-state panel"><h2>No hay especialidades para editar.</h2></div>;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Ingresa el nombre de la especialidad.';
    if (!form.description.trim()) next.description = 'Completa la descripción.';
    if (!Number.isFinite(form.duration) || form.duration < 10 || form.duration > 240) next.duration = 'Usa una duración entre 10 y 240 minutos.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const durationChanged = form.duration !== specialties.find((item) => item.id === editingId)?.duration;
    if (durationChanged && editingAppointments.length && !impact) {
      setImpact(true);
      return;
    }
    onSave({ ...form, name: form.name.trim(), description: form.description.trim() });
    setSaved(true);
    setImpact(false);
    window.setTimeout(() => setSaved(false), 3500);
  }

  return (
    <>
      <PageHeader eyebrow="TUS SERVICIOS" title="Mis especialidades" description="Mantén actualizada la información de las consultas que ofreces." />
      <div className="specialty-layout">
        <aside className="specialty-list panel">
          <div className="panel-heading"><div><h2>Especialidades registradas</h2><p>Selecciona una para editar</p></div><span className="soft-badge">{specialties.length}</span></div>
          <div className="specialty-options">
            {specialties.map((item) => <button key={item.id} className={`specialty-option ${item.id === editingId ? 'specialty-option-active' : ''}`} onClick={() => setEditingId(item.id)}><span className="specialty-icon"><FiActivity /></span><span><strong>{item.name}</strong><small>{item.duration} minutos · {item.room}</small></span><FiArrowRight /></button>)}
          </div>
        </aside>
        <section className="specialty-editor panel">
          <div className="editor-heading"><div><span className="eyebrow">EDITAR SERVICIO</span><h2>{form.name}</h2><p>Los cambios se reflejarán en la información de disponibilidad.</p></div><span className="soft-badge"><FiEdit2 /> Edición</span></div>
          <form onSubmit={save} noValidate>
            <div className="form-grid">
              <TextField label="Nombre de la especialidad" value={form.name} placeholder="Ej. Cardiología" error={errors.name} onChange={(value) => setForm({ ...form, name: value })} />
              <TextField label="Descripción" value={form.description} placeholder="Describe brevemente el servicio" error={errors.description} multiline onChange={(value) => setForm({ ...form, description: value })} />
              <TextField label="Duración de la consulta (minutos)" value={String(form.duration)} placeholder="30" error={errors.duration} type="number" onChange={(value) => setForm({ ...form, duration: Number(value) })} />
            </div>
            {impact && <div className="impact-callout"><FiAlertCircle /><div><strong>Hay {editingAppointments.length} cita{editingAppointments.length > 1 ? 's' : ''} programada{editingAppointments.length > 1 ? 's' : ''} con esta especialidad.</strong><span>Al guardar, las citas confirmadas conservarán la duración que tenían al reservarse. ¿Quieres aplicar la nueva duración a futuras citas?</span></div><button type="button" className="button button-small button-secondary" onClick={() => setImpact(false)}>Seguir editando</button></div>}
            <div className="form-actions"><span className="form-hint"><FiLock /> Solo puedes editar tus especialidades.</span><button className="button button-primary" type="submit"><FiCheck /> {impact ? 'Guardar para nuevas citas' : 'Guardar cambios'}</button></div>
            {saved && <div className="form-success"><FiCheckCircle /> Cambios guardados. Las citas existentes mantienen sus datos.</div>}
          </form>
        </section>
      </div>
    </>
  );
}

function SpecialistsPage({ specialists, onRegister }: { specialists: SpecialistRecord[]; onRegister: (record: Omit<SpecialistRecord, 'id' | 'status'>) => { ok: boolean; message: string } }) {
  const [form, setForm] = useState({ name: '', email: '', specialty: specialtySeed[0].name, document: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicate, setDuplicate] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Ingresa el nombre completo.';
    if (!form.email.trim()) next.email = 'Ingresa el correo electrónico.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Revisa el formato del correo electrónico.';
    if (!form.specialty) next.specialty = 'Selecciona una especialidad.';
    if (!form.document.trim()) next.document = 'Ingresa el documento de identidad.';
    setErrors(next);
    setDuplicate('');
    setSubmitted(false);
    if (Object.keys(next).length) return;
    const result = onRegister({ ...form, name: form.name.trim(), email: form.email.trim().toLowerCase(), document: form.document.trim() });
    if (!result.ok) { setDuplicate(result.message); return; }
    setForm({ name: '', email: '', specialty: specialtySeed[0].name, document: '' });
    setSubmitted(true);
  }

  return (
    <>
      <PageHeader eyebrow="ADMINISTRACIÓN" title="Registrar especialista" description="Crea el acceso de un profesional para habilitarlo en la plataforma." />
      <div className="admin-layout">
        <section className="admin-form panel">
          <div className="panel-heading"><div><h2>Datos del especialista</h2><p>Completa los campos para enviar la invitación de acceso.</p></div><span className="soft-badge"><FiUsers /> Nuevo registro</span></div>
          {duplicate && <div className="form-error-banner" role="alert"><FiAlertCircle /> {duplicate}</div>}
          {submitted && <div className="form-success"><FiCheckCircle /> Registro creado correctamente.</div>}
          <form onSubmit={submit} noValidate>
            <div className="form-grid">
              <TextField label="Nombre completo" value={form.name} placeholder="Ej. Dr. Carlos Ramírez" error={errors.name} autoComplete="name" onChange={(value) => setForm({ ...form, name: value })} />
              <TextField label="Correo electrónico" value={form.email} placeholder="especialista@clinica.com" error={errors.email} type="email" autoComplete="email" onChange={(value) => setForm({ ...form, email: value })} />
              <label className="field"><span>Especialidad principal</span><select value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })}>{specialtySeed.map((item) => <option key={item.id}>{item.name}</option>)}</select>{errors.specialty && <small className="field-error">{errors.specialty}</small>}</label>
              <TextField label="Documento de identidad" value={form.document} placeholder="CC 1234567890" error={errors.document} onChange={(value) => setForm({ ...form, document: value })} />
            </div>
            <div className="admin-form-footer"><span className="form-hint"><FiShield /> Asignaremos el rol de especialista y enviaremos una invitación.</span><button className="button button-primary" type="submit"><FiPlus /> Registrar especialista</button></div>
          </form>
        </section>
        <section className="specialists-table panel">
          <div className="panel-heading"><div><h2>Especialistas registrados</h2><p>{specialists.length} profesionales en Vitalis</p></div><span className="soft-badge"><FiUsers /> {specialists.length}</span></div>
          <div className="table-scroll"><table className="data-table"><thead><tr><th>Especialista</th><th>Especialidad</th><th>Estado</th></tr></thead><tbody>
            {specialists.map((specialist) => <tr key={specialist.id}><td><div className="table-person"><span className="avatar avatar-small">{specialist.name.split(' ').filter(Boolean).slice(1, 3).map((part) => part[0]).join('')}</span><span><strong>{specialist.name}</strong><small>{specialist.email}</small></span></div></td><td>{specialist.specialty}</td><td><StatusPill status={specialist.status} /></td></tr>)}
          </tbody></table></div>
        </section>
      </div>
    </>
  );
}

function CancelDialog({ appointment, onClose, onConfirm }: { appointment: Appointment; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
        <button className="icon-button dialog-close" onClick={onClose} aria-label="Cerrar"><FiX /></button>
        <span className="dialog-icon dialog-icon-danger"><FiAlertCircle /></span>
        <span className="eyebrow">GESTIÓN DE CITA</span>
        <h2 id="cancel-title">¿Cancelar esta cita?</h2>
        <p>La cancelación no se puede deshacer. Avisaremos al especialista y liberaremos el horario para otros pacientes.</p>
        <div className="dialog-appointment"><strong>{appointment.specialty} · {appointment.specialist}</strong><span>{formatDate(appointment.date)} · {appointment.time}</span></div>
        <div className="dialog-actions"><button className="button button-secondary" onClick={onClose}>Mantener cita</button><button className="button button-danger" onClick={onConfirm}>Sí, cancelar cita</button></div>
      </section>
    </div>
  );
}

function RescheduleDialog({ appointment, slots, onClose, onConfirm }: { appointment: Appointment; slots: ScheduleSlot[]; onClose: () => void; onConfirm: (slotId: string) => boolean }) {
  const options = slots.filter((slot) => slot.specialtyId === appointment.specialtyId && slot.status === 'Disponible' && slot.date >= dateAt(0)).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const [selected, setSelected] = useState(options[0]?.id ?? '');
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const shown = options.filter((slot) => dateFilter === 'all' || slot.date === dateFilter);
  const availableDates = [...new Set(options.map((slot) => slot.date))];

  function confirm() {
    if (!selected || !shown.some((slot) => slot.id === selected)) { setError('Selecciona un horario disponible.'); return; }
    if (!onConfirm(selected)) setError('Ese horario ya no está disponible. Selecciona otro.');
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="dialog dialog-wide" role="dialog" aria-modal="true" aria-labelledby="reschedule-title">
        <button className="icon-button dialog-close" onClick={onClose} aria-label="Cerrar"><FiX /></button>
        <span className="dialog-icon"><FiCalendar /></span>
        <span className="eyebrow">NUEVO HORARIO</span>
        <h2 id="reschedule-title">Reprogramar cita</h2>
        <p>Selecciona otro horario disponible para {appointment.specialty.toLowerCase()}.</p>
        <div className="dialog-current"><span>Cita actual</span><strong>{formatDate(appointment.date)} · {appointment.time}</strong></div>
        {availableDates.length > 0 ? <label className="field dialog-date-filter"><span>Nueva fecha</span><select value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); setSelected(''); setError(''); }}><option value="all">Ver todas las fechas</option>{availableDates.map((date) => <option key={date} value={date}>{formatDate(date)}</option>)}</select></label> : null}
        {shown.length ? <div className="reschedule-options" role="radiogroup" aria-label="Horarios disponibles">
          {shown.slice(0, 8).map((slot) => <button key={slot.id} className={`time-option ${selected === slot.id ? 'time-option-selected' : ''}`} role="radio" aria-checked={selected === slot.id} onClick={() => { setSelected(slot.id); setError(''); }}><FiCalendar /><span>{formatShortDate(slot.date)}</span><strong>{slot.time}</strong>{selected === slot.id && <FiCheck />}</button>)}
        </div> : <div className="empty-inline"><FiCalendar /><div><strong>No hay otros horarios disponibles</strong><span>Tu cita original permanece sin cambios.</span></div></div>}
        {error && <div className="field-error dialog-error" role="alert">{error}</div>}
        <div className="dialog-actions"><button className="button button-secondary" onClick={onClose}>Volver</button><button className="button button-primary" onClick={confirm} disabled={!shown.length}>Confirmar nuevo horario <FiArrowRight /></button></div>
      </section>
    </div>
  );
}

function TextField({
  label, value, onChange, placeholder, error, type = 'text', autoComplete, multiline = false,
}: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; error?: string; type?: string; autoComplete?: string; multiline?: boolean;
}) {
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const controlProps = { id, value, placeholder, autoComplete, onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value), 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${id}-error` : undefined };
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      {multiline ? <textarea {...controlProps} rows={3} /> : <input {...controlProps} type={type} />}
      {error && <small className="field-error" id={`${id}-error`}>{error}</small>}
    </label>
  );
}

export default App;
