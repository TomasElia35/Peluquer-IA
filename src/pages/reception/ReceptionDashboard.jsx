import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Calendar, Package, Users, Scissors, Search, Edit2, Trash2, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';

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

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, appointmentId: null, suggestedAmount: 0 });
  const [paymentData, setPaymentData] = useState({ amount: '', method: 'Efectivo' });

  const handleStatusChange = (id, currentStatus) => {
    if (currentStatus === 'Solicitado') {
      updateAppointmentStatus(id, 'Aceptado');
    } else if (currentStatus === 'Aceptado' || currentStatus === 'En Proceso') {
      const app = appointments.find(a => a.id === id);
      const service = services.find(s => s.id === app?.serviceId);
      const suggestedAmount = service ? service.price : 0;
      
      setPaymentData({ amount: suggestedAmount, method: 'Efectivo' });
      setPaymentModal({ isOpen: true, appointmentId: id, suggestedAmount });
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (paymentModal.appointmentId) {
      updateAppointmentStatus(
        paymentModal.appointmentId, 
        'Finalizado', 
        parseFloat(paymentData.amount) || 0,
        paymentData.method
      );
    }
    setPaymentModal({ isOpen: false, appointmentId: null, suggestedAmount: 0 });
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
    // Reception: filter by selected date
    if (!isAdmin) {
      if (app.date !== filterDate) return false;
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
      {/* Modal de Pago */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in">
            <h3 className="text-xl font-bold font-serif mb-4">Finalizar Turno y Cobrar</h3>
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Monto Final ($)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand-gold bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">Sugerido por el servicio: ${paymentModal.suggestedAmount}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">Método de Pago</label>
                <select 
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand-gold bg-white"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Transferencia/MercadoPago">Transferencia / MercadoPago</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setPaymentModal({ isOpen: false, appointmentId: null, suggestedAmount: 0 })}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-brand-gold text-white font-bold rounded-lg hover:bg-yellow-600 transition"
                >
                  Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold font-serif">{isAdmin ? "Historial de Turnos" : filterDate === today ? "Turnos de Hoy" : `Turnos del ${filterDate}`}</h2>
        
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
          <div className="flex flex-wrap gap-2 items-center">
            <input 
              type="date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)}
              className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand-gold bg-white text-sm" 
            />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por cliente o código..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-brand-gold bg-white text-sm" 
              />
            </div>
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
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-green-700">${app.finalAmount}</span>
                        {app.paymentMethod && <span className="text-xs text-gray-500">{app.paymentMethod}</span>}
                      </div>
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
  const { products, employees, sellProduct, addProduct, updateProduct, deleteProduct } = useContext(AppContext);
  const [sellModal, setSellModal] = useState({ isOpen: false, productId: null, maxStock: 0, price: 0 });
  const [sellData, setSellData] = useState({ quantity: 1, paymentMethod: 'Efectivo', clientName: '', employeeId: '' });

  const [createModal, setCreateModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', brand: '', price: '', stock: '', minStock: '' });

  const [editModal, setEditModal] = useState({ isOpen: false, product: null });

  const handleSellSubmit = (e) => {
    e.preventDefault();
    if (sellModal.productId && sellData.employeeId) {
      sellProduct(sellModal.productId, parseInt(sellData.quantity), sellData.paymentMethod, sellData.clientName, sellData.employeeId);
    }
    setSellModal({ isOpen: false, productId: null, maxStock: 0, price: 0 });
    setSellData({ quantity: 1, paymentMethod: 'Efectivo', clientName: '', employeeId: '' });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    addProduct({
      name: newProduct.name,
      brand: newProduct.brand,
      price: parseFloat(newProduct.price) || 0,
      stock: parseInt(newProduct.stock) || 0,
      minStock: parseInt(newProduct.minStock) || 0
    });
    setCreateModal(false);
    setNewProduct({ name: '', brand: '', price: '', stock: '', minStock: '' });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateProduct(editModal.product.id, {
      ...editModal.product,
      price: parseFloat(editModal.product.price) || 0,
      stock: parseInt(editModal.product.stock) || 0,
      minStock: parseInt(editModal.product.minStock) || 0
    });
    setEditModal({ isOpen: false, product: null });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
      deleteProduct(id);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-serif">Inventario de Productos</h2>
        <button className="bg-brand-dark text-brand-beige px-4 py-2 rounded-lg font-bold hover:bg-black transition" onClick={() => setCreateModal(true)}>+ Nuevo Producto</button>
      </div>

      {/* Modal Nuevo Producto */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in">
            <h3 className="text-xl font-bold font-serif mb-4">Añadir Nuevo Producto</h3>
            <form onSubmit={handleCreateSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Marca</label>
                <input type="text" required value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Precio de Venta ($)</label>
                <input type="number" step="0.01" required min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
              </div>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Stock Inicial</label>
                  <input type="number" required min="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Stock Mínimo</label>
                  <input type="number" required min="0" value={newProduct.minStock} onChange={e => setNewProduct({...newProduct, minStock: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-gold text-white font-bold rounded-lg hover:bg-yellow-600">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Producto */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in">
            <h3 className="text-xl font-bold font-serif mb-4">Editar Producto</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                <input type="text" required value={editModal.product.name} onChange={e => setEditModal({ ...editModal, product: { ...editModal.product, name: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Marca</label>
                <input type="text" required value={editModal.product.brand} onChange={e => setEditModal({ ...editModal, product: { ...editModal.product, brand: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Precio de Venta ($)</label>
                <input type="number" step="0.01" required min="0" value={editModal.product.price} onChange={e => setEditModal({ ...editModal, product: { ...editModal.product, price: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
              </div>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Stock Inicial</label>
                  <input type="number" required min="0" value={editModal.product.stock} onChange={e => setEditModal({ ...editModal, product: { ...editModal.product, stock: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Stock Mínimo</label>
                  <input type="number" required min="0" value={editModal.product.minStock} onChange={e => setEditModal({ ...editModal, product: { ...editModal.product, minStock: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditModal({ isOpen: false, product: null })} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-gold text-white font-bold rounded-lg hover:bg-yellow-600">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sellModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in">
            <h3 className="text-xl font-bold font-serif mb-4">Vender Producto</h3>
            <form onSubmit={handleSellSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Cliente</label>
                <input 
                  type="text" required placeholder="Nombre del cliente"
                  value={sellData.clientName} onChange={e => setSellData({...sellData, clientName: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Profesional (Comisión)</label>
                <select required value={sellData.employeeId} onChange={e => setSellData({...sellData, employeeId: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none">
                  <option value="">Seleccione...</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} {emp.lastName}</option>)}
                </select>
              </div>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cant. (Max: {sellModal.maxStock})</label>
                  <input type="number" required min="1" max={sellModal.maxStock} value={sellData.quantity} onChange={e => setSellData({...sellData, quantity: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Total</label>
                  <div className="p-2 bg-gray-100 rounded-lg font-bold">${(sellData.quantity * sellModal.price).toFixed(2)}</div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">Método de Pago</label>
                <select value={sellData.paymentMethod} onChange={e => setSellData({...sellData, paymentMethod: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Transferencia/MercadoPago">Transferencia / MercadoPago</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setSellModal({ isOpen: false, productId: null, maxStock: 0, price: 0 })} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-gold text-white font-bold rounded-lg hover:bg-yellow-600">Confirmar Venta</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                {product.stock > 0 && (
                  <button onClick={() => setSellModal({ isOpen: true, productId: product.id, maxStock: product.stock, price: product.price })} className="text-brand-gold hover:text-yellow-600 mr-2" title="Vender">
                    <ShoppingCart size={16}/>
                  </button>
                )}
                <button onClick={() => setEditModal({ isOpen: true, product: { ...product } })} className="text-brand-coffee hover:text-brand-dark" title="Editar"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700" title="Eliminar"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EmpleadosView = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useContext(AppContext);
  const [createModal, setCreateModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', lastName: '', role: '', photo: '', serviceCommissionRate: '', productCommissionRate: '' });

  const [editModal, setEditModal] = useState({ isOpen: false, employee: null });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const defaultAvatar = `https://ui-avatars.com/api/?name=${newEmployee.name}+${newEmployee.lastName}&background=random`;
    addEmployee({
      name: newEmployee.name,
      lastName: newEmployee.lastName,
      role: newEmployee.role,
      photo: newEmployee.photo || defaultAvatar,
      serviceCommissionRate: (parseFloat(newEmployee.serviceCommissionRate) || 0) / 100,
      productCommissionRate: (parseFloat(newEmployee.productCommissionRate) || 0) / 100
    });
    setCreateModal(false);
    setNewEmployee({ name: '', lastName: '', role: '', photo: '', serviceCommissionRate: '', productCommissionRate: '' });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const defaultAvatar = `https://ui-avatars.com/api/?name=${editModal.employee.name}+${editModal.employee.lastName}&background=random`;
    updateEmployee(editModal.employee.id, {
      ...editModal.employee,
      photo: editModal.employee.photo || defaultAvatar,
      serviceCommissionRate: (parseFloat(editModal.employee.serviceCommissionRate) || 0) / 100,
      productCommissionRate: (parseFloat(editModal.employee.productCommissionRate) || 0) / 100
    });
    setEditModal({ isOpen: false, employee: null });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este empleado?')) {
      deleteEmployee(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-serif">Gestión de Personal</h2>
        <button className="bg-brand-dark text-brand-beige px-4 py-2 rounded-lg font-bold hover:bg-black transition" onClick={() => setCreateModal(true)}>+ Nuevo Empleado</button>
      </div>

      {/* Modal Nuevo Empleado */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in">
            <h3 className="text-xl font-bold font-serif mb-4">Añadir Nuevo Empleado</h3>
            <form onSubmit={handleCreateSubmit}>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                  <input type="text" required value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Apellido</label>
                  <input type="text" required value={newEmployee.lastName} onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Especialidad (Rol)</label>
                <input type="text" required value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="Ej: Barbero Senior" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Foto de Perfil (URL Opcional)</label>
                <input type="url" value={newEmployee.photo} onChange={e => setNewEmployee({...newEmployee, photo: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="https://..." />
              </div>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Comisión Serv. (%)</label>
                  <input type="number" required min="0" max="100" value={newEmployee.serviceCommissionRate} onChange={e => setNewEmployee({...newEmployee, serviceCommissionRate: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="Ej: 50" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Comisión Prod. (%)</label>
                  <input type="number" required min="0" max="100" value={newEmployee.productCommissionRate} onChange={e => setNewEmployee({...newEmployee, productCommissionRate: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="Ej: 15" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-gold text-white font-bold rounded-lg hover:bg-yellow-600">Guardar Empleado</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Empleado */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in">
            <h3 className="text-xl font-bold font-serif mb-4">Editar Empleado</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                  <input type="text" required value={editModal.employee.name} onChange={e => setEditModal({ ...editModal, employee: { ...editModal.employee, name: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Apellido</label>
                  <input type="text" required value={editModal.employee.lastName} onChange={e => setEditModal({ ...editModal, employee: { ...editModal.employee, lastName: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Especialidad (Rol)</label>
                <input type="text" required value={editModal.employee.role} onChange={e => setEditModal({ ...editModal, employee: { ...editModal.employee, role: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Foto de Perfil (URL Opcional)</label>
                <input type="url" value={editModal.employee.photo} onChange={e => setEditModal({ ...editModal, employee: { ...editModal.employee, photo: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
              </div>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Comisión Serv. (%)</label>
                  <input type="number" required min="0" max="100" value={editModal.employee.serviceCommissionRate} onChange={e => setEditModal({ ...editModal, employee: { ...editModal.employee, serviceCommissionRate: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Comisión Prod. (%)</label>
                  <input type="number" required min="0" max="100" value={editModal.employee.productCommissionRate} onChange={e => setEditModal({ ...editModal, employee: { ...editModal.employee, productCommissionRate: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditModal({ isOpen: false, employee: null })} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-gold text-white font-bold rounded-lg hover:bg-yellow-600">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-6 rounded-xl shadow-sm text-center relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditModal({ isOpen: true, employee: { ...emp, serviceCommissionRate: (emp.serviceCommissionRate || 0) * 100, productCommissionRate: (emp.productCommissionRate || 0) * 100 } })} className="text-brand-coffee hover:text-brand-dark"><Edit2 size={16}/></button>
              <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
            </div>
            <img src={emp.photo} alt={emp.name} className="w-20 h-20 rounded-full mx-auto object-cover mb-4 shadow-md" />
            <h3 className="font-bold text-xl">{emp.name} {emp.lastName}</h3>
            <p className="text-brand-gold font-medium mb-3">{emp.role}</p>
            <div className="bg-brand-light/30 rounded-lg p-3 text-sm text-left">
              <p className="flex justify-between border-b pb-1 mb-1 border-gray-200">
                <span className="text-gray-600">Comisión Servicios:</span>
                <span className="font-bold">{(emp.serviceCommissionRate * 100).toFixed(0)}%</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Comisión Productos:</span>
                <span className="font-bold">{(emp.productCommissionRate * 100).toFixed(0)}%</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ServiciosView = () => {
  const { services, addService, updateService, deleteService } = useContext(AppContext);
  const [createModal, setCreateModal] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '', duration: '', price: '' });

  const [editModal, setEditModal] = useState({ isOpen: false, service: null });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    addService({
      name: newService.name,
      description: newService.description,
      duration: parseInt(newService.duration) || 0,
      price: parseFloat(newService.price) || 0
    });
    setCreateModal(false);
    setNewService({ name: '', description: '', duration: '', price: '' });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateService(editModal.service.id, {
      ...editModal.service,
      duration: parseInt(editModal.service.duration) || 0,
      price: parseFloat(editModal.service.price) || 0
    });
    setEditModal({ isOpen: false, service: null });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este servicio?')) {
      deleteService(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-serif">Servicios Ofrecidos</h2>
        <button className="bg-brand-dark text-brand-beige px-4 py-2 rounded-lg font-bold hover:bg-black transition" onClick={() => setCreateModal(true)}>+ Nuevo Servicio</button>
      </div>

      {/* Modal Nuevo Servicio */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in">
            <h3 className="text-xl font-bold font-serif mb-4">Añadir Nuevo Servicio</h3>
            <form onSubmit={handleCreateSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Servicio</label>
                <input type="text" required value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción Breve</label>
                <input type="text" required value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
              </div>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Precio Base ($)</label>
                  <input type="number" required min="0" step="0.01" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Duración (min)</label>
                  <input type="number" required min="0" step="5" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-gold text-white font-bold rounded-lg hover:bg-yellow-600">Guardar Servicio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Servicio */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in">
            <h3 className="text-xl font-bold font-serif mb-4">Editar Servicio</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Servicio</label>
                <input type="text" required value={editModal.service.name} onChange={e => setEditModal({ ...editModal, service: { ...editModal.service, name: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción Breve</label>
                <input type="text" required value={editModal.service.description} onChange={e => setEditModal({ ...editModal, service: { ...editModal.service, description: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
              </div>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Precio Base ($)</label>
                  <input type="number" required min="0" step="0.01" value={editModal.service.price} onChange={e => setEditModal({ ...editModal, service: { ...editModal.service, price: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Duración (min)</label>
                  <input type="number" required min="0" step="5" value={editModal.service.duration} onChange={e => setEditModal({ ...editModal, service: { ...editModal.service, duration: e.target.value } })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditModal({ isOpen: false, service: null })} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-gold text-white font-bold rounded-lg hover:bg-yellow-600">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <button onClick={() => setEditModal({ isOpen: true, service: { ...srv } })} className="text-brand-coffee hover:text-brand-dark"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(srv.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceptionDashboard;
