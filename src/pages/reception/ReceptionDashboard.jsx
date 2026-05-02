import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Calendar, Package, Users, Scissors, Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const ReceptionDashboard = () => {
  const [activeTab, setActiveTab] = useState('turnos');

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex flex-col gap-2">
        <button onClick={() => setActiveTab('turnos')} className={`p-4 rounded-xl flex items-center gap-3 font-bold transition-all ${activeTab === 'turnos' ? 'bg-brand-dark text-brand-beige' : 'glass hover:bg-white/90 text-brand-coffee'}`}>
          <Calendar size={20} /> Turnos
        </button>
        <button onClick={() => setActiveTab('productos')} className={`p-4 rounded-xl flex items-center gap-3 font-bold transition-all ${activeTab === 'productos' ? 'bg-brand-dark text-brand-beige' : 'glass hover:bg-white/90 text-brand-coffee'}`}>
          <Package size={20} /> Productos
        </button>
        <button onClick={() => setActiveTab('empleados')} className={`p-4 rounded-xl flex items-center gap-3 font-bold transition-all ${activeTab === 'empleados' ? 'bg-brand-dark text-brand-beige' : 'glass hover:bg-white/90 text-brand-coffee'}`}>
          <Users size={20} /> Empleados
        </button>
        <button onClick={() => setActiveTab('servicios')} className={`p-4 rounded-xl flex items-center gap-3 font-bold transition-all ${activeTab === 'servicios' ? 'bg-brand-dark text-brand-beige' : 'glass hover:bg-white/90 text-brand-coffee'}`}>
          <Scissors size={20} /> Servicios
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 glass p-6 rounded-2xl animate-fade-in min-h-[60vh]">
        {activeTab === 'turnos' && <TurnosView />}
        {activeTab === 'productos' && <ProductosView />}
        {activeTab === 'empleados' && <EmpleadosView />}
        {activeTab === 'servicios' && <ServiciosView />}
      </main>
    </div>
  );
};

// --- Subviews ---

