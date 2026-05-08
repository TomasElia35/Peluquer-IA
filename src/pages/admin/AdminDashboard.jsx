import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Calendar, Package, Users, Scissors, DollarSign, TrendingUp, Target, Wallet } from 'lucide-react';
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
  const { appointments, services, employees, productSales } = useContext(AppContext);

  // Revenue & Commissions
  const finalizedAppointments = appointments.filter(app => app.status === 'Finalizado');
  
  const totalServiceRevenue = finalizedAppointments.reduce((sum, app) => sum + (app.finalAmount || 0), 0);
  const totalProductRevenue = productSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const grossRevenue = totalServiceRevenue + totalProductRevenue;

  // Commissions
  const totalServiceCommissions = finalizedAppointments.reduce((sum, app) => {
    const emp = employees.find(e => e.id === app.employeeId);
    if (!emp) return sum;
    return sum + (app.finalAmount || 0) * (emp.serviceCommissionRate || 0);
  }, 0);

  const totalProductCommissions = productSales.reduce((sum, sale) => {
    const emp = employees.find(e => e.id === sale.employeeId);
    if (!emp) return sum;
    return sum + (sale.totalAmount || 0) * (emp.productCommissionRate || 0);
  }, 0);

  const totalCommissions = totalServiceCommissions + totalProductCommissions;
  const netProfit = grossRevenue - totalCommissions;

  // Revenue Breakdown Data (Pie Chart)
  const revenueBreakdownData = [
    { name: 'Servicios', value: totalServiceRevenue },
    { name: 'Productos', value: totalProductRevenue }
  ];

  // Employee Performance & Commission Data (Bar Chart)
  const employeeStats = employees.map(emp => {
    const empAppointments = finalizedAppointments.filter(app => app.employeeId === emp.id);
    const empSales = productSales.filter(sale => sale.employeeId === emp.id);

    const empServiceRev = empAppointments.reduce((sum, app) => sum + (app.finalAmount || 0), 0);
    const empProductRev = empSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const empServiceComm = empServiceRev * (emp.serviceCommissionRate || 0);
    const empProductComm = empProductRev * (emp.productCommissionRate || 0);

    return {
      name: emp.name,
      ingresos: empServiceRev + empProductRev,
      comision: empServiceComm + empProductComm
    };
  });

  const COLORS = ['#D4AF37', '#6F4E37', '#2C1E16', '#A08050'];

  return (
    <div>
      <h2 className="text-3xl font-bold font-serif mb-8 text-brand-dark">Panel de Control General</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass p-6 rounded-2xl border-l-4 border-l-brand-gold flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wide text-xs mb-1">Recaudación Bruta</p>
            <h3 className="text-3xl font-bold text-brand-dark">${grossRevenue.toFixed(2)}</h3>
          </div>
          <div className="bg-brand-beige p-3 rounded-full">
            <DollarSign size={24} className="text-brand-gold" />
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-l-4 border-l-red-400 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wide text-xs mb-1">Comisiones a Pagar</p>
            <h3 className="text-3xl font-bold text-brand-dark">${totalCommissions.toFixed(2)}</h3>
          </div>
          <div className="bg-red-50 p-3 rounded-full">
            <Users size={24} className="text-red-400" />
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-l-4 border-l-green-500 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wide text-xs mb-1">Ganancia Neta</p>
            <h3 className="text-3xl font-bold text-green-700">${netProfit.toFixed(2)}</h3>
          </div>
          <div className="bg-green-50 p-3 rounded-full">
            <Wallet size={24} className="text-green-500" />
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-l-4 border-l-brand-coffee flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wide text-xs mb-1">Turnos Finalizados</p>
            <h3 className="text-3xl font-bold text-brand-dark">{finalizedAppointments.length}</h3>
          </div>
          <div className="bg-brand-beige p-3 rounded-full">
            <TrendingUp size={24} className="text-brand-coffee" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-bold mb-6 text-center">Ingresos: Servicios vs Productos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `$${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-bold mb-6 text-center">Rendimiento y Comisiones por Empleado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#F5F5DC'}} formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="ingresos" name="Ingresos Generados" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comision" name="Comisión a Pagar" fill="#6F4E37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
