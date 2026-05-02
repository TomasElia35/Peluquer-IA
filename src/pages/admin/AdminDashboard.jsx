import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Calendar, Package, Users, Scissors, DollarSign, TrendingUp, Target } from 'lucide-react';
import { TurnosView, ProductosView, EmpleadosView, ServiciosView } from '../reception/ReceptionDashboard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('estadisticas');

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex flex-col gap-2">
        <button onClick={() => setActiveTab('estadisticas')} className={`p-4 rounded-xl flex items-center gap-3 font-bold transition-all ${activeTab === 'estadisticas' ? 'bg-brand-gold text-white' : 'glass hover:bg-white/90 text-brand-coffee'}`}>
          <BarChart3 size={20} /> Estadísticas
        </button>
        <div className="h-px bg-gray-300 my-2"></div>
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
        {activeTab === 'estadisticas' && <EstadisticasView />}
        {activeTab === 'turnos' && <TurnosView isAdmin={true} />}
        {activeTab === 'productos' && <ProductosView />}
        {activeTab === 'empleados' && <EmpleadosView />}
        {activeTab === 'servicios' && <ServiciosView />}
      </main>
    </div>
  );
};

// --- Statistics View ---
const EstadisticasView = () => {
  const { appointments, services, employees } = useContext(AppContext);

  // Calculate Total Revenue
  const totalRevenue = appointments
    .filter(app => app.status === 'Finalizado')
    .reduce((sum, app) => sum + (app.finalAmount || 0), 0);

  // Most requested services
  const serviceCounts = appointments.reduce((acc, app) => {
    acc[app.serviceId] = (acc[app.serviceId] || 0) + 1;
    return acc;
  }, {});

  const serviceData = Object.keys(serviceCounts).map(serviceId => {
    const service = services.find(s => s.id === serviceId);
    return {
      name: service ? service.name : 'Desconocido',
      cantidad: serviceCounts[serviceId]
    };
  });

  // Employee Performance
  const employeeRevenue = appointments
    .filter(app => app.status === 'Finalizado')
    .reduce((acc, app) => {
      acc[app.employeeId] = (acc[app.employeeId] || 0) + (app.finalAmount || 0);
      return acc;
    }, {});

  const employeeData = Object.keys(employeeRevenue).map(empId => {
    const employee = employees.find(e => e.id === empId);
    return {
      name: employee ? employee.name : 'Desconocido',
      recaudacion: employeeRevenue[empId]
    };
  });

  const COLORS = ['#D4AF37', '#6F4E37', '#2C1E16', '#A08050'];

  return (
    <div>
      <h2 className="text-3xl font-bold font-serif mb-8 text-brand-dark">Panel de Control General</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass p-6 rounded-2xl border-l-4 border-l-brand-gold flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wide text-sm mb-1">Recaudación Total</p>
            <h3 className="text-4xl font-bold text-brand-dark">${totalRevenue}</h3>
          </div>
          <div className="bg-brand-beige p-4 rounded-full">
            <DollarSign size={24} className="text-brand-gold" />
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-l-4 border-l-brand-coffee flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wide text-sm mb-1">Turnos Totales</p>
            <h3 className="text-4xl font-bold text-brand-dark">{appointments.length}</h3>
          </div>
          <div className="bg-brand-beige p-4 rounded-full">
            <TrendingUp size={24} className="text-brand-coffee" />
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-l-4 border-l-brand-dark flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wide text-sm mb-1">Tasa de Finalización</p>
            <h3 className="text-4xl font-bold text-brand-dark">
              {appointments.length > 0 
                ? Math.round((appointments.filter(a => a.status === 'Finalizado').length / appointments.length) * 100) 
                : 0}%
            </h3>
          </div>
          <div className="bg-brand-beige p-4 rounded-full">
            <Target size={24} className="text-brand-dark" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-bold mb-6 text-center">Servicios Más Pedidos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="cantidad"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-bold mb-6 text-center">Recaudación por Profesional</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#F5F5DC'}} />
                <Bar dataKey="recaudacion" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
