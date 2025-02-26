// src/components/Calendar.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon, Clock, User, Phone, Mail, Trash2, Edit, X } from 'lucide-react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import * as calendarService from '../services/calendarService';
import { Appointment } from '../models/Appointment';
import { Lead } from '../models/Lead';
import { useApp } from '../contexts/AppContext';

interface CalendarCellProps {
  date: Date;
  appointments: Appointment[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onAddAppointment: (date: Date) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  theme: 'dark' | 'light';
}

function CalendarCell({ date, appointments, isCurrentMonth, isToday, onAddAppointment, onEditAppointment, onDeleteAppointment, theme }: CalendarCellProps) {
  const { setNodeRef } = useDroppable({
    id: format(date, 'yyyy-MM-dd'),
  });

    const dayAppointments = appointments.filter(apt =>
    isSameDay(new Date(apt.date_time), date)  // Corrected comparison
  );

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] p-2 border-r border-b ${
        theme === 'dark'
          ? 'border-gray-700'
          : 'border-gray-200'
      } ${
        !isCurrentMonth
          ? theme === 'dark'
            ? 'bg-gray-900/50'
            : 'bg-gray-50'
          : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm ${
          !isCurrentMonth
            ? 'text-gray-500'
            : isToday
              ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full'
              : theme === 'dark'
                ? 'text-white'
                : 'text-gray-900'
        }`}>
          {format(date, 'd')}
        </span>
        <button
          onClick={() => onAddAppointment(date)}
          className="p-1 hover:bg-gray-700/10 rounded-full"
        >
          <Plus className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="space-y-1">
        {dayAppointments.map((appointment) => (
          <AppointmentItem
            key={appointment.id}
            appointment={appointment}
            onEdit={onEditAppointment}
            onDelete={onDeleteAppointment}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}

interface AppointmentItemProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  theme: 'dark' | 'light';
}

function AppointmentItem({ appointment, onEdit, onDelete, theme }: AppointmentItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appointment.id,
    data: appointment,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const statusColors = {
    Scheduled: 'bg-yellow-500/20 text-yellow-400',
    Completed: 'bg-green-500/20 text-green-400',
    Cancelled: 'bg-red-500/20 text-red-400',
};


  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-1 rounded text-xs ${statusColors[appointment.status as keyof typeof statusColors]} cursor-move`}
    >
      <div className="flex items-center justify-between">
        <span>{appointment.source}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(appointment);
            }}
            className="p-0.5 hover:bg-gray-700/10 rounded"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(appointment.id);
            }}
            className="p-0.5 hover:bg-gray-700/10 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Partial<Appointment> | null;
    onSave: (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => void;
    theme: 'dark' | 'light';
    leads: Lead[];
}

