# ⚡ Referencia Rápida - Comandos y Snippets

## 🗺️ Mapa de Archivos del Proyecto

```
tienda-back-1/
├── README_PAYMENT_SYSTEM.md          ← 📖 EMPIEZA AQUÍ
├── PAYMENT_FLOW_DEBUG.md             ← 📚 Guía principal (52KB)
├── FRONTEND_PAYMENT_EXAMPLES.md      ← 💻 Código TypeScript/React (45KB)
├── TESTING_AND_EXAMPLES.md           ← 🧪 Casos de prueba (38KB)
├── FLOWCHARTS.md                     ← 📊 Diagramas visuales (42KB)
├── QUICK_REFERENCE.md                ← ⚡ Este archivo
│
├── Diagrama.puml                     ← 📐 Diagrama ER del sistema
│
├── tienda/
│   ├── pom.xml                       ← Dependencias Maven
│   │
│   ├── src/main/java/com/fpmislata/daw/tienda/
│   │   │
│   │   ├── controller/
│   │   │   ├── ReservaController.java
│   │   │   ├── SolicitudController.java
│   │   │   └── CarritoController.java
│   │   │
│   │   ├── domain/service/
│   │   │   ├── ReservaService.java
│   │   │   ├── SolicitudService.java
│   │   │   ├── BancoService.java          ← 💳 Procesamiento de pago
│   │   │   └── CarritoService.java
│   │   │
│   │   ├── domain/service/impl/
│   │   │   ├── ReservaServiceImpl.java     ← ⭐ Lógica principal pago
│   │   │   ├── SolicitudServiceImpl.java   ← ⭐ Lógica suscripción
│   │   │   └── BancoServiceImpl.java       ← ⭐ Integración banco
│   │   │
│   │   ├── controller/webModel/request/
│   │   │   ├── PagoTarjetaRequest.java    ← Payload pago tarjeta
│   │   │   ├── PagoRequest.java           ← Datos pago básico
│   │   │   ├── AutorizacionRequest.java   ← Credenciales banco
│   │   │   ├── OrigenPagoTarjetaRequest.java  ← Datos tarjeta
│   │   │   ├── DestinoRequest.java        ← IBAN destinatario
│   │   │   ├── TransferenciaRequest.java  ← Transferencia IBAN
│   │   │   ├── CarritoRequest.java        ← Cálculo carrito
│   │   │   └── CrearReservaRequest.java   ← Crear reserva
│   │   │
│   │   └── enums/
│   │       ├── EstadoReserva.java         ← Estados: Pendiente, etc
│   │       ├── EstadoSolicitud.java       ← Estados solicitud
│   │       └── Rol.java                   ← Roles usuario
│   │
│   └── src/main/resources/
│       └── application.properties         ← Configuración banco
│           banco.api.url = ...
│           banco.thebarberhub.login = ...
│           banco.thebarberhub.api_token = ...
│           banco.thebarberhub.iban = ...
│
└── target/
    └── classes/                    ← Compilado (ignorar)
```

---

## 🔗 URLs Principales

```
Endpoints de Pago:

POST   /api/carrito/calcular
  → Calcula precio + duración total
  → Body: { peluqueriaId, productoIds }
  → Response: { duracionTotal, precioTotal }

POST   /api/reservas/crear
  → Crea reserva CON pago
  → Body: { reserva {...}, origen {...} }
  → Response: 201 + ReservaResponse

GET    /api/reservas/cliente/{clienteId}
  → Lista reservas del cliente

PUT    /api/solicitudes/confirmar/{solicitudId}
  → Confirma suscripción CON pago (50€)
  → Body: { numeroTarjeta, fechaCaducidad, cvc, nombreCompleto }
  → Response: 200 + SolicitudResponse
```

---

## 📦 DTOs Principales

### **Entrada (Requests)**

```typescript
// Pago con Tarjeta
{
  "autorizacion": {
    "login": "string",
    "api_token": "string"
  },
  "origen": {
    "numeroTarjeta": "4111111111111111",
    "fechaCaducidad": "12/25",
    "cvc": "123",
    "nombreCompleto": "Juan Pérez"
  },
  "destino": {
    "iban": "ES9121000418450200051332"
  },
  "pago": {
    "importe": 45.50,
    "concepto": "Pago Reserva"
  }
}

// Crear Reserva
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
    "nombreCompleto": "Juan Pérez"
  }
}
```

### **Salida (Responses)**

```typescript
// 201 Reserva Creada
{
  "id": 42,
  "cliente": { "id": 1, "nombre": "Juan Pérez" },
  "peluqueria": { "id": 2, "nombre": "La Barbería" },
  "fechaReserva": "2025-02-20",
  "horaInicio": "10:30",
  "horaFinal": "11:15",
  "precio": 25.00,
  "estado": "Pendiente",
  "iban": "ES9121000418450200051332",
  "productos": [...]
}

// 400 Error Validación
{
  "status": 400,
  "message": "No se puede reservar en fechas pasadas",
  "path": "/api/reservas/crear"
}

// 422 Error Pago
{
  "status": 422,
  "message": "Error al procesar el pago: Tarjeta rechazada",
  "path": "/api/reservas/crear"
}
```

