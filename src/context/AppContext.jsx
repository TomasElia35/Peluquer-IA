import React, { createContext, useState, useEffect } from 'react';
import initialData from '../data/data.json';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Load initial mock data
    setServices(initialData.services);
    setEmployees(initialData.employees);
    setProducts(initialData.products);
    setAppointments(initialData.appointments);
  }, []);

  // CRUD Operations for Appointments
  const addAppointment = (appointment) => {
    setAppointments([...appointments, { ...appointment, id: `a${Date.now()}` }]);
  };

  const updateAppointmentStatus = (id, newStatus, finalAmount = null) => {
    setAppointments(appointments.map(app => 
      app.id === id ? { ...app, status: newStatus, finalAmount: finalAmount !== null ? finalAmount : app.finalAmount } : app
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
      services, employees, products, appointments,
      addAppointment, updateAppointmentStatus,
      addProduct, updateProduct, deleteProduct,
      addEmployee, updateEmployee, deleteEmployee,
      addService, updateService, deleteService
    }}>
      {children}
    </AppContext.Provider>
  );
};
