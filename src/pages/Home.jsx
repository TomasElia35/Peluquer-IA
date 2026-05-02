import { Link } from 'react-router-dom';
import { User, Calendar, BarChart3, Scissors } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center mb-12">
        <Scissors size={48} className="mx-auto text-brand-gold mb-4" />
        <h1 className="text-4xl md:text-6xl font-bold mb-4">PeluquerIA</h1>
        <p className="text-lg text-brand-coffee">Selecciona un módulo para comenzar el testeo del MVP</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <Link to="/cliente" className="glass p-8 rounded-2xl hover:scale-105 transition-transform duration-300 flex flex-col items-center text-center group cursor-pointer border-t-4 border-t-brand-gold">
          <div className="bg-brand-beige p-4 rounded-full mb-6 group-hover:bg-brand-gold transition-colors">
            <User size={32} className="text-brand-dark group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Módulo Cliente</h2>
          <p className="text-gray-600">Reserva de turnos en pasos. Experiencia de usuario final.</p>
        </Link>

        <Link to="/recepcion" className="glass p-8 rounded-2xl hover:scale-105 transition-transform duration-300 flex flex-col items-center text-center group cursor-pointer border-t-4 border-t-brand-coffee">
          <div className="bg-brand-beige p-4 rounded-full mb-6 group-hover:bg-brand-coffee transition-colors">
            <Calendar size={32} className="text-brand-dark group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Módulo Recepción</h2>
          <p className="text-gray-600">Gestión de turnos, empleados, servicios y stock (CRUDs).</p>
        </Link>

        <Link to="/admin" className="glass p-8 rounded-2xl hover:scale-105 transition-transform duration-300 flex flex-col items-center text-center group cursor-pointer border-t-4 border-t-brand-dark">
          <div className="bg-brand-beige p-4 rounded-full mb-6 group-hover:bg-brand-dark transition-colors">
            <BarChart3 size={32} className="text-brand-dark group-hover:text-brand-gold transition-colors" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Módulo Admin</h2>
          <p className="text-gray-600">Panel de estadísticas, recaudación y desempeño general.</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;