---

## ✅ Validaciones Quick Check

### **Antes de enviar a Backend**

```javascript
// Tarjeta
✓ numeroTarjeta.length === 16 (sin espacios)
✓ Pasa algoritmo de Luhn
✓ fechaCaducidad: /^\d{2}\/\d{2}$/
✓ No expirada: mesNum >= mesActual && (mesNum > mesActual || añoNum >= añoActual)
✓ cvc: /^\d{3,4}$/
✓ nombre: length >= 3 && length <= 50

// Reserva
✓ fecha >= mañana
✓ hora: minutos % 5 === 0
✓ productoIds.length > 0
✓ peluqueriaId > 0

// Carrito
✓ Calcular antes de pagar
✓ Mostrar duracionTotal + precioTotal
✓ Permitir edición antes de pago final
```

---

## 🔧 Configuración Backend (application.properties)

```properties
# Banco
banco.api.url=http://localhost:8000/api
banco.thebarberhub.login=thebarberhub_user
banco.thebarberhub.api_token=token_secreto_banco
banco.thebarberhub.iban=ES9121000418450200051332

# BD
spring.datasource.url=jdbc:mysql://localhost:3306/tienda
spring.datasource.username=root
spring.datasource.password=password

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Logging
logging.level.com.fpmislata.daw.tienda=DEBUG
logging.level.org.springframework.web=INFO
```

---

## 🧪 Testing Quick Commands

### **Con Postman**

```bash
# 1. Login (obtener token)
POST http://localhost:8080/api/usuarios/login
Body: { "email": "juan@example.com", "contraseña": "password123" }
Save token to environment: pm.environment.set("token", pm.response.json().token);

# 2. Calcular carrito
POST http://localhost:8080/api/carrito/calcular
Headers: token={{token}}
Body: { "peluqueriaId": 1, "productoIds": [5, 7] }

# 3. Crear reserva
POST http://localhost:8080/api/reservas/crear
Headers: token={{token}}
Body: { "reserva": {...}, "origen": {...} }
```

### **Con cURL**

```bash
# Login
curl -X POST http://localhost:8080/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","contraseña":"password123"}'

# Crear reserva
curl -X POST http://localhost:8080/api/reservas/crear \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN_HERE" \
  -d '{
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
      "nombreCompleto": "Juan Pérez"
    }
  }'
```

---

## 🔍 Debugging Rápido

### **Logs a buscar**

```
ReservaServiceImpl.crearReserva():
  ✓ === INICIANDO CREACIÓN DE RESERVA ===
  ✓ ✓ Fecha validada
  ✓ === INICIANDO PAGO ===
  ✓ ✓ PAGO EXITOSO
  ✓ ✓ Reserva creada con ID: 42

BancoServiceImpl.pagoTarjeta():
  ✓ POST /pagoTarjeta con 4111...1111
  ✓ Respuesta: 200 OK

Si hay error:
  ✗ ✗ PAGO FALLIDO: Tarjeta rechazada
  ✗ Exception: BusinessException
  ✗ ROLLBACK BD (sin INSERT)
```

### **Puntos de breakpoint**

```
ReservaServiceImpl.java:
  L78: validarFecha()        ← Verificar fecha
  L80: validarMinutos()      ← Verificar hora
  L100: bancoService.pago()  ← Antes de enviar
  L130: reservaRepository.save()  ← Antes de guardar

BancoServiceImpl.java:
  L20: restTemplate.postForObject()  ← Llamada al banco
```

### **Verificación BD**

```sql
-- Ver última reserva creada
SELECT * FROM reserva ORDER BY id DESC LIMIT 1;

-- Ver productos de la reserva
SELECT rp.*, p.nombre 
FROM reserva_producto rp 
JOIN producto p ON rp.producto_id = p.id 
WHERE rp.reserva_id = 42;

-- Verificar IBAN guardado
SELECT id, iban FROM reserva WHERE id = 42;

-- Ver todas las reservas del cliente
SELECT * FROM reserva WHERE cliente_id = 1;
```

---

## 📊 Estados Válidos

### **EstadoReserva**
```
Pendiente      → Reserva creada, esperando confirmación
Confirmada     → Confirmada por peluquería
Cancelada      → Cancelada por cliente
Rechazada      → Rechazada por peluquería
```

### **EstadoSolicitud**
```
Pendiente      → Solicitud creada, esperando revisión
Aprobada       → Aprobada por admin
Confirmada     → Confirmada por usuario (con pago)
Rechazada      → Rechazada por admin
```

---

## 🔐 Headers Importantes

```
POST /api/reservas/crear HTTP/1.1
Content-Type: application/json
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
```

---

## ⏱️ Timeouts Recomendados

