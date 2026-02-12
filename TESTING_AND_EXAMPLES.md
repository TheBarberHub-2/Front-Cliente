# 🧪 Testing y Ejemplos de Request/Response - Sistema de Pagos

## 📋 Tabla de Contenidos
1. [Ejemplos Reales de Request/Response](#ejemplos-reales-de-requestresponse)
2. [Casos de Prueba](#casos-de-prueba)
3. [Errores Comunes](#errores-comunes)
4. [Testing con Postman](#testing-con-postman)
5. [Números de Tarjeta de Prueba](#números-de-tarjeta-de-prueba)

---

## 🔄 Ejemplos Reales de Request/Response

### **1. CALCULAR CARRITO**

#### Request
```http
POST http://localhost:8080/api/carrito/calcular
Content-Type: application/json
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "peluqueriaId": 1,
  "productoIds": [5, 7]
}
```

#### Response 200 OK
```json
{
  "peluqueriaId": 1,
  "productos": [
    {
      "id": 5,
      "nombre": "Corte de Pelo",
      "categoriaId": 1,
      "precio": 15.00,
      "duracion": 30
    },
    {
      "id": 7,
      "nombre": "Barba Limpia",
      "categoriaId": 2,
      "precio": 10.00,
      "duracion": 15
    }
  ],
  "duracionTotal": 45,
  "precioTotal": 25.00
}
```

#### Response 400 - Validación Fallida
```json
{
  "timestamp": "2025-02-12T10:30:45.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Debe seleccionar al menos un producto",
  "path": "/api/carrito/calcular"
}
```

---

### **2. CREAR RESERVA CON PAGO**

#### Request
```http
POST http://localhost:8080/api/reservas/crear
Content-Type: application/json
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "reserva": {
    "clienteId": 1,
    "peluqueriaId": 2,
    "diaSemana": 4,
    "fechaReserva": "2025-02-20",
    "horaInicio": "10:30",
    "productoIds": [5, 7]
  },
  "origen": {
    "numeroTarjeta": "4111111111111111",
    "fechaCaducidad": "12/25",
    "cvc": "123",
    "nombreCompleto": "Juan Pérez García"
  }
}
```

#### Response 201 CREATED
```json
{
  "id": 42,
  "cliente": {
    "id": 1,
    "nombre": "Juan Pérez García",
    "email": "juan@example.com",
    "rol": "Cliente"
  },
  "peluqueria": {
    "id": 2,
    "nombre": "La Barbería del Centro",
    "direccion": "Calle Mayor 10",
    "telefono": "912345678"
  },
  "diaSemana": 4,
  "fechaReserva": "2025-02-20",
  "horaInicio": "10:30",
  "horaFinal": "11:15",
  "precio": 25.00,
  "estado": "Pendiente",
  "createdAt": "2025-02-12T10:30:45.123Z",
  "updatedAt": null,
  "iban": "ES9121000418450200051332",
  "productos": [
    {
      "id": 1,
      "producto": {
        "id": 5,
        "nombre": "Corte de Pelo",
        "precio": 15.00,
        "duracion": 30
      }
    },
    {
      "id": 2,
      "producto": {
        "id": 7,
        "nombre": "Barba Limpia",
        "precio": 10.00,
        "duracion": 15
      }
    }
  ]
}
```

#### Response 400 - Fecha en el Pasado
```json
{
  "timestamp": "2025-02-12T10:35:20.456Z",
  "status": 400,
  "error": "Bad Request",
  "message": "No se puede reservar en fechas pasadas",
  "path": "/api/reservas/crear"
}
```

#### Response 400 - Hora Inválida
```json
{
  "timestamp": "2025-02-12T10:36:15.789Z",
  "status": 400,
  "error": "Bad Request",
  "message": "La hora no es correcta",
  "details": "Las horas deben ser múltiplos de 5 minutos (10:00, 10:05, 10:10, etc.)"
}
```

#### Response 422 - Error en Pago
```json
{
  "timestamp": "2025-02-12T10:37:00.123Z",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "Error al procesar el pago: Tarjeta rechazada",
  "path": "/api/reservas/crear"
}
```

#### Response 403 - No Autorizado
```json
{
  "timestamp": "2025-02-12T10:38:30.456Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Solo puedes hacer reservas a tu nombre",
  "path": "/api/reservas/crear"
}
```

#### Response 401 - No Autenticado
```json
{
  "timestamp": "2025-02-12T10:39:45.789Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Token no válido o expirado",
  "path": "/api/reservas/crear"
}
```

---

### **3. CONFIRMAR SUSCRIPCIÓN (PAGAR 50€ CUOTA)**

#### Request
```http
PUT http://localhost:8080/api/solicitudes/confirmar/15
Content-Type: application/json
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "numeroTarjeta": "5555555555554444",
  "fechaCaducidad": "06/26",
  "cvc": "456",
  "nombreCompleto": "Carlos López Martínez"
}
```

#### Response 200 OK
```json
{
  "id": 15,
  "usuario": {
    "id": 8,
    "nombre": "Carlos López Martínez",
    "email": "carlos@example.com"
  },
  "estado": "Confirmada",
  "tipo": "Peluqueria",
  "createdAt": "2025-02-10T14:20:30.000Z",
  "updatedAt": "2025-02-12T11:00:15.000Z",
  "mensaje": "¡Bienvenido a TheBarberHub como peluquería!"
}
```

#### Response 400 - Solicitud no Aprobada
```json
{
  "timestamp": "2025-02-12T11:05:20.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Solo se pueden confirmar solicitudes en estado aprobada",
  "currentState": "Pendiente"
}
```

#### Response 403 - No Es el Propietario
```json
{
  "timestamp": "2025-02-12T11:06:30.000Z",
  "status": 403,
  "error": "Forbidden",
  "message": "No tienes permiso para confirmar esta solicitud"
}
```

---

## 🧪 Casos de Prueba

### **CASO 1: Flujo Exitoso - Reserva Completa**

**Precondiciones:**
- Cliente autenticado con token válido
- Peluquería existe (ID: 2)
- Productos existen (IDs: 5, 7)
- Tarjeta de crédito válida

**Pasos:**
1. Cliente calcula carrito
2. Cliente selecciona fecha (mañana o posterior)
3. Cliente selecciona hora (múltiplo de 5)
4. Cliente ingresa datos de tarjeta
5. Sistema valida datos
6. Sistema procesa pago
7. Sistema crea reserva

**Resultado Esperado:**
- ✅ Response 201 CREATED
- ✅ Reserva con estado "Pendiente"
- ✅ IBAN guardado en BD
- ✅ Productos asociados

**Datos de Prueba:**
```json
{
  "clienteId": 1,
  "peluqueriaId": 2,
  "fechaReserva": "2025-02-14",
  "horaInicio": "10:00",
  "productoIds": [5, 7],
  "numeroTarjeta": "4111111111111111",
  "fechaCaducidad": "12/25",
  "cvc": "123",
  "nombreCompleto": "Juan Pérez García"
}
```

---

### **CASO 2: Validación - Fecha en el Pasado**

**Precondiciones:**
- Mismo cliente autenticado
- Intenta reservar para hoy o pasado

**Pasos:**
1. Cliente ingresa fecha: "2025-02-12" (hoy)
2. Sistema valida fecha
3. Sistema rechaza

**Resultado Esperado:**
- ❌ Response 400 BAD REQUEST
- ❌ Mensaje: "No se puede reservar en fechas pasadas"
- ❌ Reserva NO creada
- ❌ Pago NO procesado

**Datos de Prueba:**
```json
{
  "fechaReserva": "2025-02-12"  // Hoy - INVÁLIDO
}
```

---

### **CASO 3: Validación - Hora Inválida**

**Precondiciones:**
- Mismo cliente
- Intenta reservar a hora que no es múltiplo de 5

**Pasos:**
1. Cliente ingresa hora: "10:37"
2. Sistema valida hora
3. Sistema rechaza

**Resultado Esperado:**
- ❌ Response 400 BAD REQUEST
- ❌ Mensaje: "La hora no es correcta"

**Datos de Prueba:**
```json
{
  "horaInicio": "10:37"  // No múltiplo de 5 - INVÁLIDO
  // Válidos: 10:00, 10:05, 10:10, 10:15, etc.
}
```

---

### **CASO 4: Validación - Productos Duplicados en Categoría**

**Precondiciones:**
- Productos 5 y 6 ambos de categoría 1 (Corte de pelo)
- Cliente intenta seleccionar ambos

**Pasos:**
1. Cliente selecciona productoIds: [5, 6]
2. Sistema valida categorías
3. Sistema rechaza

**Resultado Esperado:**
- ❌ Response 400 BAD REQUEST
- ❌ Mensaje: "Solo puede seleccionar un producto de categoría 'Corte de pelo'"

**Datos de Prueba:**
```json
{
  "productoIds": [5, 6]  // Ambos categoría 1 - INVÁLIDO
}
```

---

### **CASO 5: Validación - Productos de Diferentes Peluquerías**

**Precondiciones:**
- Producto 5 pertenece a peluquería 2
- Producto 10 pertenece a peluquería 3
- Cliente intenta seleccionar ambos

**Pasos:**
1. Cliente selecciona productoIds: [5, 10]
2. Sistema valida peluquería
3. Sistema rechaza

**Resultado Esperado:**
- ❌ Response 400 BAD REQUEST
- ❌ Mensaje: "Todos los productos deben pertenecer a la misma peluquería"

**Datos de Prueba:**
```json
{
  "peluqueriaId": 2,
  "productoIds": [5, 10]  // 5 de peluquería 2, 10 de peluquería 3 - INVÁLIDO
}
```

---

### **CASO 6: Validación - Solapamiento de Horarios**

**Precondiciones:**
- Ya existe reserva en peluquería 2, fecha 2025-02-20, 10:30-11:00
- Cliente intenta reservar 10:00-11:00 (se solapa 10:30-11:00)

**Pasos:**
1. Cliente intenta reservar en misma peluquería, misma fecha, horario solapado
2. Sistema valida solapamientos
3. Sistema rechaza

**Resultado Esperado:**
- ❌ Response 400 BAD REQUEST
- ❌ Mensaje: "Ya existe otra reserva en ese horario"

**Datos de Prueba:**
```json
{
  "peluqueriaId": 2,
  "fechaReserva": "2025-02-20",
  "horaInicio": "10:00",
  "productoIds": [5, 7]  // Total 45 minutos → 10:00-10:45 SOLAPA con 10:30-11:00
}
```

---

### **CASO 7: Error de Pago - Tarjeta Rechazada**

**Precondiciones:**
- Todas las validaciones pasan
- Pero el banco rechaza la tarjeta

**Pasos:**
1. Todas las validaciones son correctas
2. Sistema envía solicitud de pago al banco
3. Banco rechaza tarjeta (fondos insuficientes, tarjeta bloqueada, etc.)
4. Sistema recibe excepción

**Resultado Esperado:**
- ❌ Response 422 UNPROCESSABLE ENTITY
- ❌ Mensaje: "Error al procesar el pago: Tarjeta rechazada"
- ❌ Reserva NO creada (ROLLBACK)
- ❌ Cliente NO cobra
- ✅ Pago NO realizado

**Datos de Prueba:**
```json
{
  "numeroTarjeta": "4000000000000002",  // Tarjeta de prueba rechazada
  "fechaCaducidad": "12/25",
  "cvc": "123",
  "nombreCompleto": "Juan Pérez García"
}
```

---

### **CASO 8: Error de Autorización - No Es Su Reserva**

**Precondiciones:**
- Cliente A intenta hacer reserva para Cliente B
- clienteId = 2 (Usuario B)
- token = Usuario A

**Pasos:**
1. Cliente A envía solicitud con clienteId = 2
2. Sistema obtiene usuario logueado (User A)
3. Sistema compara ID logueado con clienteId del request
4. No coinciden → rechaza

**Resultado Esperado:**
- ❌ Response 403 FORBIDDEN
- ❌ Mensaje: "Solo puedes hacer reservas a tu nombre"

**Datos de Prueba:**
```json
{
  "clienteId": 2,  // Usuario logueado es 1 - NO COINCIDEN
  "peluqueriaId": 2,
  ...
}
```

---

### **CASO 9: Validación de Tarjeta - Número Inválido**

**Datos Inválidos:**
```javascript
// Menos de 16 dígitos
"numeroTarjeta": "4111 1111 1111"  // ❌

// Más de 16 dígitos
"numeroTarjeta": "4111 1111 1111 1111 1"  // ❌

// Dígitos de verificación Luhn incorrectos
"numeroTarjeta": "4111 1111 1111 1112"  // ❌

// No son dígitos
"numeroTarjeta": "XXXX XXXX XXXX XXXX"  // ❌
```

**Datos Válidos:**
```javascript
// Visa
"numeroTarjeta": "4111111111111111"  // ✅

// Mastercard
"numeroTarjeta": "5555555555554444"  // ✅

// Con espacios (sistema debe limpiar)
"numeroTarjeta": "4111 1111 1111 1111"  // ✅
```

---

### **CASO 10: Validación de Fecha Caducidad**

**Datos Inválidos:**
```javascript
// Formato incorrecto
"fechaCaducidad": "12-25"  // ❌ (debe ser 12/25)
"fechaCaducidad": "2025/12"  // ❌ (debe ser 12/25)
"fechaCaducidad": "12/2025"  // ❌ (debe ser 12/25)

// Mes inválido
"fechaCaducidad": "13/25"  // ❌ (no existe mes 13)
"fechaCaducidad": "00/25"  // ❌ (no existe mes 0)

// Tarjeta expirada
"fechaCaducidad": "02/25"  // ❌ (si ya estamos en marzo de 2025)
```

**Datos Válidos:**
```javascript
// Futuro
"fechaCaducidad": "12/25"  // ✅
"fechaCaducidad": "12/99"  // ✅ (válida, lejana)

// Mes y año válidos
"fechaCaducidad": "01/26"  // ✅
"fechaCaducidad": "06/26"  // ✅
```

---

## 🚨 Errores Comunes

### **Error 1: 401 Unauthorized - Token No Válido**

**Síntoma:**
```
Response 401
{
  "message": "Token no válido o expirado"
}
```

**Causas Posibles:**
- Token ausente en header
- Token expirado
- Token malformado
- Token de otro usuario

**Solución:**
```javascript
// Verificar que el token está en localStorage
const token = localStorage.getItem('token');
if (!token) {
  // Redirigir a login
  window.location.href = '/login';
}

// Enviar con header correcto
fetch('/api/reservas/crear', {
  headers: {
    'token': token  // Debe estar presente
  }
});
```

---

### **Error 2: 400 - Validación Fallida**

**Síntoma:**
```
Response 400
{
  "message": "No se puede reservar en fechas pasadas"
}
```

**Causas Posibles:**
- Fecha < hoy
- Hora no múltiplo de 5
- Productos duplicados en categoría
- Productos de diferentes peluquerías
- Solapamiento de horarios

**Solución:**
```javascript
// Validar ANTES de enviar
const errores = [];

// Validar fecha
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);
const mañana = new Date(hoy);
mañana.setDate(mañana.getDate() + 1);

if (new Date(fechaReserva) < mañana) {
  errores.push('Fecha inválida');
}

// Validar hora
const [horas, minutos] = horaInicio.split(':');
if (parseInt(minutos) % 5 !== 0) {
  errores.push('Hora debe ser múltiplo de 5');
}

if (errores.length > 0) {
  mostrarErrores(errores);
  return;
}
```

---

### **Error 3: 422 - Error de Pago**

**Síntoma:**
```
Response 422
{
  "message": "Error al procesar el pago: Tarjeta rechazada"
}
```

**Causas Posibles:**
- Tarjeta rechazada por banco
- Fondos insuficientes
- Tarjeta bloqueada
- Límite de transacciones excedido
- Conexión con banco fallida

**Solución:**
```javascript
// Capturar error de pago específico
try {
  const response = await fetch('/api/reservas/crear', {
    // ...
  });
  
  if (response.status === 422) {
    const data = await response.json();
    
    if (data.message.includes('Tarjeta rechazada')) {
      mostrar("Tu tarjeta ha sido rechazada. Usa otra tarjeta.");
    } else if (data.message.includes('fondos')) {
      mostrar("Fondos insuficientes en tu tarjeta.");
    } else {
      mostrar("Error al procesar el pago. Intenta más tarde.");
    }
  }
} catch (error) {
  mostrar("Error de conexión con el servidor");
}
```

---

### **Error 4: 403 Forbidden - No Autorizado**

**Síntoma:**
```
Response 403
{
  "message": "Solo puedes hacer reservas a tu nombre"
}
```

**Causas Posibles:**
- Intentando hacer reserva para otro usuario
- Intentando confirmar solicitud que no es propia
- Usuario no tiene rol correcto

**Solución:**
```javascript
// Siempre usar el ID del usuario logueado
const usuarioLogueado = JSON.parse(localStorage.getItem('usuario'));

fetch('/api/reservas/crear', {
  body: JSON.stringify({
    reserva: {
      clienteId: usuarioLogueado.id,  // ✅ Usar ID del logueado
      ...
    }
  })
});
```

---

### **Error 5: 404 Not Found**

**Síntoma:**
```
Response 404
{
  "message": "Peluquería no encontrada"
}
```

**Causas Posibles:**
- Peluquería no existe
- Producto no existe
- Cliente no existe
- ID inválido

**Solución:**
```javascript
// Validar que los IDs existen antes de enviar
const peluqueriaExiste = await fetch(`/api/peluquerias/${peluqueriaId}`);
if (!peluqueriaExiste.ok) {
  mostrar("Peluquería no encontrada");
  return;
}
```

---

### **Error 6: Datos de Tarjeta Enmascarados en Logs**

**❌ Incorrecto - NUNCA:**
```javascript
console.log("Tarjeta:", numeroTarjeta);  // 4111111111111111 - PELIGROSO
console.log("CVC:", cvc);  // 123 - PELIGROSO
```

**✅ Correcto:**
```javascript
console.log("Tarjeta terminada en:", numeroTarjeta.slice(-4));  // 1111
console.log("Tipo:", detectarTipoTarjeta(numeroTarjeta));  // Visa
console.log("CVC enmascarado: ***");  // ***
```

---

## 📮 Testing con Postman

### **1. Configurar Colección**

```
Nombre: TheBarberHub - Pagos
Base URL: {{base_url}}
```

### **2. Crear Carpeta: Auth**

```
POST {{base_url}}/api/usuarios/login
Body:
{
  "email": "juan@example.com",
  "contraseña": "password123"
}

Response:
{
  "id": 1,
  "nombre": "Juan Pérez",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

⚙️ Tests:
pm.environment.set("token", pm.response.json().token);
pm.environment.set("clienteId", pm.response.json().id);
```

### **3. Crear Carpeta: Carrito**

```
POST {{base_url}}/api/carrito/calcular
Headers:
- token: {{token}}

Body:
{
  "peluqueriaId": 1,
  "productoIds": [5, 7]
}

⚙️ Tests:
pm.test("Status 200", function() {
  pm.response.to.have.status(200);
});

pm.test("Tiene precioTotal", function() {
  var json = pm.response.json();
  pm.expect(json.precioTotal).to.exist;
});
```

### **4. Crear Carpeta: Reservas**

```
POST {{base_url}}/api/reservas/crear
Headers:
- token: {{token}}
- Content-Type: application/json

Body:
{
  "reserva": {
    "clienteId": {{clienteId}},
    "peluqueriaId": 2,
    "diaSemana": 4,
    "fechaReserva": "2025-02-20",
    "horaInicio": "10:30",
    "productoIds": [5, 7]
  },
  "origen": {
    "numeroTarjeta": "4111111111111111",
    "fechaCaducidad": "12/25",
    "cvc": "123",
    "nombreCompleto": "Juan Pérez García"
  }
}

⚙️ Tests:
pm.test("Status 201 CREATED", function() {
  pm.response.to.have.status(201);
});

pm.test("Tiene ID de reserva", function() {
  var json = pm.response.json();
  pm.expect(json.id).to.exist;
  pm.environment.set("reservaId", json.id);
});

pm.test("Estado es Pendiente", function() {
  var json = pm.response.json();
  pm.expect(json.estado).to.equal("Pendiente");
});
```

### **5. Casos de Error**

```
// Fecha inválida
Body:
{
  "reserva": {
    ...
    "fechaReserva": "2025-02-10"  // Pasado - ERROR
  },
  ...
}

// Hora inválida
{
  "reserva": {
    ...
    "horaInicio": "10:37"  // No múltiplo de 5 - ERROR
  },
  ...
}

// Tarjeta rechazada
{
  ...
  "origen": {
    "numeroTarjeta": "4000000000000002"  // Rechazada - ERROR 422
  }
}
```

---

## 🎴 Números de Tarjeta de Prueba

### **Tarjetas Válidas (Sandbox)**

| Tipo | Número | Fecha | CVC |
|------|--------|-------|-----|
| Visa | 4111 1111 1111 1111 | 12/99 | 123 |
| Mastercard | 5555 5555 5555 4444 | 12/99 | 456 |
| Amex | 3782 822463 10005 | 12/99 | 1234 |
| Visa Debit | 4012 8888 8888 1881 | 12/99 | 123 |
| Mastercard Debit | 5200 8282 8282 8210 | 12/99 | 456 |

### **Tarjetas Especiales (Testing)**

| Escenario | Número | Resultado |
|-----------|--------|-----------|
| Rechazada | 4000 0000 0000 0002 | Tarjeta rechazada |
| Fraude | 4000 0000 0000 0069 | Sospecha de fraude |
| Límite Excedido | 4000 0000 0000 0127 | Límite de transacciones |
| Fondos Insuficientes | 4000 0000 0000 0002 | Fondos insuficientes |

### **Recomendaciones**

```
NUNCA usar tarjetas reales en desarrollo
NUNCA compartir números reales en código
NUNCA loguear números completos
SIEMPRE usar números de prueba del banco
SIEMPRE enmascarar en logs: ****1111
```

---

## 📊 Matrix de Testing

| Flujo | Request | Validaciones | Pago | BD | Response |
|-------|---------|--------------|------|----|---------| 
| Éxito | ✅ | ✅ | ✅ | ✅ | 201 |
| Fecha Pasada | ✅ | ❌ | ⏭️ | ⏭️ | 400 |
| Hora Inválida | ✅ | ❌ | ⏭️ | ⏭️ | 400 |
| Categoría Duplicada | ✅ | ❌ | ⏭️ | ⏭️ | 400 |
| Tarjeta Rechazada | ✅ | ✅ | ❌ | ⏭️ | 422 |
| No Autorizado | ✅ | ❌ | ⏭️ | ⏭️ | 403 |
| No Autenticado | ⏭️ | ⏭️ | ⏭️ | ⏭️ | 401 |

✅ = Completado exitosamente
❌ = Fallo esperado
⏭️ = Saltado (no se llega)

---

## 🎯 Checklist Final

- [ ] Todos los tests pasan en Postman
- [ ] No hay errores CORS en Console
- [ ] Token se obtiene correctamente
- [ ] Carrito calcula correctamente
- [ ] Reserva se crea sin errores
- [ ] IBAN se guarda en BD
- [ ] Estados de reserva son correctos
- [ ] Errores mostrados al usuario son claros
- [ ] Tarjeta enmascarada en logs
- [ ] Reintentos funcionan en fallos de conexión

