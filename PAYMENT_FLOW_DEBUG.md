# 💳 Guía Completa de Flujo de Pagos - TheBarberHub

## 📋 Índice
1. [Visión General](#visión-general)
2. [Flujos de Pago](#flujos-de-pago)
3. [Estructura de Datos](#estructura-de-datos)
4. [Endpoints API](#endpoints-api)
5. [Validaciones](#validaciones)
6. [Estados y Transiciones](#estados-y-transiciones)
7. [Guía de Debugging](#guía-de-debugging)

---

## 🎯 Visión General

El sistema de pagos en TheBarberHub maneja **dos tipos principales de transacciones**:

### 1. **Pagos por Reserva de Servicios** (Tarjeta de Crédito)
- Cliente reserva servicios (corte, barba, afeitado) en una peluquería
- Paga con tarjeta de crédito
- El dinero se transfiere a la cuenta bancaria de la peluquería

### 2. **Pagos de Suscripción** (Para Peluquerías)
- Cliente se registra como peluquería
- Paga cuota de suscripción de 50€ con tarjeta
- Se convierte en peluquería y puede ofrecer servicios

### 3. **Transferencias Internas** (Futuro)
- Estructura preparada pero no implementada completamente
- Permite transferencias bancarias IBAN a IBAN

---

## 🔄 Flujos de Pago Detallados

### FLUJO 1: CREACIÓN DE RESERVA CON PAGO

```
FRONTEND
   │
   ├─ Usuario autenticado (token)
   │
   ├─ Selecciona peluquería
   │
   ├─ Selecciona productos/servicios
   │   └─ Múltiples productos de la MISMA peluquería
   │   └─ Máx 1 producto por categoría (corte, barba, afeitado)
   │
   ├─ Selecciona fecha y hora
   │   └─ Fecha >= mañana (no puede ser hoy)
   │   └─ Hora múltiplo de 5 minutos (00:00, 00:05, 00:10, etc.)
   │
   ├─ Ingresa datos de tarjeta
   │   ├─ numeroTarjeta: String
   │   ├─ fechaCaducidad: String (formato MM/YY)
   │   ├─ cvc: String (3-4 dígitos)
   │   └─ nombreCompleto: String
   │
   └─ ENVÍA POST /api/reservas/crear
        │
        BACKEND
        │
        ├─ ReservaController.crearReserva()
        │  │
        │  ├─ Valida que el usuario logueado sea quien hace la reserva
        │  │  └─ Si no coincide → BusinessException
        │  │
        │  ├─ Obtiene datos de:
        │  │  ├─ UsuarioService (cliente)
        │  │  ├─ PeluqueriaService (peluquería seleccionada)
        │  │  └─ ProductoService (servicios seleccionados)
        │  │
        │  ├─ Valida que todos los productos existan
        │  │
        │  ├─ Convierte RequestBody a Dto
        │  │
        │  └─ Llama a ReservaService.crearReserva()
        │
        ├─ ReservaServiceImpl.crearReserva(ReservaDto, OrigenPagoTarjetaRequest)
        │  │
        │  ├─ VALIDACIONES
        │  │  │
        │  │  ├─ validarFecha()
        │  │  │  └─ Si fecha <= hoy → BusinessException
        │  │  │
        │  │  ├─ validarMinutos()
        │  │  │  └─ Si minutos no son múltiplo de 5 → BusinessException
        │  │  │
        │  │  ├─ validarProductosPeluqueria()
        │  │  │  └─ Si productos de diferentes peluquerías → BusinessException
        │  │  │
        │  │  ├─ validarCategorias()
        │  │  │  ├─ Máx 1 "Corte de pelo" (categoría 1)
        │  │  │  ├─ Máx 1 "Corte de barba" (categoría 2)
        │  │  │  └─ Máx 1 "Afeitado clásico" (categoría 4)
        │  │  │
        │  │  ├─ Calcula duración total (suma de duraciones)
        │  │  │
        │  │  ├─ Calcula hora final
        │  │  │  └─ horaFinal = horaInicio + duracionTotal(minutos)
        │  │  │
        │  │  ├─ validarHorario()
        │  │  │  └─ Verifica que la peluquería esté abierta en ese horario
        │  │  │
        │  │  └─ validarSolapamientos()
        │  │     └─ Verifica que no hay otra reserva en ese horario
        │  │
        │  ├─ 💳 PROCESAMIENTO DE PAGO
        │  │  │
        │  │  ├─ BancoService.pagoTarjeta(PagoTarjetaRequest)
        │  │  │  │
        │  │  │  ├─ Construye el request:
        │  │  │  │  {
        │  │  │  │    "autorizacion": {
        │  │  │  │      "login": "thebarberhub_login",
        │  │  │  │      "api_token": "token_del_banco"
        │  │  │  │    },
        │  │  │  │    "origen": {
        │  │  │  │      "numeroTarjeta": "usuario ingresa",
        │  │  │  │      "fechaCaducidad": "usuario ingresa",
        │  │  │  │      "cvc": "usuario ingresa",
        │  │  │  │      "nombreCompleto": "usuario ingresa"
        │  │  │  │    },
        │  │  │  │    "destino": {
        │  │  │  │      "iban": "iban_de_la_peluqueria"
        │  │  │  │    },
        │  │  │  │    "pago": {
        │  │  │  │      "importe": precioTotal,
        │  │  │  │      "concepto": "Pago Reserva"
        │  │  │  │    }
        │  │  │  │  }
        │  │  │  │
        │  │  │  ├─ Envía POST a: http://banco-api.com/pagoTarjeta
        │  │  │  │
        │  │  │  ├─ Si el pago falla → RestClientException propagada
        │  │  │  │  └─ Transacción ROLLBACK (la reserva NO se guarda)
        │  │  │  │
        │  │  │  └─ Si el pago es exitoso
        │  │  │     └─ Continúa con la creación de reserva
        │  │  │
        │  │  └─ BancoService.getIbanByNumeroTarjeta(numeroTarjeta)
        │  │     └─ Obtiene IBAN asociado a la tarjeta para guardar
        │  │
        │  ├─ CREACIÓN DE ENTIDADES
        │  │  │
        │  │  ├─ Crea ReservaEntity con:
        │  │  │  ├─ id: null (generado por BD)
        │  │  │  ├─ cliente: Usuario
        │  │  │  ├─ peluqueria: Peluquería
        │  │  │  ├─ diaSemana: byte (0-6)
        │  │  │  ├─ fechaReserva: LocalDate
        │  │  │  ├─ horaInicio: LocalTime
        │  │  │  ├─ horaFinal: LocalTime
        │  │  │  ├─ precio: double (precioTotal)
        │  │  │  ├─ estado: EstadoReserva.Pendiente
        │  │  │  ├─ createdAt: LocalDateTime.now()
        │  │  │  ├─ updatedAt: null
        │  │  │  ├─ iban: IBAN obtenido del banco
        │  │  │  └─ productos: List.of()
        │  │  │
        │  │  ├─ Guarda en BD → ReservaEntity saved
        │  │  │
        │  │  └─ Por cada producto seleccionado:
        │  │     ├─ Crea ReservaProductoEntity
        │  │     └─ Guarda en BD
        │  │
        │  └─ Retorna ReservaDto con todos los datos
        │
        └─ ReservaController retorna HTTP 201 CREATED + ReservaResponse

   FRONTEND
   │
   └─ Recibe respuesta con datos de la reserva creada
      ├─ Si código 201 → Muestra confirmación ✅
      ├─ Si código 400/422 → Validación fallida
      ├─ Si código 401 → Usuario no autenticado
      ├─ Si código 403 → Usuario no autorizado
      └─ Si código 500 → Error del servidor/banco
```

---

### FLUJO 2: CONFIRMACIÓN DE SUSCRIPCIÓN A PELUQUERÍA (CON PAGO)

```
FRONTEND
   │
   ├─ Usuario autenticado (token) quiere registrarse como peluquería
   │
   ├─ Completa datos de peluquería:
   │  ├─ Municipio
   │  ├─ Dirección
   │  └─ Teléfono
   │
   ├─ Datos de tarjeta:
   │  ├─ numeroTarjeta
   │  ├─ fechaCaducidad
   │  ├─ cvc
   │  └─ nombreCompleto
   │
   └─ ENVÍA PUT /api/solicitudes/confirmar/{solicitudId}
        │
        BACKEND
        │
        ├─ SolicitudController.confirmarSolicitud()
        │  │
        │  ├─ Obtiene token del header
        │  │
        │  └─ Llama a SolicitudService.confirmarSolicitudPeluqueria()
        │
        ├─ SolicitudServiceImpl.confirmarSolicitudPeluqueria(token, solicitudId, OrigenPagoTarjetaRequest)
        │  │
        │  ├─ VALIDACIONES
        │  │  │
        │  │  ├─ Obtiene la solicitud por ID
        │  │  │  └─ Si no existe → ResourceNotFoundException
        │  │  │
        │  │  ├─ Valida que el usuario del token es quien confirma
        │  │  │  └─ Si no es el propietario → BusinessException
        │  │  │
        │  │  ├─ Valida que es del tipo "Peluquería"
        │  │  │  └─ Si no es tipo Peluquería → BusinessException
        │  │  │
        │  │  └─ Valida que está en estado "Aprobada"
        │  │     └─ Si no está aprobada → BusinessException
        │  │
        │  ├─ 💳 PROCESAMIENTO DE PAGO SUSCRIPCIÓN
        │  │  │
        │  │  ├─ BancoService.pagoTarjeta()
        │  │  │  │
        │  │  │  ├─ Construye request:
        │  │  │  │  {
        │  │  │  │    "autorizacion": {...},
        │  │  │  │    "origen": {...datos de tarjeta...},
        │  │  │  │    "destino": {
        │  │  │  │      "iban": "iban_thebarberhub"
        │  │  │  │    },
        │  │  │  │    "pago": {
        │  │  │  │      "importe": 50.00,  // Cuota de suscripción fija
        │  │  │  │      "concepto": "Suscripción a TheBarberHub"
        │  │  │  │    }
        │  │  │  │  }
        │  │  │  │
        │  │  │  ├─ Envía a API del banco
        │  │  │  │
        │  │  │  ├─ Si falla → RestClientException (ROLLBACK)
        │  │  │  │
        │  │  │  └─ Si es exitoso → Continúa
        │  │  │
        │  │  └─ BancoService.getIbanByNumeroTarjeta()
        │  │     └─ Obtiene IBAN del usuario
        │  │
        │  ├─ ACTUALIZACIÓN DE DATOS
        │  │  │
        │  │  ├─ Marca solicitud como: EstadoSolicitud.Confirmada
        │  │  │
        │  │  ├─ UsuarioService.updateRol()
        │  │  │  └─ Cambia rol del usuario a: Rol.Peluqueria
        │  │  │
        │  │  ├─ Crea entidad Peluqueria:
        │  │  │  ├─ usuario: El usuario que se registra
        │  │  │  ├─ municipio: Del request
        │  │  │  ├─ direccion: Del request
        │  │  │  ├─ telefono: Del request
        │  │  │  ├─ iban: Obtenido del banco
        │  │  │  ├─ horarios: null (se agregan después)
        │  │  │  └─ productos: null (se agregan después)
        │  │  │
        │  │  └─ PeluqueriaService.create()
        │  │     └─ Guarda en BD
        │  │
        │  └─ Retorna SolicitudDto
        │
        └─ SolicitudController retorna HTTP 200 OK

   FRONTEND
   │
   └─ Recibe confirmación
      └─ Usuario ahora es Peluquería y puede crear productos/horarios
```

---

## 📊 Estructura de Datos

### 1. **PagoTarjetaRequest** (Request para pagar con tarjeta)
```json
{
  "autorizacion": {
    "login": "string",           // Credenciales del banco
    "api_token": "string"        // Token de autenticación
  },
  "origen": {
    "numeroTarjeta": "4532xxxxxx1234",
    "fechaCaducidad": "12/25",
    "cvc": "123",
    "nombreCompleto": "Juan Pérez"
  },
  "destino": {
    "iban": "ES9121000418450200051332"  // IBAN destinatario
  },
  "pago": {
    "importe": 45.50,
    "concepto": "Pago Reserva"
  }
}
```

### 2. **TransferenciaRequest** (Request para transferencias bancarias)
```json
{
  "autorizacion": {...},
  "origen": {
    "iban": "ES9121000418450200051332"
  },
  "destino": {
    "iban": "ES9121000418450200051332"
  },
  "pago": {
    "importe": 100.00,
    "concepto": "Pago a proveedor"
  }
}
```

### 3. **CarritoRequest** (Estructura de carrito para cálculo)
```json
{
  "peluqueriaId": 1,
  "productoIds": [5, 7, 9]  // IDs de servicios seleccionados
}
```

### 4. **CrearReservaRequest**
```json
{
  "reserva": {
    "clienteId": 1,
    "peluqueriaId": 2,
    "diaSemana": 3,
    "fechaReserva": "2025-02-20",
    "horaInicio": "10:30",
    "productoIds": [5, 7]
  },
  "origen": {
    "numeroTarjeta": "4532xxxxxx1234",
    "fechaCaducidad": "12/25",
    "cvc": "123",
    "nombreCompleto": "Juan Pérez"
  }
}
```

---

## 🔌 Endpoints API

### **1. Carrito (Cálculo previo)**
```
POST /api/carrito/calcular
Content-Type: application/json
Authorization: token (header)

{
  "peluqueriaId": 1,
  "productoIds": [5, 7]
}

Respuesta 200 OK:
{
  "peluqueriaId": 1,
  "productos": [...],
  "duracionTotal": 45,        // minutos
  "precioTotal": 45.50        // BigDecimal
}
```

### **2. Crear Reserva (CON PAGO)**
```
POST /api/reservas/crear
Content-Type: application/json
Authorization: token (header)

{
  "reserva": {
    "clienteId": 1,
    "peluqueriaId": 2,
    "diaSemana": 3,
    "fechaReserva": "2025-02-20",
    "horaInicio": "10:30",
    "productoIds": [5, 7]
  },
  "origen": {
    "numeroTarjeta": "4532015556666660",
    "fechaCaducidad": "12/25",
    "cvc": "123",
    "nombreCompleto": "Juan Pérez García"
  }
}

Respuesta 201 CREATED:
{
  "id": 42,
  "cliente": {...},
  "peluqueria": {...},
  "diaSemana": 3,
  "fechaReserva": "2025-02-20",
  "horaInicio": "10:30",
  "horaFinal": "11:15",
  "precio": 45.50,
  "estado": "Pendiente",
  "createdAt": "2025-02-12T...",
  "updatedAt": null,
  "iban": "ES9121000418450200051332",
  "productos": [...]
}

Errores:
- 400: Validación fallida (ver detalles en response)
- 401: No autenticado
- 403: No autorizado (no puedes hacer reservas a otros)
- 422: Error en transacción bancaria
- 500: Error servidor/banco
```

### **3. Listar Reservas del Cliente**
```
GET /api/reservas/cliente/{clienteId}
Authorization: token (header)

Respuesta 200 OK: List<ReservaResponse>
```

### **4. Confirmar Suscripción (CON PAGO)**
```
PUT /api/solicitudes/confirmar/{solicitudId}
Content-Type: application/json
Authorization: token (header)

{
  "numeroTarjeta": "4532015556666660",
  "fechaCaducidad": "12/25",
  "cvc": "123",
  "nombreCompleto": "Juan Pérez"
}

Respuesta 200 OK:
{
  "id": 1,
  "estado": "Confirmada",
  "tipo": "Peluqueria",
  ...
}

Errores: Similar a reservas
```

---

## ✅ Validaciones Detalladas

### **Fechas y Horas**
```
✗ Fecha en el pasado
✗ Fecha = hoy (debe ser >= mañana)
✗ Minutos no son múltiplo de 5 (debe ser: 00, 05, 10, 15, 20, etc.)
```

### **Productos/Servicios**
```
✗ No existen
✗ De diferentes peluquerías
✗ Más de 1 "Corte de pelo" (categoría 1)
✗ Más de 1 "Corte de barba" (categoría 2)
✗ Más de 1 "Afeitado clásico" (categoría 4)
```

### **Horarios**
```
✗ Peluquería no abierta a esa hora
✗ Solapamiento con otra reserva (misma peluquería, misma fecha)
✗ Horario final después de cierre
```

### **Tarjeta de Crédito**
```
✗ Formato inválido número
✗ Fecha de caducidad expirada
✗ CVC inválido
✗ Nombre vacío
```

### **IBAN**
```
Regex: ^ES\d{2}(?:\s?\d{4}){5}$
✗ No comienza con "ES"
✗ No tiene 22 dígitos
✗ Formato incorrecto
```

---

## 🔄 Estados y Transiciones

### **Estados de Reserva**
```
Pendiente ─→ Confirmada ─→ Cancelada
  ↓
Rechazada
```

### **Estados de Solicitud (Peluquería)**
```
Pendiente ─→ Aprobada ─→ Confirmada
    ↓                       ↓
Rechazada            (Usuario = Peluquería)
```

---

## 🐛 Guía de Debugging

### **1. Debuggear flujo de pago en Frontend**

#### A. Antes de enviar el pago
```javascript
// Valida datos de tarjeta
const validarTarjeta = (numeroTarjeta, fechaCaducidad, cvc, nombreCompleto) => {
  // numero: 16 dígitos
  // fecha: MM/YY
  // cvc: 3-4 dígitos
  // nombre: no vacío
  
  const errores = [];
  
  if (!/^\d{16}$/.test(numeroTarjeta.replace(/\s/g, ''))) {
    errores.push("Número de tarjeta inválido (debe ser 16 dígitos)");
  }
  
  if (!/^\d{2}\/\d{2}$/.test(fechaCaducidad)) {
    errores.push("Fecha de caducidad inválida (formato: MM/YY)");
  }
  
  if (!/^\d{3,4}$/.test(cvc)) {
    errores.push("CVC inválido (3-4 dígitos)");
  }
  
  if (!nombreCompleto || nombreCompleto.trim().length === 0) {
    errores.push("Nombre completo requerido");
  }
  
  return errores;
};

// Valida datos de reserva
const validarReserva = (fechaReserva, horaInicio, productoIds, peluqueriaId) => {
  const errores = [];
  
  const hoy = new Date();
  const mañana = new Date(hoy);
  mañana.setDate(mañana.getDate() + 1);
  
  if (new Date(fechaReserva) <= hoy) {
    errores.push("La fecha debe ser como mínimo mañana");
  }
  
  const [horas, minutos] = horaInicio.split(':');
  if (parseInt(minutos) % 5 !== 0) {
    errores.push("La hora debe ser múltiplo de 5 minutos");
  }
  
  if (!productoIds || productoIds.length === 0) {
    errores.push("Debe seleccionar al menos un producto");
  }
  
  if (!peluqueriaId) {
    errores.push("Debe seleccionar una peluquería");
  }
  
  return errores;
};
```

#### B. Llamada al backend
```javascript
async function crearReservaConPago(reservaData, tarjetaData) {
  try {
    const response = await fetch('/api/reservas/crear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': localStorage.getItem('token')
      },
      body: JSON.stringify({
        reserva: reservaData,
        origen: tarjetaData
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error en creación de reserva:', error);
      
      // Interpreta el error
      if (response.status === 400 || response.status === 422) {
        // Error de validación
        mostrarErrores(error.message || error.errors);
      } else if (response.status === 401) {
        // No autenticado
        redirigirALogin();
      } else if (response.status === 403) {
        // No autorizado
        mostrarError("No tienes permiso para hacer esta acción");
      } else if (response.status === 500) {
        // Error servidor o banco
        mostrarError("Error al procesar el pago. Intenta más tarde.");
      }
      return null;
    }
    
    const reserva = await response.json();
    console.log('Reserva creada:', reserva);
    return reserva;
    
  } catch (error) {
    console.error('Error de conexión:', error);
    mostrarError("Error de conexión con el servidor");
    return null;
  }
}
```

#### C. Monitoreo en Console del navegador
```javascript
// Monitorea requests
console.log('REQUEST PAYLOAD:', {
  reserva: {...},
  origen: {
    numeroTarjeta: '****ENMASCARADO****',
    fechaCaducidad: '12/25',
    cvc: '***',
    nombreCompleto: 'Juan Pérez'
  }
});

// Verifica respuesta
console.log('RESPONSE STATUS:', response.status);
console.log('RESPONSE HEADERS:', response.headers);
console.log('RESPONSE BODY:', await response.json());
```

---

### **2. Debuggear Backend (Logs recomendados)**

#### En ReservaServiceImpl.java, agregar logs:
```java
@Override
public ReservaDto crearReserva(ReservaDto dto, OrigenPagoTarjetaRequest origen) {
    System.out.println("=== INICIANDO CREACIÓN DE RESERVA ===");
    System.out.println("Cliente ID: " + dto.cliente().id());
    System.out.println("Peluquería ID: " + dto.peluqueria().id());
    System.out.println("Fecha: " + dto.fechaReserva());
    System.out.println("Hora inicio: " + dto.horaInicio());
    System.out.println("Productos: " + dto.productos().size());
    
    validarFecha(dto.fechaReserva());
    System.out.println("✓ Fecha validada");
    
    // ... otras validaciones
    
    System.out.println("=== INICIANDO PAGO ===");
    System.out.println("Monto: " + precioTotal + "€");
    System.out.println("Tarjeta terminada en: " + origen.numeroTarjeta().substring(12));
    
    try {
        bancoService.pagoTarjeta(pagoTarjetaRequest);
        System.out.println("✓ PAGO EXITOSO");
    } catch (RestClientException e) {
        System.err.println("✗ PAGO FALLIDO: " + e.getMessage());
        throw new BusinessException("Error al procesar el pago: " + e.getMessage());
    }
    
    // ... crear reserva
    System.out.println("✓ Reserva creada con ID: " + saved.id());
}
```

---

### **3. Test casos comunes de error**

#### Caso 1: Error de tarjeta rechazada
```
Frontend envía:
{
  "numeroTarjeta": "4111111111111112",  // Tarjeta rechazada en el banco
  ...
}

Backend recibe:
RestClientException: "Tarjeta rechazada"

Frontend debe mostrar:
"Tu tarjeta ha sido rechazada. Intenta con otra tarjeta."
```

#### Caso 2: Solapamiento de horarios
```
Frontend envía:
{
  "fechaReserva": "2025-02-20",
  "horaInicio": "10:00",
  "productoIds": [5, 7]  // Total 45 minutos
}

Ya existe otra reserva en la misma peluquería:
fechaReserva: "2025-02-20"
horaInicio: "10:30"
horaFinal: "11:00"

Problema: Nueva reserva: 10:00-10:45 → SE SOLAPA 10:30-10:45

Backend rechaza:
BusinessException: "Ya existe otra reserva en ese horario"

Frontend debe mostrar:
"No puedes reservar a esa hora. Selecciona otro horario."
```

#### Caso 3: Categoría duplicada
```
Frontend envía:
{
  "productoIds": [5, 6]  // Ambos de categoría "Corte de pelo"
}

Backend valida:
- Producto 5: categoría 1 (Corte de pelo)
- Producto 6: categoría 1 (Corte de pelo)
- Duplicados: 2

Rechaza con:
BusinessException: "Solo puede seleccionar un producto de categoría 'Corte de pelo'"

Frontend debe mostrar:
"Puedes elegir solo un servicio de corte de pelo"
```

---

### **4. Herramientas de debugging útiles**

#### Chrome DevTools
```javascript
// Network Tab
- Verifica que el request es POST a /api/reservas/crear
- Status 201 = Exitoso
- Status 400/422 = Validación fallida
- Status 500 = Error servidor

// Console Tab
- console.log() de validaciones
- console.error() de excepciones
- Verifica que no hay errores CORS

// Application Tab
- Verifica que el token está en localStorage
- Verifica que el header 'token' se está enviando
```

#### Postman/Insomnia
```
1. Crea una colección "Pagos TheBarberHub"
2. Crea requests para:
   - POST /api/carrito/calcular
   - POST /api/reservas/crear
   - PUT /api/solicitudes/confirmar/{id}
3. En Headers: Authorization: token (tu_token)
4. En Body: Raw JSON con los datos completos
5. Verifica respuestas y tiempos de respuesta
```

#### Backend Logs
```
1. Activa DEBUG logging en application.properties:
   logging.level.com.fpmislata.daw.tienda=DEBUG
   
2. Agrega logs en PaymentServiceImpl:
   System.out.println() o log.debug()
   
3. Verifica en consola de ejecución del servidor:
   Terminal: Run: TiendaApplication
```

---

### **5. Flujo de debugging paso a paso**

1. **Frontend valida datos localmente** ✓
   - Tarjeta: 16 dígitos
   - Fecha: MM/YY válido
   - CVC: 3-4 dígitos
   - Nombre: no vacío

2. **Frontend calcula carrito** ✓
   - GET /api/carrito/calcular
   - Verifica precio y duración totales

3. **Frontend construye payload** ✓
   - reserva: {...}
   - origen: {...tarjeta...}
   - Enmascarar números en logs

4. **Frontend envía request** ✓
   - POST /api/reservas/crear
   - Con header 'token'
   - Content-Type: application/json

5. **Backend valida datos** ✓
   - Fecha >= mañana
   - Hora es múltiplo de 5
   - Productos existen
   - Misma peluquería
   - Categorías no duplicadas
   - Horario disponible
   - Sin solapamientos

6. **Backend procesa pago** ✓
   - Construye PagoTarjetaRequest
   - Llama BancoService.pagoTarjeta()
   - Si falla → excepción, ROLLBACK
   - Si exitoso → obtiene IBAN

7. **Backend crea reserva** ✓
   - Crea ReservaEntity
   - Guarda en BD
   - Crea ReservaProductoEntity para cada producto
   - Retorna ReservaResponse con ID

8. **Frontend recibe respuesta** ✓
   - Status 201 → Éxito, mostrar confirmación
   - Status 400/422 → Error validación, mostrar detalles
   - Status 500 → Error servidor, reintentar o contactar soporte

---

### **6. Testing de pagos seguro**

**NUNCA usar números de tarjeta reales en desarrollo**

Usa números de prueba del banco:
```
Tarjetas válidas (generalmente en sandbox):
- 4111 1111 1111 1111 (Visa)
- 5555 5555 5555 4444 (Mastercard)
- 3782 822463 10005 (American Express)

Fecha caducidad: Cualquiera en el futuro (ej: 12/99)
CVC: Cualquiera de 3 dígitos (ej: 123)
```

---

## 📚 Resumen Rápido

| Concepto | Descripción |
|----------|------------|
| **Endpoint Principal** | `POST /api/reservas/crear` |
| **Tipo de Pago** | Tarjeta de crédito (integración con API externa) |
| **Flujo Crítico** | Validar → Calcular precio → Pagar → Guardar |
| **Punto de Fallo** | En el pago bancario → ROLLBACK |
| **Respuesta Éxito** | HTTP 201 CREATED + ReservaResponse |
| **Datos Sensibles** | Enmascarar tarjeta en logs/consola |
| **Timeout Recomendado** | 30 segundos por pago |
| **Reintentos** | Max 3 intentos con backoff exponencial |

---

## 🚀 Próximos Pasos para Debugging

1. **Verifica logs** en `Terminal: Run: TiendaApplication`
2. **Usa Postman** para testear endpoints
3. **Abre DevTools** en navegador (F12)
4. **Sigue la traza** de error según tabla anterior
5. **Contacta con el backend** si es error 500
6. **Prueba con números reales de tarjeta del banco** en sandbox