function AppointmentModal({ isOpen, onClose, appointment, onSave, theme, leads }: AppointmentModalProps) {
    const [formData, setFormData] = useState<Partial<Appointment>>({
        lead_id: '', // Initialize lead_id
        date_time: new Date().toISOString(), // Initialize with current date/time
        source: 'Call', // Default source
        status: 'Scheduled', // Default status
    });
      const [date, setDate] = useState('');
      const [time, setTime] = useState('');

    useEffect(() => {
        if (appointment) {
            // Populate form with existing appointment data, converting date_time to separate date and time
            const [datePart, timePart] = appointment.date_time ? appointment.date_time.split('T') :['', ''];
            setFormData({
                ...appointment,
                date: datePart,
                time: timePart ? timePart.substring(0, 5) : '', // Extract HH:mm
               });

        }
    }, [appointment]);

    useEffect(() => {
        if (formData.date) {
            setDate(formData.date);
        }
    }, [formData.date])

    useEffect(() => {
        if(formData.time){
            setTime(formData.time)
        }
    }, [formData.time])


    if (!isOpen) return null;

    const handleSave = () => {
        if (formData.lead_id && formData.date_time) {
            // Combine date and time
            const combinedDateTime = `<span class="math-inline">\{date\}T</span>{time}:00`;

            onSave({
                ...formData,
                date_time: combinedDateTime, // Send as single string to backend
            } as Omit<Appointment, 'id' | 'created_at' | 'updated_at'>);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {appointment ? 'Edit Appointment' : 'New Appointment'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                            Select Lead
                        </label>
                        <select
                            value={formData.lead_id || ''}
                            onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                            className={`w-full px-3 py-2 ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                            } border rounded-lg focus:outline-none focus:border-indigo-500`}
                        >
                            <option value="">Select a Lead</option>
                            {leads.map((lead) => (
                                <option key={lead.id} value={lead.id}>
                                    {lead.name} ({lead.phone_number})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                            Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={`w-full px-3 py-2 ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                            } border rounded-lg focus:outline-none focus:border-indigo-500`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                            Time
                        </label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className={`w-full px-3 py-2 ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                            } border rounded-lg focus:outline-none focus:border-indigo-500`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                            Source
                        </label>
                        <select
                value={formData.source || ''}
                onChange={(e) => setFormData({ ...formData, source: e.target.value})}
                className={`w-full px-3 py-2 ${
                theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } border rounded-lg focus:outline-none focus:border-indigo-500`}
            >
                <option value="Call">Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="SMS">SMS</option>
                <option value="Email">Email</option>
                <option value="Manual">Manual</option>
            </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                            Status
                        </label>
                        <select
                            value={formData.status || 'Scheduled'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as Appointment['status'] })}
                            className={`w-full px-3 py-2 ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                            } border rounded-lg focus:outline-none focus:border-indigo-500`}
                        >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 ${
                            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                        } text-gray-400 rounded-lg transition-colors`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export function Calendar({ theme, leads }: { theme: 'dark' | 'light', leads: Lead[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Partial<Appointment> | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const startDate = startOfWeek(startOfMonth(currentDate));
    const endDate = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleAddAppointment = (date: Date) => {
      const currentDate = new Date();

        setSelectedAppointment({ date_time: format(currentDate, "yyyy-MM-dd'T'HH:mm:ss") });
        setModalOpen(true);
    };

    const handleEditAppointment = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setModalOpen(true);
    };

    const handleDeleteAppointment = async (appointmentId: string) => {
     if (window.confirm('Are you sure you want to delete this appointment?')) {
        try{
          await calendarService.deleteAppointment(appointmentId)
          setAppointments(prevAppointments => prevAppointments.filter(apt => apt.id !== appointmentId));
        } catch(error: any){
          setError(error.message || 'Failed to delete appointment');
          fetchAppointments();
        }
     }
    };

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const fetchedAppointments = await calendarService.getAllAppointments();
            setAppointments(fetchedAppointments);
            setError(null);
        } catch (error: any) {
            setError(error.message || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);


   const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedAppointment && selectedAppointment.id) {
        // Editing an existing appointment
        const updatedAppointment = await calendarService.updateAppointment(
          selectedAppointment.id,
          appointmentData
        );

      } else {
        // Adding a new appointment

        const newAppointment = await calendarService.createAppointment(appointmentData);

      }
      fetchAppointments();
      setModalOpen(false);
    } catch (error: any) {
      setError(error.message || "Failed to save appointment");
    }
  };


    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const appointment = appointments.find(apt => apt.id === active.id);
            if (appointment) {
                // Parse the over.id to a Date object
                const newDate = parseISO(over.id as string);

                // Check if newDate is valid
                if (isNaN(newDate.getTime())) {
                    console.error("Invalid date:", over.id);
                    return; // Exit if the date is invalid
                }
                // Extract current time from original date_time string
                const originalTime = appointment.date_time.split('T')[1];

                // Combine new date with original time, forming a complete ISO string
                const newDateTimeString = `${format(newDate, 'yyyy-MM-dd')}T${originalTime}`;


                const updatedAppointment: Partial<Appointment> = {
                    date_time: newDateTimeString,
                };

                // Update the appointment in the backend
                calendarService.updateAppointment(appointment.id, updatedAppointment)
                .then(() => {
                  // Optimistically update local state only after a successful backend update.
                  setAppointments((prevAppointments) =>
                      prevAppointments.map((apt) =>
                          apt.id === active.id ? { ...apt, ...updatedAppointment } : apt
                      )
                  );
                })
                .catch(error => {
                    console.error("Error updating appointment:", error);
                    setError(error.message || 'Failed to update appointment');
                    // Re-fetch appointments to revert the optimistic update on error.
                    fetchAppointments();
                });
            }
        }
    };


      const filteredAppointments = appointments.filter(apt => {
        const lead = leads.find(l => l.id === apt.lead_id);
        const name = lead ? lead.name : '';
        const phone = lead ? lead.phone_number: '';
        const email = lead ? lead.email: ''

        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (email && email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        phone.includes(searchQuery)
      });

      if (loading) {
        return <div className='p-4'>Loading appointments...</div>; // Simplified loading state
      }

      if (error) {
          return <div className='p-4 text-red-500'>Error: {error}</div>; // Simplified error state
      }

    return (
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border p-6`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Calendar
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevMonth}
                            className={`p-1 rounded-lg ${
                                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {format(currentDate, 'MMMM yyyy')}
                        </span>
                        <button
                            onClick={handleNextMonth}
                            className={`p-1 rounded-lg ${
                                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                        >
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                 <div className="flex items-center gap-4">
                   <div className="relative">
                     <input
                       type="text"
                       placeholder="Search appointments..."
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className={`pl-10 pr-4 py-2 ${
                         theme === 'dark'
                           ? 'bg-gray-700 border-gray-600 text-white'
                           : 'bg-gray-50 border-gray-300 text-gray-900'
                       } border rounded-lg w-64 placeholder-gray-400 focus:outline-none focus:border-indigo-500`}
                     />
                     <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                   </div>
                    <button
                        onClick={() => {
                            setSelectedAppointment(null);
                            setModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Appointment</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                        key={day}
                        className={`p-2 text-center ${
                            theme === 'dark'
                                ? 'bg-gray-700/50 text-gray-400'
                                : 'bg-gray-50 text-gray-600'
                        } font-medium text-sm`}
                    >
                        {day}
                    </div>
                ))}

                <DndContext onDragEnd={handleDragEnd}>
                    {days.map((date) => (
                         <CalendarCell
                         key={date.toString()}
                         date={date}
                         appointments={filteredAppointments}
                         isCurrentMonth={isSameMonth(date, currentDate)}
                         isToday={isSameDay(date, new Date())}
                         onAddAppointment={handleAddAppointment}
                         onEditAppointment={handleEditAppointment}
                         onDeleteAppointment={handleDeleteAppointment}
                         theme={theme}
                       />
                    ))}
                </DndContext>
            </div>

             <AppointmentModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedAppointment(null);
                }}
                appointment={selectedAppointment}
                onSave={handleSaveAppointment}
                theme={theme}
                leads={leads}
            />
        </div>
    );
}
