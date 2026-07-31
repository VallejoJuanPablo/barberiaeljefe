export interface Cliente {
  _id?: string;
  codigo: string;
  nombre: string;
  telefono: string;
  email: string;
  membresia: {
    activa: boolean;
    tipo: string;
    fechaInicio: string;
    fechaFin: string;
  };
  createdAt?: string;
}

export interface MembresiaCheck {
  activo: boolean;
  nombre: string;
  tipo: string;
  fechaFin: string;
  mensaje: string;
}

export interface Beneficio {
  categoria: string;
  icono: string;
  items: string[];
}

export interface Membresia {
  _id?: string;
  nombre: string;
  precio: number;
  incluye: string[];
  beneficios: Beneficio[];
  descripcion: string;
  activa: boolean;
  createdAt?: string;
}
