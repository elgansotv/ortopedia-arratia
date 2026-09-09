/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isBefore, startOfDay, isWeekend } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Phone, Clock, Star, ChevronLeft, ChevronRight, CheckCircle2, Key } from 'lucide-react';
import { Appointment, BlockedSlot } from './types';
import { EmployeePortalModal } from './components/EmployeePortalModal';

interface CalendarProps {
  bookedAppointments: Appointment[];
  blockedSlots: BlockedSlot[];
  onBookAppointment: (data: { name: string; phone: string; reason: string; date: string; hour: string }) => void;
}

const Calendar: React.FC<CalendarProps> = ({ bookedAppointments, blockedSlots, onBookAppointment }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', reason: '' });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows = [];
  let days = [];
  let day = startDate;

  const availableHours = ["09:30", "10:30", "11:30", "12:30", "16:00", "17:00", "18:00", "19:00"];

  // Find booked and blocked hours for selected date
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const bookedHoursOnDate = bookedAppointments
    .filter(a => a.date === selectedDateStr && a.status !== 'cancelled')
    .map(a => a.hour);
  const blockedHoursOnDate = blockedSlots
    .filter(b => b.date === selectedDateStr)
    .map(b => b.hour);

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, "d");
      const cloneDay = day;
      
      const isPast = isBefore(startOfDay(cloneDay), startOfDay(new Date()));
      const isWeekendDay = isWeekend(cloneDay);
      const disabled = !isSameMonth(day, monthStart) || isPast || isWeekendDay;
      const isSelected = selectedDate && isSameDay(day, selectedDate);

      days.push(
        <div
          key={day.toString()}
          onClick={() => {
            if (!disabled) {
              setSelectedDate(cloneDay);
              setSelectedHour(null);
              setShowForm(false);
            }
          }}
          className={`flex items-center justify-center h-8 w-8 sm:h-11 sm:w-11 md:h-12 md:w-12 text-xs sm:text-sm mx-auto rounded-full transition-all ${
            disabled ? 'text-gray-300 cursor-default' :
            isSelected ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/30 scale-105 cursor-pointer' :
            'text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
          }`}
        >
          <span>{formattedDate}</span>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedHour) return;

    onBookAppointment({
      name: formData.name,
      phone: formData.phone,
      reason: formData.reason,
      date: format(selectedDate, 'yyyy-MM-dd'),
      hour: selectedHour
    });

    setSubmitted(true);
  };

  if (submitted) {
     return (
       <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[400px]">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-in zoom-in-75 duration-200" />
          <h3 className="text-2xl font-medium text-gray-900 mb-2">¡Cita agendada con éxito!</h3>
          <p className="text-gray-600 mb-6 max-w-md text-sm">
            Hemos registrado tu solicitud para el <strong>{selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })} a las {selectedHour}</strong>. Nuestro equipo de Ortopedia Arratia se pondrá en contacto contigo para confirmar todos los detalles.
          </p>
          <button 
            onClick={() => { setSubmitted(false); setSelectedDate(null); setShowForm(false); setFormData({name:'', phone:'', reason:''}); }} 
            className="px-6 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full font-medium transition-colors text-sm shadow-sm"
          >
            Solicitar otra cita
          </button>
       </div>
     )
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-10 shadow-sm border border-gray-100 max-w-5xl mx-auto w-full overflow-hidden">
      <div className="grid lg:grid-cols-[1fr_300px] gap-8 lg:gap-10 w-full min-w-0">
        <div>
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-lg font-medium text-gray-900 capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"><ChevronLeft className="w-5 h-5"/></button>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"><ChevronRight className="w-5 h-5"/></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4 text-center">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
              <div key={d} className="text-xs font-medium text-gray-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          
          <div>{rows}</div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-10 flex flex-col h-full min-h-[300px]">
           {!selectedDate ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center h-full text-gray-400">
                <Clock className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm">Selecciona un día<br/>para ver las horas disponibles</p>
             </div>
           ) : showForm ? (
             <div className="flex-1 flex flex-col transition-all">
                <button 
                  onClick={() => setShowForm(false)} 
                  className="text-sm text-blue-600 mb-4 font-medium flex items-center gap-1 hover:text-blue-700 w-fit transition-colors"
                >
                  <ChevronLeft className="w-4 h-4"/> Volver a horas
                </button>
                <h4 className="font-medium text-gray-900 mb-1">Detalles de la cita</h4>
                <p className="text-sm text-gray-500 mb-6">{format(selectedDate, "d 'de' MMMM", { locale: es })} a las {selectedHour}</p>
                
                <form className="space-y-4 flex-1 flex flex-col" onSubmit={handleFormSubmit}>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Nombre completo</label>
                    <input required type="text" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Ej: Jon Agirre" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Teléfono de contacto</label>
                    <input required type="tel" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="600 123 456" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Motivo de consulta</label>
                    <textarea required rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" value={formData.reason} onChange={e=>setFormData({...formData, reason: e.target.value})} placeholder="Ej: Valoración de silla de ruedas, plantilla a medida, férula..."></textarea>
                  </div>
                  <div className="mt-auto pt-6">
                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-sm shadow-sm hover:shadow">Confirmar cita</button>
                  </div>
                </form>
             </div>
           ) : (
             <div className="flex-1 flex flex-col transition-all">
                <h4 className="font-medium text-gray-900 mb-4 capitalize">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}</h4>
                <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1">
                   {availableHours.map(hour => {
                     const isBooked = bookedHoursOnDate.includes(hour);
                     const isBlocked = blockedHoursOnDate.includes(hour);
                     const isUnavailable = isBooked || isBlocked;
                     return (
                       <button 
                          key={hour} 
                          disabled={isUnavailable}
                          onClick={() => setSelectedHour(hour)}
                          className={`py-2 px-3 text-sm rounded-xl border transition-all ${
                            isUnavailable
                              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                              : selectedHour === hour 
                              ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold shadow-sm' 
                              : 'border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50/50'
                          }`}
                          title={isBlocked ? 'Hora no disponible (salida/ausencia de la ortopedia)' : isBooked ? 'Hora ya reservada' : 'Seleccionar hora'}
                       >
                         {hour} {isBlocked ? (
                           <span className="text-[10px] ml-1 text-amber-700 opacity-80 font-semibold">Salida</span>
                         ) : isBooked ? (
                           <span className="text-[10px] ml-1 opacity-70">Ocupada</span>
                         ) : null}
                       </button>
                     );
                   })}
                </div>
                {selectedHour && (
                  <div className="mt-6">
                    <button 
                      onClick={() => setShowForm(true)}
                      className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-medium transition-colors text-sm shadow-sm hover:shadow"
                    >
                      Continuar
                    </button>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const navLinks = [
    { name: 'Historia', href: '#historia' },
    { name: 'Conócenos', href: '#conocenos' },
    { name: 'Citas', href: '#citas' }
  ];

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  // Initial sample / persistent appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('ortopedia_arratia_appointments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const inTwoDaysStr = format(addDays(new Date(), 2), 'yyyy-MM-dd');
    return [
      {
        id: 'apt-1',
        name: 'Miren Agirre',
        phone: '644 123 456',
        reason: 'Férula a medida y revisión de plantilla',
        date: todayStr,
        hour: '10:30',
        status: 'confirmed',
        notes: 'Prescripción Osakidetza'
      },
      {
        id: 'apt-2',
        name: 'Iñaki Bilbao',
        phone: '655 789 012',
        reason: 'Ajuste de silla de ruedas y cojín antiescaras',
        date: todayStr,
        hour: '12:30',
        status: 'confirmed'
      },
      {
        id: 'apt-3',
        name: 'Nekane Etxebarria',
        phone: '611 234 567',
        reason: 'Prótesis y valoración técnica',
        date: tomorrowStr,
        hour: '11:30',
        status: 'pending'
      },
      {
        id: 'apt-4',
        name: 'Jon Mikel Uriarte',
        phone: '688 345 678',
        reason: 'Calzado especial a medida',
        date: inTwoDaysStr,
        hour: '17:00',
        status: 'confirmed'
      }
    ];
  });

  // Initial blocked slots state (persisted)
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(() => {
    const saved = localStorage.getItem('ortopedia_arratia_blocked_slots');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return [
      { id: 'block-init-1', date: todayStr, hour: '13:00', reason: 'Salida técnica y gestión hospitalaria' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ortopedia_arratia_blocked_slots', JSON.stringify(blockedSlots));
  }, [blockedSlots]);

  const handleToggleBlockSlot = (date: string, hour: string, reason: string = 'Salida de la ortopedia') => {
    setBlockedSlots(prev => {
      const exists = prev.some(b => b.date === date && b.hour === hour);
      if (exists) {
        return prev.filter(b => !(b.date === date && b.hour === hour));
      } else {
        return [...prev, { id: `block-${Date.now()}`, date, hour, reason }];
      }
    });
  };

  const handleBookAppointment = (data: { name: string; phone: string; reason: string; date: string; hour: string }) => {
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      reason: data.reason,
      date: data.date,
      hour: data.hour,
      status: 'confirmed'
    };
    setAppointments(prev => [newAppointment, ...prev]);
  };

  const handleAddAppointment = (appt: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appt,
      id: `apt-${Date.now()}`
    };
    setAppointments(prev => [newAppointment, ...prev]);
  };

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleEditAppointment = (updatedAppt: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updatedAppt.id ? updatedAppt : a));
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="bg-white min-h-screen text-gray-900 overflow-x-hidden w-full max-w-full">
      <section className="relative min-h-screen overflow-hidden bg-[#f0f0ee] w-full max-w-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source
            src="./video_loop.mp4"
            type="video/mp4"
          />
        </video>

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Logo en esquina superior izquierda */}
          <div className="absolute top-3 sm:top-6 left-4 sm:left-8 z-50">
            <img src="./logo.png" alt="Ortopedia Arratia Logo" className="h-7 sm:h-9 lg:h-12 w-auto object-contain drop-shadow-sm" />
          </div>

          {/* Menú Dinámico 3D Central (visible solo en ordenador / desktop lg:) */}
          <nav className="hidden lg:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 items-center justify-center transition-all duration-300">
            <div
              className="relative flex items-center gap-2 rounded-full p-2 bg-gradient-to-b from-white/95 via-white/90 to-white/75 backdrop-blur-xl border border-white/90 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.22),0_6px_16px_-4px_rgba(0,0,0,0.12),inset_0_1.5px_2px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.06)]"
            >
              {/* Reflejo especular superior para relieve 3D */}
              <div className="absolute top-1 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none rounded-full" />
              
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative px-6 py-2 rounded-full text-[14px] font-semibold text-gray-700 hover:text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:bg-white/90 active:translate-y-0.5 active:scale-95 text-center whitespace-nowrap"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </nav>

          {/* Botón arriba a la derecha con forma de llave para login de empleados (visible solo en ordenador / desktop lg:) */}
          <div className="hidden lg:block absolute top-6 right-8 z-50">
            <button
              id="btn-login-empleados-llave"
              onClick={() => setIsEmployeeModalOpen(true)}
              className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-b from-white/95 via-white/90 to-white/75 backdrop-blur-xl border border-white/90 text-gray-800 hover:text-blue-700 transition-all duration-300 shadow-[0_12px_28px_-4px_rgba(0,0,0,0.2),0_4px_10px_-2px_rgba(0,0,0,0.08),inset_0_1.5px_2px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_32px_-4px_rgba(37,99,235,0.25),inset_0_1.5px_2px_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95"
              title="Acceso de empleados · Revisar calendario de citas"
            >
              {/* Icono de llave con estilo 3D */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:rotate-12 transition-transform duration-300 shrink-0">
                <Key className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[13px] font-bold text-gray-800 group-hover:text-blue-700 leading-none">
                  Empleados
                </span>
                <span className="text-[10px] text-gray-400 font-medium leading-tight">
                  Ver citas
                </span>
              </div>
            </button>
          </div>

          <main className="flex-1 flex items-end pb-6 sm:pb-8 lg:pb-20 px-4 sm:px-8 md:px-16 lg:px-28 pt-16 sm:pt-20 lg:pt-24 landscape:pb-4 landscape:pt-12">
            <div className="max-w-[200px] sm:max-w-[215px] lg:max-w-md landscape:max-w-[190px]">
              <a
                href="#historia"
                className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] lg:text-[12px] font-semibold text-blue-600 bg-white/85 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full hover:bg-white transition-colors mb-2 sm:mb-3 lg:mb-3.5 group shadow-sm landscape:mb-1.5 landscape:py-0.5 landscape:text-[9.5px]"
              >
                Más de 25 años a tu lado
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </a>

              <h1 className="text-[1.12rem] sm:text-[1.24rem] lg:text-[2.1rem] leading-[1.16] font-medium text-gray-900 tracking-tight mb-2 sm:mb-3 lg:mb-4 landscape:text-[1.05rem] landscape:leading-[1.14] landscape:mb-1.5">
                Soluciones para vivir<br />
                con más autonomía<br />
                cada día.
              </h1>

              <p className="text-[11px] sm:text-[12px] lg:text-[14px] leading-snug text-gray-700 font-medium mb-3 sm:mb-4 lg:mb-5 max-w-[175px] sm:max-w-[195px] lg:max-w-sm landscape:max-w-[170px] landscape:text-[10.5px] landscape:mb-2">
                Asesoramiento profesional y cercano en Galdakao.
              </p>

              <a
                href="#citas"
                className="inline-flex items-center gap-1.5 text-[11.5px] sm:text-[12.5px] lg:text-[14px] font-medium text-white bg-blue-600 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 hover:bg-blue-700 transition-all duration-200 group shadow-sm landscape:px-3 landscape:py-1.5 landscape:text-[11px]"
              >
                Pide tu cita
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </a>
            </div>
          </main>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100 py-8 px-4 sm:px-8 md:px-16 lg:px-28 relative z-20 w-full max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100 w-full min-w-0">
          <div className="pt-4 md:pt-0">
            <p className="text-3xl font-medium text-blue-600 mb-1">+25 años</p>
            <p className="text-sm text-gray-600 font-medium">de experiencia</p>
          </div>
          <div className="pt-4 md:pt-0">
            <p className="text-3xl font-medium text-gray-900 mb-1">Galdakao</p>
            <p className="text-sm text-gray-600 font-medium">atención cercana</p>
          </div>
          <div className="pt-4 md:pt-0">
            <p className="text-3xl font-medium text-gray-900 mb-1">Osakidetza</p>
            <p className="text-sm text-gray-600 font-medium">gabinete técnico concertado</p>
          </div>
        </div>
      </section>

      <section id="historia" className="py-20 sm:py-24 px-4 sm:px-8 md:px-16 lg:px-28 bg-[#fdfdfd] w-full max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center w-full min-w-0">
            <div className="w-full min-w-0">
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900 mb-6">Más de 25 años cuidando de Galdakao</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
                <p>
                  Durante más de dos décadas, en Ortopedia Arratia hemos acompañado a personas y familias de Galdakao y sus alrededores, ayudándoles a encontrar soluciones adaptadas a sus necesidades de movilidad, autonomía y bienestar.
                </p>
                <p>
                  La experiencia acumulada durante estos años, unida a un trato cercano y personalizado, nos permite ofrecer mucho más que productos ortopédicos: asesoramiento profesional para encontrar la solución adecuada para cada persona.
                </p>
                <p>
                  Hoy seguimos trabajando con la misma filosofía: escuchar, asesorar y ayudar a mejorar el día a día de quienes confían en nosotros.
                </p>
                <p className="font-medium text-gray-900 pt-2">
                  Ortopedia Arratia. Experiencia, cercanía y confianza.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-3xl aspect-square sm:aspect-video lg:aspect-square overflow-hidden relative border border-gray-200 w-full">
              <img 
                src="./unnamed.webp" 
                alt="Clínica Ortopedia Arratia en Galdakao" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo de Soluciones */}
      <section className="py-20 sm:py-24 px-4 sm:px-8 md:px-16 lg:px-28 bg-white border-t border-gray-100 w-full max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900 mb-4">Soluciones para ti</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Disponemos de un amplio catálogo de productos adaptados para mejorar tu autonomía y comodidad.</p>
          </div>
          <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center max-w-4xl mx-auto w-full">
             {["Sillas de ruedas", "Cojines antiescaras", "Fajas y corsés", "Ortesis", "Férulas a medida", "Camas eléctricas", "Colchones antiescaras", "Grúas", "Rampas y subescaleras", "Andadores", "Muletas y bastones", "Prótesis de mama", "Presoterapia", "Plantillas a medida", "Calzado especial", "Ayudas para baño/WC"].map(item => (
                <span key={item} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 hover:border-blue-300 transition-colors rounded-full text-xs sm:text-sm font-medium text-gray-700 text-center">
                  {item}
                </span>
             ))}
          </div>
        </div>
      </section>

      <section id="conocenos" className="py-20 sm:py-24 px-4 sm:px-8 md:px-16 lg:px-28 bg-[#fdfdfd] border-t border-gray-100 w-full max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900 mb-4">Conócenos</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Estamos aquí para ayudarte. Visítanos en nuestra clínica o contáctanos para cualquier duda.</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 w-full min-w-0">
            <div className="w-full min-w-0">
              <div className="bg-gray-50 p-6 sm:p-8 rounded-3xl border border-gray-100 mb-10 w-full">
                <h3 className="text-xl font-medium mb-6 text-gray-900">Información de Contacto</h3>
                <div className="space-y-6 text-gray-700">
                  <div className="flex gap-4">
                    <MapPin className="w-6 h-6 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Dirección</p>
                      <p>Euskadi Kalea, 11</p>
                      <p>48960 Kurtzea, Bizkaia</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Phone className="w-6 h-6 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Teléfono</p>
                      <p>944 56 68 42</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Clock className="w-6 h-6 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Horario</p>
                      <p>Lunes a Viernes: 9:30–13:30, 16:00–19:30</p>
                      <p className="text-gray-400 mt-1">Sábado y Domingo: Cerrado</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full min-w-0">
                <h3 className="text-xl font-medium mb-6 text-gray-900 px-1">Lo que dicen de nosotros</h3>
                
                {/* En móvil (incluido formato horizontal): Lista 100% vertical adaptada a la pantalla */}
                <div className="lg:hidden flex flex-col gap-4 w-full">
                  <div className="w-full bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex gap-1 mb-2.5">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-sm text-gray-600 italic leading-relaxed">"Excelente trato y profesionalidad. Me asesoraron perfectamente para encontrar la solución."</p>
                    <p className="text-sm font-medium mt-3 text-gray-900">— María L.</p>
                  </div>
                  <div className="w-full bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex gap-1 mb-2.5">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-sm text-gray-600 italic leading-relaxed">"Llevo años confiando en ellos y la atención siempre es de 10. Son rápidos y los productos geniales."</p>
                    <p className="text-sm font-medium mt-3 text-gray-900">— Juan A.</p>
                  </div>
                  <div className="w-full bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex gap-1 mb-2.5">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-sm text-gray-600 italic leading-relaxed">"Increíble atención personalizada. Me resolvieron todas las dudas sobre mi nueva silla de ruedas."</p>
                    <p className="text-sm font-medium mt-3 text-gray-900">— Elena R.</p>
                  </div>
                </div>

                {/* En ordenador/pantalla grande: Carrusel suave perfectamente delimitado */}
                <div className="hidden lg:block relative w-full overflow-hidden max-w-full">
                  <div className="flex w-max animate-marquee gap-4">
                    {/* Primera serie de reseñas */}
                    <div className="w-[300px] shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                      </div>
                      <p className="text-sm text-gray-600 italic leading-relaxed">"Excelente trato y profesionalidad. Me asesoraron perfectamente para encontrar la solución."</p>
                      <p className="text-sm font-medium mt-4 text-gray-900">— María L.</p>
                    </div>
                    <div className="w-[300px] shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                      </div>
                      <p className="text-sm text-gray-600 italic leading-relaxed">"Llevo años confiando en ellos y la atención siempre es de 10. Son rápidos y los productos geniales."</p>
                      <p className="text-sm font-medium mt-4 text-gray-900">— Juan A.</p>
                    </div>
                    <div className="w-[300px] shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                      </div>
                      <p className="text-sm text-gray-600 italic leading-relaxed">"Increíble atención personalizada. Me resolvieron todas las dudas sobre mi nueva silla de ruedas."</p>
                      <p className="text-sm font-medium mt-4 text-gray-900">— Elena R.</p>
                    </div>
                    {/* Segunda serie duplicada para el marquee continuo */}
                    <div className="w-[300px] shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                      </div>
                      <p className="text-sm text-gray-600 italic leading-relaxed">"Excelente trato y profesionalidad. Me asesoraron perfectamente para encontrar la solución."</p>
                      <p className="text-sm font-medium mt-4 text-gray-900">— María L.</p>
                    </div>
                    <div className="w-[300px] shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                      </div>
                      <p className="text-sm text-gray-600 italic leading-relaxed">"Llevo años confiando en ellos y la atención siempre es de 10. Son rápidos y los productos geniales."</p>
                      <p className="text-sm font-medium mt-4 text-gray-900">— Juan A.</p>
                    </div>
                    <div className="w-[300px] shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                      </div>
                      <p className="text-sm text-gray-600 italic leading-relaxed">"Increíble atención personalizada. Me resolvieron todas las dudas sobre mi nueva silla de ruedas."</p>
                      <p className="text-sm font-medium mt-4 text-gray-900">— Elena R.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-[360px] sm:h-[420px] lg:h-auto min-h-[360px] lg:min-h-[500px] bg-gray-100 rounded-3xl overflow-hidden relative border border-gray-200">
                <iframe 
                  src="https://maps.google.com/maps?q=Euskadi%20Kalea,%2011,%2048960%20Kurtzea,%20Bizkaia&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa de ubicación"
                  className="w-full h-full"
                ></iframe>
            </div>
          </div>
        </div>
      </section>

      <section id="citas" className="py-20 sm:py-24 px-4 sm:px-8 md:px-16 lg:px-28 bg-[#f8f9fa] w-full max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900 mb-4">Pide tu Cita</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Selecciona el día y la hora que mejor te venga y nos pondremos en contacto contigo para confirmar.</p>
          </div>
          
          <Calendar 
            bookedAppointments={appointments}
            blockedSlots={blockedSlots}
            onBookAppointment={handleBookAppointment}
          />
        </div>
      </section>

      {/* Footer con Copyright e Información Legal */}
      <footer className="bg-[#181a1d] text-gray-400 text-sm py-10 px-4 sm:px-8 md:px-12 border-t border-gray-800 w-full max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center">
            <span className="text-white font-semibold tracking-tight text-base">Ortopedia Arratia</span>
          </div>

          <div className="text-center sm:text-right text-xs text-gray-400">
            <p className="mb-1">Euskadi Kalea, 11 · 48960 Galdakao, Bizkaia · Tel: 944 56 68 42</p>
            <p>© {new Date().getFullYear()} Ortopedia Arratia. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modal del Portal de Empleados Pantalla Completa con Cuadrante y Calendario */}
      <EmployeePortalModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        appointments={appointments}
        blockedSlots={blockedSlots}
        onAddAppointment={handleAddAppointment}
        onEditAppointment={handleEditAppointment}
        onDeleteAppointment={handleDeleteAppointment}
        onUpdateStatus={handleUpdateStatus}
        onToggleBlockSlot={handleToggleBlockSlot}
      />
    </div>
  );
}
