import React, { createContext, useState, useEffect } from 'react';
import initialData from '../data/data.json';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [employeePayments, setEmployeePayments] = useState([]);

  useEffect(() => {
    // Load initial mock data
    setServices(initialData.services);
    setEmployees(initialData.employees);
    setProducts(initialData.products);
    setAppointments(initialData.appointments);
    setProductSales(initialData.productSales || []);
    setEmployeePayments(initialData.employeePayments || []);
  }, []);

  // CRUD Operations for Appointments
  const addAppointment = (appointment) => {
    setAppointments([...appointments, { ...appointment, id: `a${Date.now()}` }]);
  };

  const updateAppointmentStatus = (id, newStatus, finalAmount = null, paymentMethod = null) => {
    setAppointments(appointments.map(app => 
      app.id === id ? { 
        ...app, 
        status: newStatus, 
        finalAmount: finalAmount !== null ? finalAmount : app.finalAmount,
        paymentMethod: paymentMethod !== null ? paymentMethod : app.paymentMethod
      } : app
    ));
  };

  // CRUD Operations for Products
  const addProduct = (product) => {
    setProducts([...products, { ...product, id: `p${Date.now()}` }]);
  };

  const updateProduct = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Sell Product Function
  const sellProduct = (productId, quantity, paymentMethod, clientName, employeeId) => {
    // Reduce stock
    setProducts(products.map(p => 
      p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
    ));

    // Calculate total amount based on current price
    const product = products.find(p => p.id === productId);
    const totalAmount = (product ? product.price : 0) * quantity;

    // Register sale
    const todayDate = new Date();
    const today = todayDate.getFullYear() + '-' + String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + String(todayDate.getDate()).padStart(2, '0');
    
    setProductSales([...productSales, {
      id: `sale${Date.now()}`,
      productId,
      quantity,
      totalAmount,
      paymentMethod,
      clientName,
      employeeId,
      date: today
    }]);
  };

  // CRUD for Employees
  const addEmployee = (employee) => {
    setEmployees([...employees, { ...employee, id: `e${Date.now()}` }]);
  };

  const updateEmployee = (updatedEmployee) => {
    setEmployees(employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
  };

  const deleteEmployee = (id) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  // Pay Employee Function
  const payEmployee = (workDate, employeeId, amount, paymentMethod) => {
    setEmployeePayments([...employeePayments, {
      id: `pay${Date.now()}`,
      workDate,
      employeeId,
      amount,
      paymentMethod,
      paidAt: new Date().toISOString()
    }]);
  };

  // CRUD for Services
  const addService = (service) => {
    setServices([...services, { ...service, id: `s${Date.now()}` }]);
  };

  const updateService = (updatedService) => {
    setServices(services.map(s => s.id === updatedService.id ? updatedService : s));
  };

  const deleteService = (id) => {
    setServices(services.filter(s => s.id !== id));
  };

  return (
    <AppContext.Provider value={{
      services, employees, products, appointments, productSales, employeePayments,
      addAppointment, updateAppointmentStatus,
      addProduct, updateProduct, deleteProduct, sellProduct,
      addEmployee, updateEmployee, deleteEmployee, payEmployee,
      addService, updateService, deleteService
    }}>
      {children}
    </AppContext.Provider>
  );
};
