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
  empresaId?: string | null;
  deletedAt?: string | null;
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

export interface Marca {
  _id?: string;
  nombre: string;
  logo: string;
  instagram: string;
  activa: boolean;
  orden: number;
  createdAt?: string;
}

export interface BeneficioAgrupado {
  categoria: string;
  icono: string;
  items: { nombre: string; codigo: string | null }[];
}

export interface BeneficioRelampago {
  _id?: string;
  titulo: string;
  descripcion: string;
  fechaDesde: string;
  fechaHasta: string;
  activa: boolean;
  createdAt?: string;
}

export interface Empresa {
  _id?: string;
  codigo: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  membresiaId: string | Membresia;
  pack: number;
  precioMensual: number;
  estado: 'activa' | 'suspendida' | 'baja';
  fechaAlta: string;
  ultimoPago: string | null;
  asignados?: number;
  createdAt?: string;
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
