import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { CheckCircle2, ChevronRight, ArrowLeft, Calendar as CalendarIcon, Clock, User as UserIcon } from 'lucide-react';

const ClientFlow = () => {
  const { services, employees, addAppointment } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    serviceId: null,
    employeeId: null,
    date: '',
    time: '',
    clientName: '',
    clientLastName: '',
    clientPhone: '',
    clientEmail: ''
  });
  const [appointmentCode, setAppointmentCode] = useState(null);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleServiceSelect = (id) => {
    setBookingData({ ...bookingData, serviceId: id });
    handleNext();
  };

  const handleEmployeeSelect = (id) => {
    setBookingData({ ...bookingData, employeeId: id });
    handleNext();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const code = `TUR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setAppointmentCode(code);
    
    addAppointment({
      ...bookingData,
      status: 'Solicitado',
      code
    });
    setStep(4);
  };

  // Mock available times
  const availableTimes = ["10:00", "11:00", "14:00", "15:30", "17:00"];

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Stepper Header */}
      {step < 4 && (
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-gold -z-10 transition-all duration-300" style={{ width: `${(step - 1) * 50}%` }}></div>
          
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 ${step >= s ? 'bg-brand-gold text-white border-white shadow-md' : 'bg-gray-200 text-gray-500 border-white'}`}>
              {s}
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Services */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold mb-6 text-center">¿Qué servicio buscas hoy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => (
              <div 
                key={service.id} 
                onClick={() => handleServiceSelect(service.id)}
                className="glass p-6 rounded-xl cursor-pointer hover:border-brand-gold hover:shadow-lg transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{service.name}</h3>
                  <span className="text-brand-gold font-bold">${service.price}</span>
                </div>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <Clock size={16} />
                  <span>{service.duration} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Professionals */}
      {step === 2 && (
        <div className="animate-fade-in">
          <div className="flex items-center mb-6">
            <button onClick={handleBack} className="text-brand-coffee hover:text-brand-dark p-2"><ArrowLeft /></button>
            <h2 className="text-3xl font-bold flex-1 text-center pr-8">Elige tu Profesional</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {employees.map(employee => (
              <div 
                key={employee.id} 
                onClick={() => handleEmployeeSelect(employee.id)}
                className="glass p-4 rounded-xl cursor-pointer hover:border-brand-gold hover:shadow-lg transition-all text-center group"
              >
                <img src={employee.photo} alt={employee.name} className="w-24 h-24 rounded-full mx-auto object-cover mb-4 border-2 border-transparent group-hover:border-brand-gold transition-colors" />
                <h3 className="text-xl font-bold">{employee.name} {employee.lastName}</h3>
                <p className="text-gray-500 text-sm">{employee.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: DateTime & Form */}
      {step === 3 && (
        <div className="animate-fade-in">
          <div className="flex items-center mb-6">
            <button onClick={handleBack} className="text-brand-coffee hover:text-brand-dark p-2"><ArrowLeft /></button>
            <h2 className="text-3xl font-bold flex-1 text-center pr-8">Completa tu Reserva</h2>
          </div>
          
          <form onSubmit={handleFormSubmit} className="glass p-8 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">Fecha y Hora</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horario Disponible</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map(time => (
                    <button
                      type="button"
                      key={time}
                      onClick={() => setBookingData({...bookingData, time})}
                      className={`p-2 rounded-lg text-sm border transition-colors ${bookingData.time === time ? 'bg-brand-gold text-white border-brand-gold' : 'border-gray-300 hover:border-brand-gold'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">Tus Datos</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" value={bookingData.clientName} onChange={(e) => setBookingData({...bookingData, clientName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input type="text" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" value={bookingData.clientLastName} onChange={(e) => setBookingData({...bookingData, clientLastName: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                <input type="tel" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" value={bookingData.clientPhone} onChange={(e) => setBookingData({...bookingData, clientPhone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" value={bookingData.clientEmail} onChange={(e) => setBookingData({...bookingData, clientEmail: e.target.value})} />
              </div>
            </div>

            <div className="md:col-span-2 pt-4 border-t">
              <button 
                type="submit" 
                disabled={!bookingData.date || !bookingData.time}
                className="w-full bg-brand-dark text-brand-beige py-4 rounded-lg font-bold text-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Reserva
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="animate-fade-in text-center glass p-12 rounded-2xl max-w-lg mx-auto">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-2">¡Reserva Confirmada!</h2>
          <p className="text-gray-600 mb-6">Hemos enviado los detalles a tu correo electrónico.</p>
          
          <div className="bg-brand-beige p-6 rounded-xl mb-8">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Tu código de turno</p>
            <p className="text-4xl font-bold text-brand-dark tracking-widest">{appointmentCode}</p>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-gray-200 text-brand-dark py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors" onClick={() => window.location.href='/'}>
              Volver al Inicio
            </button>
            <button className="w-full text-red-500 py-3 font-medium hover:bg-red-50 rounded-lg transition-colors" onClick={() => alert('Cancelación simulada con éxito')}>
              Cancelar Turno
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFlow;