```
Validaciones:         < 50ms
BD Query:             < 100ms
Pago (Banco):         3-5 segundos
Total transacción:    < 10 segundos
Frontend timeout:     30 segundos (si supera, mostrar error)
```

---

## 🚀 Flujo Completo (1 minuto)

```
1. Cliente autenticado (token obtenido)
   └─ localStorage.getItem('token') ✓

2. Selecciona peluquería + servicios
   └─ peluqueriaId: 2, productoIds: [5, 7]

3. Frontend valida datos localmente
   └─ Fecha >= mañana ✓
   └─ Hora múltiplo 5 ✓
   └─ Productos > 0 ✓

4. Calcula carrito
   └─ POST /api/carrito/calcular
   └─ Response: { duracionTotal: 45, precioTotal: 25.00 }

5. Selecciona fecha y hora
   └─ fechaReserva: "2025-02-20"
   └─ horaInicio: "10:30"

6. Ingresa datos de tarjeta
   └─ numeroTarjeta: "4111111111111111"
   └─ fechaCaducidad: "12/25"
   └─ cvc: "123"
   └─ nombreCompleto: "Juan Pérez"

7. Frontend valida tarjeta
   └─ Luhn check ✓
   └─ Fecha no expirada ✓
   └─ CVC 3-4 dígitos ✓

8. Envía request completo
   └─ POST /api/reservas/crear
   └─ Body: { reserva: {...}, origen: {...} }

9. Backend valida (8 validaciones)
   └─ Fecha, hora, productos, categorías
   └─ Horario, solapamientos ✓

10. Backend procesa pago
    └─ BancoService.pagoTarjeta()
    └─ POST /banco/pagoTarjeta
    └─ Response: 200 OK ✓

11. Backend obtiene IBAN
    └─ BancoService.getIbanByNumeroTarjeta()
    └─ Response: "ES9121..." ✓

12. Backend crea reserva en BD
    └─ INSERT Reserva: id=42
    └─ INSERT ReservaProducto (x2)

13. Backend responde
    └─ 201 CREATED + ReservaResponse

14. Frontend recibe
    └─ Muestra confirmación ✓
    └─ Puede ver reserva en "Mis Reservas"

⏱️ TOTAL: ~500-1000ms
```

---

## 🆘 SOS - Errores Frecuentes

| Error | Causa | Solución |
|-------|-------|----------|
| 401 Unauthorized | Token no válido/ausente | Loginear nuevamente |
| 400 Bad Request | Validación fallida | Ver mensaje de error |
| 422 Error Pago | Tarjeta rechazada | Usar otra tarjeta |
| 403 Forbidden | No autorizado | Verificar token/usuario |
| 500 Server Error | Error del servidor | Revisar logs backend |
| Timeout | Banco no responde | Reintentar después |
| CORS Error | Origin no permitido | Revisar CorsConfig |

---

## 📝 Notas Importantes

```
⚠️ NUNCA loguear números de tarjeta completos
⚠️ NUNCA guardar tarjetas en BD
⚠️ SIEMPRE usar HTTPS en producción
⚠️ SIEMPRE validar en backend (no confiar en frontend)
⚠️ SIEMPRE manejar excepciones de pago específicamente
⚠️ SIEMPRE usar @Transactional para pagos
⚠️ SIEMPRE verificar IBAN guardado después de pago

✅ SIEMPRE enmascarar datos en logs
✅ SIEMPRE mostrar errores claros al usuario
✅ SIEMPRE permitir reintentos en fallos
✅ SIEMPRE confirmar con cliente después de pago
✅ SIEMPRE hacer rollback en caso de fallo
✅ SIEMPRE testear con números de prueba
✅ SIEMPRE documentar cambios en pago
```

---

## 🎯 KPIs de Éxito

```
Tasa de éxito en pagos      > 95%
Tiempo promedio transacción < 2 segundos
Errores de validación       < 5%
Tasa de reintento           < 10%
Satisfacción cliente        > 4.5/5

Indicadores de problema:
  ❌ Múltiples timeouts
  ❌ Errors 422 frecuentes
  ❌ Datos IBAN inconsistentes
  ❌ Rollbacks no esperados
  ❌ Tarjetas rechazadas > 20%
```

---

## 📞 Contactos Rápidos

```
Problema Backend:
  → Ver logs en Terminal: Run: TiendaApplication
  → Revisar application.properties
  → Contactar desarrollador backend

Problema Frontend:
  → Abrir DevTools (F12)
  → Ver Network tab
  → Ver Console tab
  → Contactar desarrollador frontend

Problema Banco:
  → Verificar conectividad
  → Revisar credenciales (login, api_token)
  → Usar números de tarjeta de prueba
  → Verificar endpoint correcto

Problema BD:
  → Revisar conexión MySQL
  → Verificar permisos usuario BD
  → Ejecutar migration si falta
```

---

**Última actualización:** 12 de febrero de 2025

**Versión:** 1.0

Este documento es una referencia rápida. Para más detalles, consulta los documentos principales.

