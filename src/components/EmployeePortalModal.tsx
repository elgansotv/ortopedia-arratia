import React, { useState } from 'react';
import { Appointment, BlockedSlot } from '../types';
import { 
  Key, 
  Lock, 
  User as UserIcon,
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Edit3,
  Trash2,
  CalendarDays,
  Ban,
  Unlock,
  Check,
  Maximize2
} from 'lucide-react';
import { 
  format, 
  parseISO, 
  isSameDay, 
  addDays, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths,
  isToday as checkIsToday
} from 'date-fns';
import { es } from 'date-fns/locale';

interface EmployeePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onToggleBlockSlot: (date: string, hour: string, reason?: string) => void;
}

export const EmployeePortalModal: React.FC<EmployeePortalModalProps> = ({
  isOpen,
  onClose,
  appointments,
  blockedSlots,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onUpdateStatus,
  onToggleBlockSlot
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Selected date for day view
  const [currentViewDate, setCurrentViewDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));
  // Month currently displayed in top calendar
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());

  // Submodals
  const [showAddModal, setShowAddModal] = useState(false);
  const [prefilledHour, setPrefilledHour] = useState('10:00');
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New appointment form state
  const [newAppt, setNewAppt] = useState({
    name: '',
    phone: '',
    reason: '',
    date: currentViewDate,
    hour: '10:00',
    notes: ''
  });

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validUser = username.trim().toLowerCase() === 'demo';
    const validPass = password === '1234';

    if (validUser && validPass) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Credenciales incorrectas. Usa Usuario: Demo y Contraseña: 1234');
    }
  };

  const handleQuickDemoLogin = () => {
    setUsername('Demo');
    setPassword('1234');
    setIsAuthenticated(true);
    setAuthError('');
  };

  // Cuadrante de horas estándar de Ortopedia Arratia
  const quadrantHours = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
  ];

  // Appointments on current view date
  const dayAppointments = appointments.filter(a => a.date === currentViewDate);
  const dayBlockedSlots = blockedSlots.filter(b => b.date === currentViewDate);

  const isSelectedDateToday = currentViewDate === format(new Date(), 'yyyy-MM-dd');

  // Month navigation for top calendar
  const nextMonth = () => setCalendarMonth(addMonths(calendarMonth, 1));
  const prevMonth = () => setCalendarMonth(subMonths(calendarMonth, 1));

  // Generate days for the top month calendar
  const mStart = startOfMonth(calendarMonth);
  const mEnd = endOfMonth(mStart);
  const calStart = startOfWeek(mStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(mEnd, { weekStartsOn: 1 });

  const calendarDays = [];
  let d = calStart;
  while (d <= calEnd) {
    calendarDays.push(d);
    d = addDays(d, 1);
  }

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.name || !newAppt.phone) return;
    onAddAppointment({
      name: newAppt.name,
      phone: newAppt.phone,
      reason: newAppt.reason || 'Consulta ortopédica',
      date: newAppt.date,
      hour: newAppt.hour,
      status: 'confirmed',
      notes: newAppt.notes
    });
    setNewAppt({
      name: '',
      phone: '',
      reason: '',
      date: currentViewDate,
      hour: '10:00',
      notes: ''
    });
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppt) return;
    onEditAppointment(editingAppt);
    setEditingAppt(null);
  };

  const confirmDelete = (id: string) => {
    onDeleteAppointment(id);
    setDeleteConfirmId(null);
  };

  const openAddForHour = (hour: string) => {
    setNewAppt({
      name: '',
      phone: '',
      reason: '',
      date: currentViewDate,
      hour: hour,
      notes: ''
    });
    setShowAddModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-200">
      <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden">
        
        {/* TOP BAR FULLSCREEN */}
        <header className="px-6 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-xs z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-sm">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900 leading-none">
                  Panel de Empleados · Cuadrante Diario
                </h1>
                {isAuthenticated && (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Usuario: Demo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Ortopedia Arratia (Galdakao) · Gestión de agenda, citas y salidas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Google Calendar sync status pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="font-medium">Google Calendar: Listo para coordinar</span>
            </div>

            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setPassword('');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
                title="Cerrar sesión de empleado"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-xs"
              title="Volver a la página web"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Salir a la Web</span>
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        {!isAuthenticated ? (
          /* LOGIN SCREEN */
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-xl text-center">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5 shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Acceso al Cuadrante de Empleados
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Ingresa con tus credenciales de empleado para gestionar el cuadrante y bloquear horas si debes salir.
              </p>

              {/* Credenciales de prueba recordatorio */}
              <div className="mb-6 p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-left flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-950 mb-0.5">
                    Credenciales de prueba:
                  </p>
                  <p className="text-xs font-mono text-blue-800">
                    Usuario: <strong className="text-blue-950 font-bold">Demo</strong> &nbsp;|&nbsp; Contraseña: <strong className="text-blue-950 font-bold">1234</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
                >
                  Entrar directo
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Demo"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setAuthError('');
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="1234"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setAuthError('');
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20"
                >
                  Abrir Cuadrante de Citas
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* FULLSCREEN DASHBOARD: CALENDAR ON TOP + QUADRANT BELOW */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* SECCIÓN SUPERIOR: CALENDARIO DE DÍAS (ARRIBA) */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3.5 shrink-0 shadow-xs">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Mes y Controles de Navegación */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={prevMonth}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200"
                      title="Mes anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200"
                      title="Mes siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-base font-bold text-gray-900 capitalize tracking-tight">
                    {format(calendarMonth, 'MMMM yyyy', { locale: es })}
                  </h2>
                  <button
                    onClick={() => {
                      const today = new Date();
                      setCalendarMonth(today);
                      setCurrentViewDate(format(today, 'yyyy-MM-dd'));
                    }}
                    className="ml-2 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    Ir a Hoy
                  </button>
                </div>

                {/* Leyenda y Botón Añadir */}
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                    <span>Cita agendada</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <span>Hora bloqueada (salida)</span>
                  </div>
                  <button
                    onClick={() => {
                      setNewAppt({
                        name: '',
                        phone: '',
                        reason: '',
                        date: currentViewDate,
                        hour: '10:00',
                        notes: ''
                      });
                      setShowAddModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva Cita</span>
                  </button>
                </div>
              </div>

              {/* Tira compacta horizontal o matriz del mes */}
              <div className="max-w-7xl mx-auto mt-3 overflow-x-auto pb-1">
                <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-21 lg:grid-cols-28 xl:grid-cols-31 gap-1.5 min-w-[700px]">
                  {calendarDays.map((dayItem) => {
                    const dayStr = format(dayItem, 'yyyy-MM-dd');
                    const isCurrentMonth = dayItem.getMonth() === calendarMonth.getMonth();
                    const isSelected = dayStr === currentViewDate;
                    const isDayToday = checkIsToday(dayItem);
                    const apptsCount = appointments.filter(a => a.date === dayStr).length;
                    const blockedCount = blockedSlots.filter(b => b.date === dayStr).length;

                    return (
                      <button
                        key={dayStr}
                        onClick={() => setCurrentViewDate(dayStr)}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all text-center group cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30 scale-105 z-10 font-bold'
                            : isDayToday
                            ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-bold hover:bg-blue-100'
                            : isCurrentMonth
                            ? 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-slate-50'
                            : 'bg-gray-50/70 border-gray-100 text-gray-400 opacity-60'
                        }`}
                      >
                        <span className={`text-[9px] uppercase tracking-wider font-semibold ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                          {format(dayItem, 'eee', { locale: es }).substring(0, 2)}
                        </span>
                        <span className="text-xs leading-none my-0.5 font-bold">
                          {format(dayItem, 'd')}
                        </span>
                        <div className="flex gap-0.5 h-1.5 mt-0.5">
                          {apptsCount > 0 && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-600'}`} title={`${apptsCount} citas`} />
                          )}
                          {blockedCount > 0 && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`} title={`${blockedCount} horas bloqueadas`} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECCIÓN INFERIOR: CUADRANTE DEL DÍA (ABAJO) */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
              <div className="max-w-7xl mx-auto space-y-4">
                
                {/* Cabecera del cuadrante para la fecha elegida */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900 capitalize">
                          Cuadrante del {format(parseISO(currentViewDate), "EEEE, d 'de' MMMM yyyy", { locale: es })}
                        </h3>
                        {isSelectedDateToday && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
                            Hoy
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {dayAppointments.length} citas programadas &bull; {dayBlockedSlots.length} horas bloqueadas por salida
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      ¿Tienes que ausentarte? Pulsa <strong>"Bloquear por salida"</strong> en la franja horaria.
                    </span>
                  </div>
                </div>

                {/* Grid del Cuadrante Horario */}
                <div className="grid gap-2.5">
                  {quadrantHours.map((hour) => {
                    const appointment = dayAppointments.find(a => a.hour === hour);
                    const isBlocked = dayBlockedSlots.some(b => b.hour === hour);
                    const blockedSlot = dayBlockedSlots.find(b => b.hour === hour);

                    return (
                      <div
                        key={hour}
                        className={`rounded-2xl border transition-all p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          appointment
                            ? 'bg-white border-blue-200 shadow-xs ring-1 ring-blue-50'
                            : isBlocked
                            ? 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                            : 'bg-white border-gray-200/80 hover:border-gray-300 hover:bg-slate-50/50'
                        }`}
                      >
                        {/* Franja y Estado */}
                        <div className="flex items-start sm:items-center gap-3.5 flex-1">
                          {/* Hour badge */}
                          <div className={`w-16 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border font-mono font-bold text-sm ${
                            appointment
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                              : isBlocked
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            <span className="text-xs leading-none">{hour}</span>
                            <span className="text-[9px] opacity-80 font-sans font-medium mt-0.5">
                              {parseInt(hour.split(':')[0]) < 14 ? 'Mañana' : 'Tarde'}
                            </span>
                          </div>

                          {/* Detail of the slot */}
                          <div className="flex-1">
                            {appointment ? (
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="text-sm font-bold text-gray-900">
                                    {appointment.name}
                                  </h4>
                                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                    appointment.status === 'confirmed'
                                      ? 'bg-green-100 text-green-700'
                                      : appointment.status === 'pending'
                                      ? 'bg-amber-100 text-amber-700'
                                      : appointment.status === 'completed'
                                      ? 'bg-gray-100 text-gray-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {appointment.status === 'confirmed' ? 'Confirmada' : appointment.status === 'pending' ? 'Pendiente' : appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 font-medium flex items-center gap-2 flex-wrap">
                                  <span>{appointment.reason}</span>
                                  <span className="text-gray-300">&bull;</span>
                                  <span className="flex items-center gap-1 font-mono text-gray-500">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    <a href={`tel:${appointment.phone}`} className="hover:text-blue-600 underline">
                                      {appointment.phone}
                                    </a>
                                  </span>
                                  {appointment.notes && (
                                    <>
                                      <span className="text-gray-300">&bull;</span>
                                      <span className="text-gray-500 italic">Nota: {appointment.notes}</span>
                                    </>
                                  )}
                                </p>
                              </div>
                            ) : isBlocked ? (
                              <div>
                                <div className="flex items-center gap-2">
                                  <Ban className="w-4 h-4 text-amber-600" />
                                  <h4 className="text-sm font-bold text-amber-900">
                                    Hora Bloqueada · Salida de la Ortopedia
                                  </h4>
                                </div>
                                <p className="text-xs text-amber-700 mt-0.5">
                                  {blockedSlot?.reason || 'No disponible para reservas de clientes en la web (ausencia / salida del gabinete).'}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                  <h4 className="text-sm font-semibold text-gray-700">
                                    Hora Libre y Disponible
                                  </h4>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Disponible para cita presencial/telefónica o reserva en la web.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions for this slot */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                          {appointment ? (
                            <>
                              <button
                                onClick={() => setEditingAppt(appointment)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                                title="Modificar hora, fecha o datos"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Modificar</span>
                              </button>

                              {appointment.status !== 'confirmed' && (
                                <button
                                  onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
                                >
                                  Confirmar
                                </button>
                              )}

                              {appointment.status !== 'completed' && (
                                <button
                                  onClick={() => onUpdateStatus(appointment.id, 'completed')}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                  Completada
                                </button>
                              )}

                              {deleteConfirmId === appointment.id ? (
                                <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200">
                                  <span className="text-[11px] text-red-700 font-bold px-1">¿Quitar?</span>
                                  <button
                                    onClick={() => confirmDelete(appointment.id)}
                                    className="px-2 py-0.5 rounded-lg bg-red-600 text-white text-[11px] font-bold hover:bg-red-700"
                                  >
                                    Sí
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-2 py-0.5 rounded-lg bg-gray-200 text-gray-700 text-[11px] font-medium"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(appointment.id)}
                                  className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Eliminar cita"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          ) : isBlocked ? (
                            <button
                              onClick={() => onToggleBlockSlot(currentViewDate, hour)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-2xs"
                              title="Desbloquear y volver a habilitar esta hora para citas"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Habilitar Hora</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => openAddForHour(hour)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Asignar Cita</span>
                              </button>

                              <button
                                onClick={() => onToggleBlockSlot(currentViewDate, hour, 'Salida de la ortopedia')}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                                title="Bloquear esta hora si tienes que salir de la ortopedia"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Bloquear por Salida</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SUB-MODAL: MODIFICAR CITA */}
      {editingAppt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Modificar Cita</h3>
                  <p className="text-xs text-gray-500">Cambia la hora, fecha o datos del paciente</p>
                </div>
              </div>
              <button onClick={() => setEditingAppt(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del paciente</label>
                <input
                  required
                  type="text"
                  value={editingAppt.name}
                  onChange={e => setEditingAppt({...editingAppt, name: e.target.value})}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nueva Fecha</label>
                  <input
                    required
                    type="date"
                    value={editingAppt.date}
                    onChange={e => setEditingAppt({...editingAppt, date: e.target.value})}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nueva Hora</label>
                  <select
                    value={editingAppt.hour}
                    onChange={e => setEditingAppt({...editingAppt, hour: e.target.value})}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 bg-white"
                  >
                    {quadrantHours.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
                <input
                  required
                  type="tel"
                  value={editingAppt.phone}
                  onChange={e => setEditingAppt({...editingAppt, phone: e.target.value})}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Motivo o Servicio</label>
                <input
                  type="text"
                  value={editingAppt.reason}
                  onChange={e => setEditingAppt({...editingAppt, reason: e.target.value})}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Estado</label>
                <select
                  value={editingAppt.status}
                  onChange={e => setEditingAppt({...editingAppt, status: e.target.value as Appointment['status']})}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 bg-white"
                >
                  <option value="confirmed">Confirmada</option>
                  <option value="pending">Pendiente</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAppt(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: NUEVA CITA MANUAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Asignar Cita en Cuadrante</h3>
                  <p className="text-xs text-gray-500">{newAppt.date} a las {newAppt.hour}</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del paciente</label>
                <input
                  required
                  type="text"
                  value={newAppt.name}
                  onChange={e => setNewAppt({...newAppt, name: e.target.value})}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Ej: Aitor Mendia"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
                  <input
                    required
                    type="tel"
                    value={newAppt.phone}
                    onChange={e => setNewAppt({...newAppt, phone: e.target.value})}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    placeholder="600 000 000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Hora</label>
                  <select
                    value={newAppt.hour}
                    onChange={e => setNewAppt({...newAppt, hour: e.target.value})}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 bg-white"
                  >
                    {quadrantHours.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha</label>
                <input
                  required
                  type="date"
                  value={newAppt.date}
                  onChange={e => setNewAppt({...newAppt, date: e.target.value})}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Motivo o Servicio</label>
                <input
                  type="text"
                  value={newAppt.reason}
                  onChange={e => setNewAppt({...newAppt, reason: e.target.value})}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Ej: Ajuste de silla de ruedas, plantilla a medida..."
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                >
                  Guardar en Cuadrante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
