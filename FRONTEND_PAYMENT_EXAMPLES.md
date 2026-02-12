# 🔧 Ejemplos de Código Frontend - Flujo de Pagos

## 📋 Tabla de Contenidos
1. [Validaciones de Tarjeta](#validaciones-de-tarjeta)
2. [Validaciones de Reserva](#validaciones-de-reserva)
3. [Llamadas API](#llamadas-api)
4. [Manejo de Errores](#manejo-de-errores)
5. [Estados y Componentes](#estados-y-componentes)
6. [Ejemplos Completos](#ejemplos-completos)

---

## ✅ Validaciones de Tarjeta

### **Validar Número de Tarjeta**
```typescript
/**
 * Valida que el número de tarjeta sea válido
 * @param numeroTarjeta - Número de tarjeta (puede incluir espacios)
 * @returns boolean
 */
export const validarNumeroTarjeta = (numeroTarjeta: string): boolean => {
  // Remover espacios y caracteres especiales
  const numero = numeroTarjeta.replace(/\s/g, '');
  
  // Debe ser 16 dígitos (algunos pueden ser 15, pero usamos 16)
  if (!/^\d{16}$/.test(numero)) {
    return false;
  }
  
  // Algoritmo de Luhn para validar
  return algoritmoLuhn(numero);
};

/**
 * Implementación del algoritmo de Luhn
 */
const algoritmoLuhn = (numero: string): boolean => {
  let suma = 0;
  let esDoble = false;
  
  for (let i = numero.length - 1; i >= 0; i--) {
    let digito = parseInt(numero.charAt(i), 10);
    
    if (esDoble) {
      digito *= 2;
      if (digito > 9) {
        digito -= 9;
      }
    }
    
    suma += digito;
    esDoble = !esDoble;
  }
  
  return suma % 10 === 0;
};

/**
 * Detecta el tipo de tarjeta por el primer dígito
 */
export const detectarTipoTarjeta = (numeroTarjeta: string): 'Visa' | 'Mastercard' | 'Amex' | 'Desconocida' => {
  const numero = numeroTarjeta.replace(/\s/g, '');
  
  if (/^4/.test(numero)) return 'Visa';
  if (/^5[1-5]/.test(numero)) return 'Mastercard';
  if (/^3[47]/.test(numero)) return 'Amex';
  
  return 'Desconocida';
};
```

### **Validar Fecha de Caducidad**
```typescript
/**
 * Valida que la fecha no esté expirada
 * @param fechaCaducidad - Formato MM/YY
 * @returns boolean
 */
export const validarFechaCaducidad = (fechaCaducidad: string): boolean => {
  // Formato: MM/YY
  if (!/^\d{2}\/\d{2}$/.test(fechaCaducidad)) {
    return false;
  }
  
  const [mes, año] = fechaCaducidad.split('/');
  const mesNum = parseInt(mes, 10);
  const añoNum = parseInt(año, 10);
  
  // Validar mes
  if (mesNum < 1 || mesNum > 12) {
    return false;
  }
  
  // Convertir año de 2 dígitos a 4 dígitos
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1;
  const añoActual = fechaActual.getFullYear() % 100;
  
  // Si el año es menor que el actual, está expirada
  if (añoNum < añoActual) {
    return false;
  }
  
  // Si es el mismo año, verificar mes
  if (añoNum === añoActual && mesNum < mesActual) {
    return false;
  }
  
  return true;
};

/**
 * Formatea la entrada de fecha de caducidad
 * Convierte "1225" en "12/25"
 */
export const formatearFechaCaducidad = (input: string): string => {
  const cleaned = input.replace(/\D/g, '');
  
  if (cleaned.length <= 2) {
    return cleaned;
  }
  
  return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
};
```

### **Validar CVC**
```typescript
/**
 * Valida el CVC (3-4 dígitos)
 * @param cvc - Código de validación
 * @returns boolean
 */
export const validarCvc = (cvc: string): boolean => {
  // Remover espacios
  const cleaned = cvc.trim();
  
  // Debe ser 3 o 4 dígitos
  return /^\d{3,4}$/.test(cleaned);
};
```

### **Validar Nombre**
```typescript
/**
 * Valida que el nombre no esté vacío
 * @param nombre - Nombre completo
 * @returns boolean
 */
export const validarNombre = (nombre: string): boolean => {
  // Mínimo 3 caracteres, máximo 50
  // Sólo letras, espacios y algunos caracteres especiales
  return nombre.trim().length >= 3 && 
         nombre.trim().length <= 50 &&
         /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/.test(nombre);
};
```

### **Validación Completa de Tarjeta**
```typescript
/**
 * Interfaz con errores de validación
 */
interface ErroresTarjeta {
  numeroTarjeta?: string;
  fechaCaducidad?: string;
  cvc?: string;
  nombre?: string;
}

/**
 * Valida todos los campos de tarjeta a la vez
 */
export const validarFormularioTarjeta = (
  numeroTarjeta: string,
  fechaCaducidad: string,
  cvc: string,
  nombre: string
): { valido: boolean; errores: ErroresTarjeta } => {
  
  const errores: ErroresTarjeta = {};
  
  // Validar número de tarjeta
  if (!numeroTarjeta || !validarNumeroTarjeta(numeroTarjeta)) {
    errores.numeroTarjeta = 'Número de tarjeta inválido';
  }
  
  // Validar fecha
  if (!fechaCaducidad || !validarFechaCaducidad(fechaCaducidad)) {
    errores.fechaCaducidad = 'Fecha de caducidad inválida o expirada';
  }
  
  // Validar CVC
  if (!cvc || !validarCvc(cvc)) {
    errores.cvc = 'CVC debe ser 3 o 4 dígitos';
  }
  
  // Validar nombre
  if (!nombre || !validarNombre(nombre)) {
    errores.nombre = 'Nombre debe tener entre 3 y 50 caracteres';
  }
  
  return {
    valido: Object.keys(errores).length === 0,
    errores
  };
};
```

---

## ✅ Validaciones de Reserva

### **Validar Fecha de Reserva**
```typescript
/**
 * Valida que la fecha de reserva sea válida
 * - No puede ser en el pasado
 * - No puede ser hoy
 * - Debe ser >= mañana
 */
export const validarFechaReserva = (fechaReserva: string): { valido: boolean; error?: string } => {
  const fecha = new Date(fechaReserva);
  const hoy = new Date();
  
  // Poner ambas fechas a medianoche para comparación correcta
  hoy.setHours(0, 0, 0, 0);
  fecha.setHours(0, 0, 0, 0);
  
  // Mañana
  const mañana = new Date(hoy);
  mañana.setDate(mañana.getDate() + 1);
  
  if (fecha < mañana) {
    return {
      valido: false,
      error: 'La fecha debe ser como mínimo mañana'
    };
  }
  
  // Máximo 30 días en el futuro
  const maximo = new Date(hoy);
  maximo.setDate(maximo.getDate() + 30);
  
  if (fecha > maximo) {
    return {
      valido: false,
      error: 'Sólo puedes reservar con 30 días de anticipación'
    };
  }
  
  return { valido: true };
};
```

### **Validar Hora de Reserva**
```typescript
/**
 * Valida que la hora sea múltiplo de 5 minutos
 * Ej: 10:00, 10:05, 10:10, etc.
 */
export const validarHoraReserva = (horaInicio: string): { valido: boolean; error?: string } => {
  const [horas, minutos] = horaInicio.split(':').map(Number);
  
  if (isNaN(horas) || isNaN(minutos)) {
    return {
      valido: false,
      error: 'Formato de hora inválido'
    };
  }
  
  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
    return {
      valido: false,
      error: 'Hora fuera de rango'
    };
  }
  
  if (minutos % 5 !== 0) {
    return {
      valido: false,
      error: 'La hora debe ser múltiplo de 5 minutos (10:00, 10:05, 10:10, etc.)'
    };
  }
  
  return { valido: true };
};

/**
 * Formatea la hora a HH:MM
 */
export const formatearHora = (input: string): string => {
  const cleaned = input.replace(/\D/g, '');
  
  if (cleaned.length <= 2) {
    return cleaned;
  }
  
  return cleaned.substring(0, 2) + ':' + cleaned.substring(2, 4);
};
```

### **Validar Selección de Productos**
```typescript
/**
 * Tipos de categoría
 */
enum CategoriaProducto {
  CORTE_PELO = 1,
  CORTE_BARBA = 2,
  DEPILACION = 3,
  AFEITADO = 4,
  OTROS = 5
}

interface Producto {
  id: number;
  nombre: string;
  categoriaId: number;
  duracion: number;
  precio: number;
}

/**
 * Valida que no haya duplicados de categoría
 */
export const validarCategoriasProductos = (
  productos: Producto[]
): { valido: boolean; error?: string } => {
  
  const conteoPorCategoria = new Map<number, number>();
  
  // Contar productos por categoría
  for (const producto of productos) {
    const actual = conteoPorCategoria.get(producto.categoriaId) || 0;
    conteoPorCategoria.set(producto.categoriaId, actual + 1);
  }
  
  // Verificar límites
  if ((conteoPorCategoria.get(CategoriaProducto.CORTE_PELO) || 0) > 1) {
    return {
      valido: false,
      error: 'Puedes seleccionar máximo 1 "Corte de pelo"'
    };
  }
  
  if ((conteoPorCategoria.get(CategoriaProducto.CORTE_BARBA) || 0) > 1) {
    return {
      valido: false,
      error: 'Puedes seleccionar máximo 1 "Corte de barba"'
    };
  }
  
  if ((conteoPorCategoria.get(CategoriaProducto.AFEITADO) || 0) > 1) {
    return {
      valido: false,
      error: 'Puedes seleccionar máximo 1 "Afeitado clásico"'
    };
  }
  
  return { valido: true };
};

/**
 * Valida selección general de productos
 */
export const validarSeleccionProductos = (
  productoIds: number[],
  productos: Producto[]
): { valido: boolean; error?: string } => {
  
  if (!productoIds || productoIds.length === 0) {
    return {
      valido: false,
      error: 'Debes seleccionar al menos un servicio'
    };
  }
  
  // Verificar que todos los productos existan
  const productosSeleccionados = productos.filter(p => productoIds.includes(p.id));
  
  if (productosSeleccionados.length !== productoIds.length) {
    return {
      valido: false,
      error: 'Alguno de los productos seleccionados no existe'
    };
  }
  
  // Validar categorías
  const validacionCategorias = validarCategoriasProductos(productosSeleccionados);
  if (!validacionCategorias.valido) {
    return validacionCategorias;
  }
  
  return { valido: true };
};
```

---

## 🌐 Llamadas API

### **Servicio de API para Pagos**
```typescript
/**
 * Interfaz para la respuesta del servidor
 */
interface ApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Servicio centralizado para llamadas a API
 */
export class PagoService {
  private baseUrl = 'http://localhost:8080/api';
  
  /**
   * Calcula el carrito antes de hacer la reserva
   */
  async calcularCarrito(
    peluqueriaId: number,
    productoIds: number[],
    token: string
  ): Promise<{ duracionTotal: number; precioTotal: number } | null> {
    
    try {
      const response = await fetch(`${this.baseUrl}/carrito/calcular`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          peluqueriaId,
          productoIds
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al calcular carrito');
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Error en calcularCarrito:', error);
      return null;
    }
  }
  
  /**
   * Crea una reserva con pago
   */
  async crearReservaConPago(
    reservaData: {
      clienteId: number;
      peluqueriaId: number;
      diaSemana: number;
      fechaReserva: string;
      horaInicio: string;
      productoIds: number[];
    },
    tarjetaData: {
      numeroTarjeta: string;
      fechaCaducidad: string;
      cvc: string;
      nombreCompleto: string;
    },
    token: string
  ): Promise<{ success: boolean; reserva?: any; error?: string }> {
    
    try {
      const response = await fetch(`${this.baseUrl}/reservas/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          reserva: reservaData,
          origen: tarjetaData
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Error al crear reserva'
        };
      }
      
      return {
        success: true,
        reserva: data
      };
      
    } catch (error) {
      console.error('Error en crearReservaConPago:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }
  
  /**
   * Confirma suscripción a peluquería con pago
   */
  async confirmarSuscripcionPeluqueria(
    solicitudId: number,
    tarjetaData: {
      numeroTarjeta: string;
      fechaCaducidad: string;
      cvc: string;
      nombreCompleto: string;
    },
    token: string
  ): Promise<{ success: boolean; solicitud?: any; error?: string }> {
    
    try {
      const response = await fetch(
        `${this.baseUrl}/solicitudes/confirmar/${solicitudId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'token': token
          },
          body: JSON.stringify(tarjetaData)
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Error al confirmar suscripción'
        };
      }
      
      return {
        success: true,
        solicitud: data
      };
      
    } catch (error) {
      console.error('Error en confirmarSuscripcionPeluqueria:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }
  
  /**
   * Obtiene reservas del cliente
   */
  async obtenerReservasCliente(
    clienteId: number,
    token: string
  ): Promise<any[] | null> {
    
    try {
      const response = await fetch(
        `${this.baseUrl}/reservas/cliente/${clienteId}`,
        {
          method: 'GET',
          headers: {
            'token': token
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Error al obtener reservas');
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Error en obtenerReservasCliente:', error);
      return null;
    }
  }
}
```

---

## 🚨 Manejo de Errores

### **Tipos de Error**
```typescript
/**
 * Tipos de error que puede retornar el servidor
 */
enum TipoError {
  VALIDACION = 400,
  NO_AUTENTICADO = 401,
  NO_AUTORIZADO = 403,
  NO_ENCONTRADO = 404,
  CONFLICTO = 409,
  ERROR_PAGO = 422,
  ERROR_SERVIDOR = 500
}

/**
 * Estructura de error del servidor
 */
interface ErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

/**
 * Traduce errores del servidor a mensajes para el usuario
 */
export const traducirErrorPago = (error: ErrorResponse | string): string => {
  
  if (typeof error === 'string') {
    return error;
  }
  
  const message = error.message || '';
  
  // Errores de validación comunes
  if (message.includes('fecha') && message.includes('pasada')) {
    return 'La fecha no puede ser en el pasado';
  }
  
  if (message.includes('minuto')) {
    return 'La hora debe ser múltiplo de 5 minutos';
  }
  
  if (message.includes('categoría')) {
    return 'No puedes seleccionar múltiples servicios de la misma categoría';
  }
  
  if (message.includes('solapamiento')) {
    return 'Ese horario ya está reservado';
  }
  
  if (message.includes('horario')) {
    return 'La peluquería no está abierta a esa hora';
  }
  
  if (message.includes('tarjeta')) {
    return 'Error con la tarjeta de crédito';
  }
  
  if (message.includes('banco')) {
    return 'Error al procesar el pago con el banco';
  }
  
  if (message.includes('autorizado')) {
    return 'No tienes permiso para realizar esta acción';
  }
  
  if (message.includes('autenticado')) {
    return 'Debes iniciar sesión para continuar';
  }
  
  return 'Algo salió mal. Intenta nuevamente.';
};

/**
 * Manejo de errores por tipo
 */
export const manejarErrorPago = (status: number, data: any): void => {
  
  switch (status) {
    case 400:
    case 422:
      // Error de validación
      const errores = data.errors || {};
      console.error('Errores de validación:', errores);
      // Mostrar errores específicos por campo
      break;
      
    case 401:
      // No autenticado
      console.error('No autenticado');
      // Redirigir a login
      localStorage.removeItem('token');
      window.location.href = '/login';
      break;
      
    case 403:
      // No autorizado
      console.error('No autorizado');
      // Mostrar mensaje de acceso denegado
      break;
      
    case 404:
      // No encontrado
      console.error('Recurso no encontrado');
      break;
      
    case 500:
      // Error del servidor
      console.error('Error del servidor');
      // Mostrar mensaje genérico y opción de reintentar
      break;
      
    default:
      console.error('Error desconocido:', status, data);
  }
};
```

---

## 🎨 Estados y Componentes

### **Hook personalizado para formulario de pago**
```typescript
import { useState } from 'react';

interface EstadoFormularioPago {
  numeroTarjeta: string;
  fechaCaducidad: string;
  cvc: string;
  nombreCompleto: string;
  procesando: boolean;
  error: string | null;
  exito: boolean;
}

/**
 * Hook para manejar el estado del formulario de pago
 */
export const useFormularioPago = () => {
  const [estado, setEstado] = useState<EstadoFormularioPago>({
    numeroTarjeta: '',
    fechaCaducidad: '',
    cvc: '',
    nombreCompleto: '',
    procesando: false,
    error: null,
    exito: false
  });
  
  const actualizarCampo = (campo: string, valor: string) => {
    setEstado(prev => ({
      ...prev,
      [campo]: valor,
      error: null // Limpiar error al editar
    }));
  };
  
  const formatearNumeroTarjeta = (valor: string) => {
    const cleaned = valor.replace(/\s/g, '');
    const grupos = cleaned.match(/.{1,4}/g) || [];
    return grupos.join(' ').substring(0, 19);
  };
  
  const establecerError = (mensaje: string) => {
    setEstado(prev => ({
      ...prev,
      error: mensaje,
      procesando: false
    }));
  };
  
  const establecerProcesando = (procesando: boolean) => {
    setEstado(prev => ({
      ...prev,
      procesando
    }));
  };
  
  const establecerExito = (exito: boolean) => {
    setEstado(prev => ({
      ...prev,
      exito,
      procesando: false
    }));
  };
  
  const limpiar = () => {
    setEstado({
      numeroTarjeta: '',
      fechaCaducidad: '',
      cvc: '',
      nombreCompleto: '',
      procesando: false,
      error: null,
      exito: false
    });
  };
  
  return {
    estado,
    actualizarCampo,
    formatearNumeroTarjeta,
    establecerError,
    establecerProcesando,
    establecerExito,
    limpiar
  };
};
```

### **Hook para manejo de reserva**
```typescript
interface EstadoReserva {
  paso: 'seleccion' | 'calculo' | 'pago' | 'confirmacion';
  peluqueriaId: number | null;
  productoIds: number[];
  fechaReserva: string;
  horaInicio: string;
  duracionTotal: number;
  precioTotal: number;
  procesando: boolean;
  error: string | null;
  reservaCreada: any | null;
}

/**
 * Hook para manejar el flujo de reserva
 */
export const useReserva = (clienteId: number, token: string) => {
  const [estado, setEstado] = useState<EstadoReserva>({
    paso: 'seleccion',
    peluqueriaId: null,
    productoIds: [],
    fechaReserva: '',
    horaInicio: '',
    duracionTotal: 0,
    precioTotal: 0,
    procesando: false,
    error: null,
    reservaCreada: null
  });
  
  const pagoService = new PagoService();
  
  const seleccionarPeluqueria = (peluqueriaId: number) => {
    setEstado(prev => ({
      ...prev,
      peluqueriaId,
      productoIds: [], // Resetear productos
      error: null
    }));
  };
  
  const seleccionarProducto = (productoId: number) => {
    setEstado(prev => ({
      ...prev,
      productoIds: prev.productoIds.includes(productoId)
        ? prev.productoIds.filter(id => id !== productoId)
        : [...prev.productoIds, productoId],
      error: null
    }));
  };
  
  const seleccionarFecha = (fecha: string) => {
    setEstado(prev => ({
      ...prev,
      fechaReserva: fecha,
      error: null
    }));
  };
  
  const seleccionarHora = (hora: string) => {
    setEstado(prev => ({
      ...prev,
      horaInicio: hora,
      error: null
    }));
  };
  
  const calcularCarrito = async () => {
    if (!estado.peluqueriaId || estado.productoIds.length === 0) {
      setEstado(prev => ({
        ...prev,
        error: 'Debes seleccionar peluquería y productos'
      }));
      return false;
    }
    
    setEstado(prev => ({ ...prev, procesando: true }));
    
    const resultado = await pagoService.calcularCarrito(
      estado.peluqueriaId,
      estado.productoIds,
      token
    );
    
    if (!resultado) {
      setEstado(prev => ({
        ...prev,
        procesando: false,
        error: 'Error al calcular carrito'
      }));
      return false;
    }
    
    setEstado(prev => ({
      ...prev,
      duracionTotal: resultado.duracionTotal,
      precioTotal: resultado.precioTotal,
      paso: 'pago',
      procesando: false
    }));
    
    return true;
  };
  
  const procesarPago = async (
    numeroTarjeta: string,
    fechaCaducidad: string,
    cvc: string,
    nombreCompleto: string
  ) => {
    setEstado(prev => ({ ...prev, procesando: true }));
    
    const resultado = await pagoService.crearReservaConPago(
      {
        clienteId,
        peluqueriaId: estado.peluqueriaId!,
        diaSemana: new Date(estado.fechaReserva).getDay(),
        fechaReserva: estado.fechaReserva,
        horaInicio: estado.horaInicio,
        productoIds: estado.productoIds
      },
      {
        numeroTarjeta,
        fechaCaducidad,
        cvc,
        nombreCompleto
      },
      token
    );
    
    if (!resultado.success) {
      setEstado(prev => ({
        ...prev,
        procesando: false,
        error: resultado.error || 'Error desconocido'
      }));
      return false;
    }
    
    setEstado(prev => ({
      ...prev,
      paso: 'confirmacion',
      procesando: false,
      reservaCreada: resultado.reserva,
      error: null
    }));
    
    return true;
  };
  
  return {
    estado,
    seleccionarPeluqueria,
    seleccionarProducto,
    seleccionarFecha,
    seleccionarHora,
    calcularCarrito,
    procesarPago
  };
};
```

---

## 💼 Ejemplos Completos

### **Componente de Formulario de Pago (React)**
```typescript
import React, { FormEvent } from 'react';
import { useFormularioPago } from './hooks/useFormularioPago';
import { validarFormularioTarjeta } from './utils/validaciones';
import { traducirErrorPago } from './utils/errores';

interface Props {
  montoTotal: number;
  conceptoPago: string;
  onPagoExitoso: (referencia: string) => void;
  onError: (error: string) => void;
}

export const FormularioPago: React.FC<Props> = ({
  montoTotal,
  conceptoPago,
  onPagoExitoso,
  onError
}) => {
  const { estado, actualizarCampo, establecerError, establecerProcesando, limpiar } = useFormularioPago();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validar
    const validacion = validarFormularioTarjeta(
      estado.numeroTarjeta,
      estado.fechaCaducidad,
      estado.cvc,
      estado.nombreCompleto
    );
    
    if (!validacion.valido) {
      // Mostrar errores
      const erroresTexto = Object.values(validacion.errores).join(', ');
      establecerError(erroresTexto);
      onError(erroresTexto);
      return;
    }
    
    // Procesar pago
    establecerProcesando(true);
    
    try {
      // Aquí iría la llamada a la API
      // const resultado = await pagoService.procesarPago(...);
      
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      limpiar();
      onPagoExitoso('REF-' + Date.now());
      
    } catch (error) {
      const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
      establecerError(mensajeError);
      onError(mensajeError);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="formulario-pago">
      <div className="resumen-pago">
        <h3>Resumen de Pago</h3>
        <p>Concepto: {conceptoPago}</p>
        <p className="monto">Total: ${montoTotal.toFixed(2)}</p>
      </div>
      
      {estado.error && (
        <div className="alerta-error">
          {estado.error}
        </div>
      )}
      
      <fieldset disabled={estado.procesando}>
        <div className="grupo-campo">
          <label htmlFor="numeroTarjeta">Número de Tarjeta</label>
          <input
            type="text"
            id="numeroTarjeta"
            placeholder="0000 0000 0000 0000"
            maxLength="19"
            value={estado.numeroTarjeta}
            onChange={(e) => actualizarCampo('numeroTarjeta', e.target.value)}
            required
          />
        </div>
        
        <div className="grupo-campo">
          <label htmlFor="nombreCompleto">Nombre Completo</label>
          <input
            type="text"
            id="nombreCompleto"
            placeholder="Juan Pérez García"
            value={estado.nombreCompleto}
            onChange={(e) => actualizarCampo('nombreCompleto', e.target.value)}
            required
          />
        </div>
        
        <div className="fila-dos-campos">
          <div className="grupo-campo">
            <label htmlFor="fechaCaducidad">Fecha Caducidad</label>
            <input
              type="text"
              id="fechaCaducidad"
              placeholder="MM/YY"
              maxLength="5"
              value={estado.fechaCaducidad}
              onChange={(e) => actualizarCampo('fechaCaducidad', e.target.value)}
              required
            />
          </div>
          
          <div className="grupo-campo">
            <label htmlFor="cvc">CVC</label>
            <input
              type="text"
              id="cvc"
              placeholder="123"
              maxLength="4"
              value={estado.cvc}
              onChange={(e) => actualizarCampo('cvc', e.target.value)}
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={estado.procesando}
          className="btn-pagar"
        >
          {estado.procesando ? (
            <>
              <span className="spinner"></span>
              Procesando...
            </>
          ) : (
            `Pagar $${montoTotal.toFixed(2)}`
          )}
        </button>
      </fieldset>
      
      <p className="aviso-seguridad">
        🔒 Tus datos de pago están seguros. No guardamos tu información.
      </p>
    </form>
  );
};
```

### **Componente de Flujo de Reserva Completo**
```typescript
import React from 'react';
import { useReserva } from './hooks/useReserva';
import { FormularioPago } from './components/FormularioPago';
import { SelectorFechaHora } from './components/SelectorFechaHora';
import { SelectorProductos } from './components/SelectorProductos';

interface Props {
  clienteId: number;
  token: string;
}

export const ComponenteReserva: React.FC<Props> = ({ clienteId, token }) => {
  const reserva = useReserva(clienteId, token);
  
  const handlePagoExitoso = (referencia: string) => {
    console.log('Pago exitoso:', referencia);
    console.log('Reserva creada:', reserva.estado.reservaCreada);
    
    // Redirigir a confirmación o mostrar mensaje
  };
  
  const handlePagoError = (error: string) => {
    console.error('Error en pago:', error);
    // Mostrar error al usuario
  };
  
  return (
    <div className="componente-reserva">
      <h1>Nueva Reserva</h1>
      
      {reserva.estado.paso === 'seleccion' && (
        <div>
          <h2>Paso 1: Selecciona Peluquería y Servicios</h2>
          
          {/* Selector de peluquería */}
          
          {/* Selector de productos */}
          <SelectorProductos
            productoIds={reserva.estado.productoIds}
            onSeleccionar={reserva.seleccionarProducto}
          />
          
          <button
            onClick={reserva.calcularCarrito}
            disabled={reserva.estado.procesando}
          >
            Siguiente
          </button>
        </div>
      )}
      
      {reserva.estado.paso === 'calculo' && (
        <div>
          <h2>Paso 2: Fecha y Hora</h2>
          
          <SelectorFechaHora
            fechaReserva={reserva.estado.fechaReserva}
            horaInicio={reserva.estado.horaInicio}
            onFechaChange={reserva.seleccionarFecha}
            onHoraChange={reserva.seleccionarHora}
          />
          
          <p className="resumen">
            Duración total: {reserva.estado.duracionTotal} minutos
            <br />
            Precio total: ${reserva.estado.precioTotal.toFixed(2)}
          </p>
          
          <button
            onClick={() => setEstadoPaso('pago')}
            disabled={!reserva.estado.fechaReserva || !reserva.estado.horaInicio}
          >
            Ir a Pago
          </button>
        </div>
      )}
      
      {reserva.estado.paso === 'pago' && (
        <div>
          <h2>Paso 3: Datos de Pago</h2>
          
          <FormularioPago
            montoTotal={reserva.estado.precioTotal}
            conceptoPago="Pago Reserva"
            onPagoExitoso={handlePagoExitoso}
            onError={handlePagoError}
          />
        </div>
      )}
      
      {reserva.estado.paso === 'confirmacion' && (
        <div className="confirmacion">
          <h2>✅ Reserva Confirmada</h2>
          
          <div className="detalles-reserva">
            <p>ID Reserva: {reserva.estado.reservaCreada.id}</p>
            <p>Fecha: {reserva.estado.fechaReserva}</p>
            <p>Hora: {reserva.estado.horaInicio}</p>
            <p>Total pagado: ${reserva.estado.precioTotal.toFixed(2)}</p>
          </div>
          
          <button onClick={() => window.history.back()}>
            Volver a Inicio
          </button>
        </div>
      )}
      
      {reserva.estado.error && (
        <div className="alerta-error">
          {reserva.estado.error}
        </div>
      )}
    </div>
  );
};
```

---

## 📝 Checklist para Implementar

- [ ] Validaciones de tarjeta en tiempo real
- [ ] Formateo automático de campos
- [ ] Cálculo de carrito antes de pagar
- [ ] Manejo de errores por tipo de fallo
- [ ] Estados de carga (spinner/disabled)
- [ ] Enmascaramiento de datos sensibles en logs
- [ ] Confirmación visual del pago
- [ ] Reintentos automáticos en fallos de conexión
- [ ] Testing con números de tarjeta de prueba
- [ ] Validación de IBAN si implementas transferencias

