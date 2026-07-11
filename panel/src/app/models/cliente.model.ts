export interface Cliente {
  _id?: string;
  codigo: string;
  nombre: string;
  telefono: string;
  email: string;
  membresia: {
    activa: boolean;
    tipo: 'basica' | 'premium' | 'vip';
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