export const TurnosView = ({ isAdmin = false }) => {
  const { appointments, services, employees, updateAppointmentStatus } = useContext(AppContext);
  
  const todayDate = new Date();
  const today = todayDate.getFullYear() + '-' + String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + String(todayDate.getDate()).padStart(2, '0');

  const [filterDate, setFilterDate] = useState(isAdmin ? '' : today);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleStatusChange = (id, currentStatus) => {
    let newStatus = '';
    let finalAmount = null;

    if (currentStatus === 'Solicitado') newStatus = 'Aceptado';
    else if (currentStatus === 'Aceptado') newStatus = 'En Proceso';
    else if (currentStatus === 'En Proceso') {
      newStatus = 'Finalizado';
      const amountStr = prompt('Ingrese el monto final del trabajo:');
      if (amountStr === null) return; // User cancelled
      finalAmount = parseFloat(amountStr) || 0;
    }

    if (newStatus) {
      updateAppointmentStatus(id, newStatus, finalAmount);
    }
  };

  const handleCancel = (id) => {
    if (window.confirm('¿Seguro que deseas cancelar este turno?')) {
      updateAppointmentStatus(id, 'Cancelado');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Solicitado': 'bg-yellow-100 text-yellow-800',
      'Aceptado': 'bg-blue-100 text-blue-800',
      'En Proceso': 'bg-purple-100 text-purple-800',
      'Finalizado': 'bg-green-100 text-green-800',
      'Cancelado': 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status]}`}>{status}</span>;
  };

  const filteredAppointments = appointments.filter(app => {
    // Reception: only today
    if (!isAdmin) {
      if (app.date !== today) return false;
      if (searchTerm && !app.code.toLowerCase().includes(searchTerm.toLowerCase()) && !app.clientName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    } 
    // Admin: filters
    else {
      let match = true;
      if (filterDate && app.date !== filterDate) match = false;
      if (filterMonth && !app.date.startsWith(filterMonth)) match = false;
      if (filterEmployee && app.employeeId !== filterEmployee) match = false;
      return match;
    }
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold font-serif">{isAdmin ? "Historial de Turnos" : "Turnos de Hoy"}</h2>
        
        {isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <input 
              type="month" 
              value={filterMonth} 
              onChange={(e) => { setFilterMonth(e.target.value); setFilterDate(''); }}
              className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand-gold bg-white text-sm" 
            />
            <input 
              type="date" 
              value={filterDate} 
              onChange={(e) => { setFilterDate(e.target.value); setFilterMonth(''); }}
              className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand-gold bg-white text-sm" 
            />
            <select 
              value={filterEmployee} 
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand-gold bg-white text-sm"
            >
              <option value="">Todos los profesionales</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name} {e.lastName}</option>)}
            </select>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por cliente o código..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand-gold bg-white" 
            />
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-brand-beige">
              <th className="p-3 text-brand-coffee">Código</th>
              <th className="p-3 text-brand-coffee">Cliente</th>
              <th className="p-3 text-brand-coffee">Fecha y Hora</th>
              <th className="p-3 text-brand-coffee">Servicio</th>
              <th className="p-3 text-brand-coffee">Profesional</th>
              <th className="p-3 text-brand-coffee">Estado</th>
              <th className="p-3 text-brand-coffee">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? filteredAppointments.map(app => {
              const service = services.find(s => s.id === app.serviceId);
              const employee = employees.find(e => e.id === app.employeeId);
              return (
                <tr key={app.id} className="border-b border-gray-100 hover:bg-brand-light/50">
                  <td className="p-3 font-medium">{app.code}</td>
                  <td className="p-3">{app.clientName} {app.clientLastName}</td>
                  <td className="p-3">{app.date} <br/><span className="text-sm text-gray-500">{app.time}</span></td>
                  <td className="p-3">{service?.name}</td>
                  <td className="p-3">{employee?.name}</td>
                  <td className="p-3">{getStatusBadge(app.status)}</td>
                  <td className="p-3 flex gap-2">
                    {app.status !== 'Finalizado' && app.status !== 'Cancelado' && (
                      <>
                        <button onClick={() => handleStatusChange(app.id, app.status)} className="p-1.5 bg-brand-gold text-white rounded hover:bg-yellow-600 transition" title="Avanzar Estado">
                          <CheckCircle size={16} />
                        </button>
                        <button onClick={() => handleCancel(app.id)} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition" title="Cancelar">
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    {app.status === 'Finalizado' && (
                      <span className="text-sm font-bold text-green-700">${app.finalAmount}</span>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No se encontraron turnos para la fecha o filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ProductosView = () => {
  const { products, addProduct } = useContext(AppContext);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-serif">Inventario de Productos</h2>
        <button className="bg-brand-dark text-brand-beige px-4 py-2 rounded-lg font-bold hover:bg-black transition" onClick={() => alert('Abrir modal de nuevo producto (Mock)')}>+ Nuevo Producto</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className={`p-4 rounded-xl border-l-4 bg-white shadow-sm flex flex-col ${product.stock <= product.minStock ? 'border-red-500' : 'border-green-500'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.brand}</p>
              </div>
              <span className="font-bold text-brand-gold">${product.price}</span>
            </div>
            
            <div className="mt-auto pt-4 flex justify-between items-center">
              <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock <= product.minStock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                Stock: {product.stock} (Min: {product.minStock})
              </span>
              <div className="flex gap-2">
                <button className="text-brand-coffee hover:text-brand-dark"><Edit2 size={16}/></button>
                <button className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EmpleadosView = () => {
  const { employees } = useContext(AppContext);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-serif">Gestión de Personal</h2>
        <button className="bg-brand-dark text-brand-beige px-4 py-2 rounded-lg font-bold hover:bg-black transition" onClick={() => alert('Abrir modal de nuevo empleado (Mock)')}>+ Nuevo Empleado</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-6 rounded-xl shadow-sm text-center relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-brand-coffee hover:text-brand-dark"><Edit2 size={16}/></button>
              <button className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
            </div>
            <img src={emp.photo} alt={emp.name} className="w-20 h-20 rounded-full mx-auto object-cover mb-4 shadow-md" />
            <h3 className="font-bold text-xl">{emp.name} {emp.lastName}</h3>
            <p className="text-brand-gold font-medium">{emp.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ServiciosView = () => {
  const { services } = useContext(AppContext);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-serif">Servicios Ofrecidos</h2>
        <button className="bg-brand-dark text-brand-beige px-4 py-2 rounded-lg font-bold hover:bg-black transition" onClick={() => alert('Abrir modal de nuevo servicio (Mock)')}>+ Nuevo Servicio</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(srv => (
          <div key={srv.id} className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{srv.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{srv.description}</p>
              <span className="text-xs bg-brand-beige text-brand-dark px-2 py-1 rounded-full font-medium">{srv.duration} minutos</span>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className="text-xl font-bold text-brand-gold">${srv.price}</span>
              <div className="flex gap-2">
                <button className="text-brand-coffee hover:text-brand-dark"><Edit2 size={16}/></button>
                <button className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceptionDashboard;
