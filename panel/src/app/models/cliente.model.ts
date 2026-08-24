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

export interface Beneficio {
  _id?: string;
  nombre: string;
  categoria: string;
  icono: string;
  codigo: string;
  activo: boolean;
  createdAt?: string;
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

export interface BeneficioAgrupado {
  categoria: string;
  icono: string;
  items: { nombre: string; codigo: string | null }[];
}

export interface MembresiaCheck {
  activo: boolean;
  nombre: string;
  tipo: string;
  fechaFin: string;
  mensaje: string;
  plan: {
    precio: number;
    incluye: string[];
    beneficios: BeneficioAgrupado[];
    descripcion: string;
  } | null;
}
