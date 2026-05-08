import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { CheckCircle2, ChevronRight, ArrowLeft, Calendar as CalendarIcon, Clock, User as UserIcon } from 'lucide-react';

const ClientFlow = () => {
  const { services, employees, appointments, addAppointment } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  
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
  const [isSending, setIsSending] = useState(false);
  
  // PeluquerIA Match States
  const [aiMatchStep, setAiMatchStep] = useState('idle'); // 'idle', 'uploading', 'scanning', 'result'
  const [uploadedImage, setUploadedImage] = useState(null);

  // Load user from LocalStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('peluqueria_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrentUser(parsed);
      setBookingData(prev => ({...prev, ...parsed}));
    }
  }, []);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const userData = {
      clientName: bookingData.clientName,
      clientLastName: bookingData.clientLastName,
      clientPhone: bookingData.clientPhone,
      clientEmail: bookingData.clientEmail
    };
    localStorage.setItem('peluqueria_user', JSON.stringify(userData));
    setCurrentUser(userData);
    handleNext();
  };

  const getSuggestedProfessional = () => {
    if (!currentUser || !appointments) return null;
    const pastAppts = appointments.filter(a => a.clientEmail === currentUser.clientEmail);
    if (pastAppts.length === 0) return null;
    
    // Find most frequent employeeId
    const counts = pastAppts.reduce((acc, app) => {
      acc[app.employeeId] = (acc[app.employeeId] || 0) + 1;
      return acc;
    }, {});
    
    const suggestedId = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    return employees.find(e => e.id === suggestedId);
  };
  
  const suggestedEmployee = getSuggestedProfessional();

  const handleAiMatchUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      setAiMatchStep('uploading');
      setTimeout(() => {
        setAiMatchStep('scanning');
        setTimeout(() => {
          setAiMatchStep('result');
        }, 3000);
      }, 500);
    }
  };

  const resetAiMatch = () => {
    setAiMatchStep('idle');
    setUploadedImage(null);
  };

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
    setIsSending(true);
    
    setTimeout(() => {
      const code = `TUR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setAppointmentCode(code);
      
      addAppointment({
        ...bookingData,
        status: 'Solicitado',
        code
      });
      setIsSending(false);
      setStep(5);
    }, 2000);
  };

  // Mock available times
  const availableTimes = ["10:00", "11:00", "14:00", "15:30", "17:00"];

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Stepper Header */}
      {step > 1 && step < 5 && (
        <div className="flex justify-between items-center mb-8 relative px-4">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-10"></div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-brand-gold -z-10 transition-all duration-300" style={{ width: `calc(${(step - 2) * 50}% - 1rem)` }}></div>
          
          {[2, 3, 4].map((s, index) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 ${step >= s ? 'bg-brand-gold text-white border-white shadow-md' : 'bg-gray-200 text-gray-500 border-white'}`}>
              {index + 1}
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Auth / Login */}
      {step === 1 && (
        <div className="animate-fade-in max-w-md mx-auto">
          {currentUser ? (
            <div className="glass p-8 rounded-2xl text-center">
              <UserIcon size={64} className="text-brand-gold mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">¡Hola de nuevo, {currentUser.clientName}!</h2>
              <p className="text-gray-600 mb-8">Qué bueno verte. ¿Listo para tu próximo corte?</p>
              <button onClick={handleNext} className="w-full bg-brand-dark text-brand-beige py-4 rounded-lg font-bold text-lg hover:bg-black transition-colors">
                Comenzar Reserva
              </button>
              <button onClick={() => { localStorage.removeItem('peluqueria_user'); setCurrentUser(null); setBookingData({ serviceId: null, employeeId: null, date: '', time: '', clientName: '', clientLastName: '', clientPhone: '', clientEmail: '' }); }} className="mt-4 text-gray-500 text-sm hover:underline">
                ¿No eres {currentUser.clientName}? Iniciar con otra cuenta
              </button>
            </div>
          ) : (
            <div className="glass p-8 rounded-2xl">
              <h2 className="text-3xl font-bold mb-2 text-center">Bienvenido</h2>
              <p className="text-gray-600 mb-6 text-center">Ingresa tus datos para agilizar tus reservas futuras.</p>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input type="text" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none bg-white" value={bookingData.clientName} onChange={(e) => setBookingData({...bookingData, clientName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input type="text" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none bg-white" value={bookingData.clientLastName} onChange={(e) => setBookingData({...bookingData, clientLastName: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input type="email" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none bg-white" value={bookingData.clientEmail} onChange={(e) => setBookingData({...bookingData, clientEmail: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                  <input type="tel" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none bg-white" value={bookingData.clientPhone} onChange={(e) => setBookingData({...bookingData, clientPhone: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-brand-dark text-brand-beige py-4 rounded-lg font-bold mt-4 hover:bg-black transition-colors">
                  Continuar
                </button>
                <div className="mt-4 text-center">
                  <button type="button" className="text-sm text-gray-500 hover:text-brand-gold transition border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-center gap-2 w-full bg-white">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Continuar con Google (Próximamente)
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Services */}
      {step === 2 && (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold mb-6 text-center">¿Qué servicio buscas hoy?</h2>

          {/* PeluquerIA Match Feature */}
          <div className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-gold bg-[length:200%_auto] animate-gradient shadow-lg">
            <div className="bg-white rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold font-serif mb-2 flex items-center justify-center gap-2">
                <span className="text-brand-gold">✨</span> PeluquerIA Match
              </h3>
              
              {aiMatchStep === 'idle' && (
                <>
                  <p className="text-gray-600 mb-4">¿No sabes qué estilo elegir? Sube una foto tuya y nuestra Inteligencia Artificial te recomendará el mejor corte según la forma de tu rostro.</p>
                  <label className="inline-block bg-brand-dark text-brand-beige px-6 py-3 rounded-lg font-bold hover:bg-black transition-colors cursor-pointer">
                    Subir mi foto
                    <input type="file" accept="image/*" className="hidden" onChange={handleAiMatchUpload} />
                  </label>
                </>
              )}

              {(aiMatchStep === 'uploading' || aiMatchStep === 'scanning') && (
                <div className="flex flex-col items-center">
                  <p className="text-brand-gold font-bold mb-4 animate-pulse">Analizando facciones...</p>
                  <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-4 border-gray-100">
                    <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                    {aiMatchStep === 'scanning' && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold shadow-[0_0_15px_#D4AF37] animate-[scan_1.5s_ease-in-out_infinite_alternate]"></div>
                    )}
                  </div>
                </div>
              )}

              {aiMatchStep === 'result' && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-center gap-6 mb-4">
                    <img src={uploadedImage} alt="Tu foto" className="w-24 h-24 rounded-full object-cover border-4 border-brand-gold" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Resultado del Análisis</p>
                      <p className="text-xl font-bold">Rostro Ovalado / Diamante</p>
                    </div>
                  </div>
                  <div className="bg-brand-light/30 p-4 rounded-xl border border-brand-gold/20 mb-6">
                    <p className="font-medium text-brand-dark">La IA te recomienda: <span className="font-bold">{services[0]?.name || 'Corte Clásico'}</span></p>
                    <p className="text-sm text-gray-600 mt-1">Este estilo equilibra las proporciones de tu rostro y resalta tus facciones naturales.</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button onClick={resetAiMatch} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold transition">
                      Intentar con otra foto
                    </button>
                    <button onClick={() => handleServiceSelect(services[0]?.id)} className="px-6 py-2 bg-brand-gold text-white rounded-lg hover:bg-yellow-600 font-bold transition shadow-md">
                      ¡Quiero este look!
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-gray-200 flex-1"></div>
            <p className="text-gray-500 font-medium">O elige manualmente del catálogo</p>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

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

      {/* Step 3: Professionals */}
      {step === 3 && (
        <div className="animate-fade-in">
          <div className="flex items-center mb-6">
            <button onClick={handleBack} className="text-brand-coffee hover:text-brand-dark p-2"><ArrowLeft /></button>
            <h2 className="text-3xl font-bold flex-1 text-center pr-8">Elige tu Profesional</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Suggested Professional Section */}
            {suggestedEmployee && (
              <div className="col-span-full mb-4 animate-fade-in">
                <div className="bg-brand-light/30 border border-brand-gold/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={suggestedEmployee.photo} alt={suggestedEmployee.name} className="w-16 h-16 rounded-full object-cover border-2 border-brand-gold" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-gold bg-white px-2 py-1 rounded-full shadow-sm mb-1 inline-block">Profesional Sugerido</span>
                      <h3 className="font-bold text-lg">{suggestedEmployee.name} {suggestedEmployee.lastName}</h3>
                      <p className="text-sm text-gray-600">Te has atendido con él anteriormente.</p>
                    </div>
                  </div>
                  <button onClick={() => handleEmployeeSelect(suggestedEmployee.id)} className="bg-brand-gold text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-600 transition">
                    Seleccionar
                  </button>
                </div>
              </div>
            )}

            {employees.filter(e => e.id !== suggestedEmployee?.id).map(employee => (
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

      {/* Step 4: DateTime & Form */}
      {step === 4 && (
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
                disabled={!bookingData.date || !bookingData.time || isSending}
                className="w-full bg-brand-dark text-brand-beige py-4 rounded-lg font-bold text-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-brand-beige border-t-transparent rounded-full animate-spin"></div>
                    Enviando confirmación al correo...
                  </>
                ) : (
                  "Confirmar Reserva"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
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
