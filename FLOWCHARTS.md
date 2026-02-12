# 📊 Diagramas de Flujo Detallados - Sistema de Pagos

## 1️⃣ Flujo General de Pago (Overview)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (FRONTEND)                              │
└─────────────────────────────────────────────────────────────────────────┘
  │
  │ 1. Selecciona Peluquería + Servicios
  │
  ├──→ POST /api/carrito/calcular
  │
  │ 2. Recibe duración total + precio total
  │
  ├──→ Selecciona Fecha + Hora
  │
  │ 3. Ingresa datos de tarjeta
  │
  ├──→ POST /api/reservas/crear {reserva, origen}
  │
  └──────────────────────────┬──────────────────────────────────────────────
                             │
┌────────────────────────────▼──────────────────────────────────────────────┐
│                  SERVIDOR BACKEND (ReservaController)                    │
│                                                                           │
│  1. Validar Token (autenticación)                                        │
│     ✓ Token existe y es válido                                          │
│                                                                           │
│  2. Validar Autorización                                                │
│     ✓ Cliente puede hacer reserva a su nombre                          │
│                                                                           │
│  3. Cargar datos:                                                       │
│     ✓ Usuario (cliente)                                                 │
│     ✓ Peluquería                                                       │
│     ✓ Productos (validar que existen)                                  │
│                                                                           │
└────────────────────────────┬──────────────────────────────────────────────
                             │
┌────────────────────────────▼──────────────────────────────────────────────┐
│             ReservaServiceImpl.crearReserva() - VALIDACIONES              │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ VALIDACIÓN 1: Fecha                                             │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ ✗ Si fecha < hoy → BusinessException                           │   │
│  │ ✗ Si fecha = hoy → BusinessException                           │   │
│  │ ✓ Si fecha >= mañana → Continúa                                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ VALIDACIÓN 2: Hora                                              │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ ✗ Si minutos NO son múltiplo de 5 → BusinessException         │   │
│  │ ✓ Si minutos SON múltiplo de 5 → Continúa                     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ VALIDACIÓN 3: Productos                                         │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ ✗ Si producto no existe → BusinessException                     │   │
│  │ ✗ Si de diferentes peluquerías → BusinessException              │   │
│  │ ✓ Si todos existen y misma peluquería → Continúa               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ VALIDACIÓN 4: Categorías Duplicadas                             │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ Categorías:                                                      │   │
│  │   1 = Corte de pelo (máx 1)                                    │   │
│  │   2 = Corte de barba (máx 1)                                   │   │
│  │   4 = Afeitado clásico (máx 1)                                │   │
│  │                                                                  │   │
│  │ ✗ Si duplicadas → BusinessException                             │   │
│  │ ✓ Si válidas → Continúa                                         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ VALIDACIÓN 5: Cálculos                                          │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ duracionTotal = Σ(producto.duracion)                            │   │
│  │ horaFinal = horaInicio + duracionTotal                         │   │
│  │ precioTotal = Σ(producto.precio)                               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ VALIDACIÓN 6: Horario Disponible                                │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ ✗ Si peluquería cerrada en esa hora → BusinessException        │   │
│  │ ✗ Si horaFinal > horasCierre → BusinessException                │   │
│  │ ✓ Si peluquería abierta → Continúa                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ VALIDACIÓN 7: Solapamiento                                      │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ Busca en BD reservas para:                                      │   │
│  │   - Misma peluquería                                            │   │
│  │   - Misma fecha                                                 │   │
│  │                                                                  │   │
│  │ ✗ Si existe overlap temporal → BusinessException               │   │
│  │ ✓ Si no hay overlap → Continúa                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ✅ TODAS LAS VALIDACIONES PASARON ✅                                   │
│                                                                           │
└────────────────────────────┬──────────────────────────────────────────────
                             │
┌────────────────────────────▼──────────────────────────────────────────────┐
│                    💳 PROCESAMIENTO DE PAGO                               │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ BancoService.pagoTarjeta()                                      │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  Construye PagoTarjetaRequest:                                 │   │
│  │  {                                                              │   │
│  │    "autorizacion": {                                            │   │
│  │      "login": "thebarberhub_login",                            │   │
│  │      "api_token": "token_banco"                                 │   │
│  │    },                                                            │   │
│  │    "origen": {                                                  │   │
│  │      "numeroTarjeta": "4111...1111",                            │   │
│  │      "fechaCaducidad": "12/25",                                 │   │
│  │      "cvc": "123",                                              │   │
│  │      "nombreCompleto": "Juan Pérez"                             │   │
│  │    },                                                            │   │
│  │    "destino": {                                                 │   │
│  │      "iban": "ES9121...332"                                     │   │
│  │    },                                                            │   │
│  │    "pago": {                                                    │   │
│  │      "importe": 45.50,                                          │   │
│  │      "concepto": "Pago Reserva"                                 │   │
│  │    }                                                             │   │
│  │  }                                                               │   │
│  │                                                                  │   │
│  │  POST http://banco-api.com/pagoTarjeta                         │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Espera respuesta del Banco...                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└────────────────────────────┬──────────────────────────────────────────────
                             │
                    ┌────────┴────────┐
                    │                 │
          ❌ FALLO  │               ✅ ÉXITO
                    │                 │
    ┌───────────────▼──┐    ┌────────▼──────────────┐
    │ RestClientException│    │ Pago Aprobado       │
    │                   │    │                      │
    │ • Tarjeta         │    │ Obtiene IBAN:       │
    │   rechazada       │    │ getIbanByNumero()   │
    │ • Fondos insuf.   │    │                      │
    │ • Timeout         │    │ Continúa a BD       │
    │ • Error conexión  │    └────────┬─────────────┘
    │                   │             │
    └────────┬──────────┘             │
             │                        │
    ┌────────▼──────────────┐ ┌───────▼──────────────────┐
    │ ROLLBACK              │ │ CREAR EN BD              │
    │ (sin guardar reserva) │ │                          │
    │                       │ │ 1. ReservaEntity:       │
    │ Response 422:         │ │    • id (auto)          │
    │ {                     │ │    • cliente            │
    │   "status": 422,      │ │    • peluqueria         │
    │   "message":          │ │    • fecha              │
    │   "Error al           │ │    • horaInicio         │
    │    procesar el pago"  │ │    • horaFinal          │
    │ }                     │ │    • precio             │
    │                       │ │    • estado: Pendiente  │
    │ ❌ TRANSACCIÓN FALLA  │ │    • createdAt: NOW()   │
    │                       │ │    • iban: (obtenido)   │
    │                       │ │                          │
    │                       │ │ 2. Para cada producto:  │
    │                       │ │    ReservaProductoEntity│
    │                       │ │    • reserva            │
    │                       │ │    • producto           │
    │                       │ │                          │
    │                       │ │ ✅ GUARDADO EN BD       │
    │                       │ │                          │
    │                       │ │ Response 201:           │
    │                       │ │ {                       │
    │                       │ │   "id": 42,             │
    │                       │ │   "cliente": {...},     │
    │                       │ │   "peluqueria": {...},  │
    │                       │ │   "estado": "Pendiente",│
    │                       │ │   "precio": 45.50,      │
    │                       │ │   "iban": "ES...",      │
    │                       │ │   "productos": [...]    │
    │                       │ │ }                       │
    │                       │                          │
    │                       │ ✅ TRANSACCIÓN ÉXITO    │
    └───────────┬──────────┘ └───────┬─────────────────┘
                │                    │
                │              ┌─────▼─────┐
                │              │ FRONTEND  │
                │              ├───────────┤
                │              │ Status201 │
                │              │ Mostrar   │
                │              │ confir-   │
                │              │ mación ✅ │
                │              └───────────┘
                │
                └──────────────► FRONTEND
                                 │
                              ┌──▼─────┐
                              │ Error  │
                              │ 422    │
                              │ "Tarj. │
                              │ rech." │
                              │ ❌     │
                              └────────┘
```

---

## 2️⃣ Flujo Detallado de Validaciones

```
ENTRADA: ReservaDto, OrigenPagoTarjetaRequest
│
├─────────────────────────────────────────────────────────────────────────┐
│ PASO 1: validarFecha(LocalDate fecha)                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  fecha < hoy ──► EXCEPTION ─┐                                           │
│                              │                                          │
│  fecha = hoy ──► EXCEPTION ──┤                                         │
│                              │                                          │
│  fecha >= mañana ──► ✅ CONTINÚA                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────────────┐
│ PASO 2: validarMinutos(LocalTime hora)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  hora.minutos % 5 != 0 ──► EXCEPTION ─┐                                │
│                                        │                               │
│  hora.minutos % 5 = 0 ──► ✅ CONTINÚA │                              │
│                                        │                               │
│  (Ejemplos válidos: :00, :05, :10, :15, :20, etc)                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────────────┐
│ PASO 3: Cargar y validar Productos                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Obtener por IDs ──► Alguno no existe? ──► EXCEPTION ─┐               │
│                                                       │                │
│                   ──► Todos existen? ──► ✅ CONTINÚA │               │
│                                                       │                │
└─────────────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────────────┐
│ PASO 4: validarProductosPeluqueria()                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FOR EACH producto:                                                    │
│    producto.peluqueria.id != reserva.peluqueria.id                   │
│    ──► EXCEPTION ─┐                                                    │
│                   │                                                    │
│  Todos same peluquería? ──► ✅ CONTINÚA                              │
│                   │                                                    │
└─────────────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────────────┐
│ PASO 5: validarCategorias()                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Contar productos por categoría:                                       │
│    1 = Corte pelo                                                      │
│    2 = Corte barba                                                    │
│    4 = Afeitado                                                       │
│                                                                          │
│  count(cat_1) > 1? ──► EXCEPTION ─┐                                    │
│  count(cat_2) > 1? ──► EXCEPTION ─┤                                   │
│  count(cat_4) > 1? ──► EXCEPTION ─┤                                   │
│                                   │                                    │
│  Todas OK? ──► ✅ CONTINÚA        │                                   │
│                                   │                                    │
└─────────────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────────────┐
│ PASO 6: Calcular Valores                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  duracionTotal = SUM(producto.duracion)                               │
│  horaFinal = horaInicio + duracionTotal minutos                       │
│  precioTotal = SUM(producto.precio)                                   │
│                                                                          │
│  ✅ CONTINÚA                                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────────────┐
│ PASO 7: validarHorario()                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Buscar en BD:                                                          │
│  PeluqueriaHorario WHERE peluqueria_id = ? AND dia = ?                │
│                                                                          │
│  horarioInicio > horaInicio ──► EXCEPTION ─┐                           │
│  horarioFinal < horaFinal ──► EXCEPTION ───┤                          │
│                                             │                          │
│  Horario válido? ──► ✅ CONTINÚA           │                          │
│                                             │                          │
└─────────────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────────────┐
│ PASO 8: validarSolapamientos()                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SELECT FROM Reserva WHERE                                             │
│    peluqueria_id = ? AND                                              │
│    fecha = ? AND                                                       │
│    estado != 'Cancelada'                                              │
│                                                                          │
│  FOR EACH existente:                                                   │
│    ┌─────────────────────────────────────────┐                         │
│    │ Nueva:      |--|════════════════|--|    │                         │
│    │ Existente:  |-----|════════|--|           │                        │
│    │              ▲    ▲       ▲  ▲            │                        │
│    │              │    └───┬───┘  │            │                        │
│    │              │        └──────┘ (OVERLAP)  │                        │
│    │                                           │                        │
│    │ IF overlap THEN ──► EXCEPTION             │                        │
│    └─────────────────────────────────────────┘                         │
│                                                                          │
│  No overlaps? ──► ✅ CONTINÚA                                          │
│                                                                          │
│  Nota: Se usa una query SQL con:                                       │
│    (horaInicio < reserva.horaFinal) AND                               │
│    (horaFinal > reserva.horaInicio)                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────────────┐
│ ✅ TODAS LAS VALIDACIONES PASARON                                      │
│ Procede a: PAGO y CREACIÓN DE RESERVA                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ Flujo de Pago (Transacción Atómica)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    💳 TRANSACCIÓN DE PAGO ATÓMICA                        │
│                                                                          │
│  Punto de No Retorno: Si pago falla, TODO el cambio se revierte        │
└──────────────────────────────────────────────────────────────────────────┘

ESTADO ANTES:
═════════════════════════════════════════════════════════════════════════
  BD (Reserva):     vacío
  BD (ReservaProducto): vacío
  Banco:            no procesado

PASO 1: Enviar solicitud de pago
═════════════════════════════════════════════════════════════════════════

BancoService.pagoTarjeta(PagoTarjetaRequest request)
├─ POST /banco/pagoTarjeta
│  ├─ autorizacion: {login, api_token}
│  ├─ origen: {numeroTarjeta, fechaCaducidad, cvc, nombreCompleto}
│  ├─ destino: {iban_peluqueria}
│  └─ pago: {importe, concepto}
│
└─ Respuesta del Banco:
   ├─ 200 OK → Pago aprobado ✅
   │  └─ Continúa...
   │
   └─ 4xx/5xx → Pago rechazado ❌
      └─ RestClientException lanzada

ESCENARIO A: Pago Rechazado ❌
═════════════════════════════════════════════════════════════════════════

RestClientException caught in try-catch
│
├─ Transacción BD: @Transactional ROLLBACK
│  └─ Ningún INSERT se ejecuta
│
├─ Flujo vuelve al Controller
│  └─ Re-lanza como BusinessException
│
└─ Response al Cliente:
   HTTP 422 Unprocessable Entity
   {
     "message": "Error al procesar el pago: Tarjeta rechazada"
   }

ESTADO DESPUÉS (Rollback):
═════════════════════════════════════════════════════════════════════════
  BD (Reserva):     vacío ✓
  BD (ReservaProducto): vacío ✓
  Banco:            rechazado, dinero NO cobrado ✓
  Usuario:          ve error y puede reintentar


ESCENARIO B: Pago Aprobado ✅
═════════════════════════════════════════════════════════════════════════

Banco responde: 200 OK
│
├─ PASO 2: Obtener IBAN de la tarjeta
│  └─ BancoService.getIbanByNumeroTarjeta("4111...")
│     └─ GET /banco/cuentas/tarjeta/4111...
│        └─ Respuesta: "ES9121000418450200051332"
│           └─ iban = "ES9121000418450200051332"
│
├─ PASO 3: Crear ReservaEntity
│  └─ new ReservaEntity(
│       null,                    // id (auto)
│       usuario_entity,
│       peluqueria_entity,
│       diaSemana,
│       fechaReserva,
│       horaInicio,
│       horaFinal,
│       precioTotal,
│       EstadoReserva.Pendiente,
│       LocalDateTime.now(),     // createdAt
│       null,                    // updatedAt
│       iban,                    // ← GUARDADO
│       List.of()
│     )
│
├─ PASO 4: Guardar Reserva en BD
│  └─ reservaRepository.save(entity)
│     └─ INSERT INTO reserva (...) VALUES (...)
│        └─ Retorna: entity con id generado = 42
│
├─ PASO 5: Crear ReservaProductoEntity para cada producto
│  └─ FOR EACH producto en lista:
│     ├─ new ReservaProductoEntity(
│     │    null,              // id
│     │    reserved_entity,   // reserva con id=42
│     │    producto_entity
│     │  )
│     │
│     └─ reservaProductoRepository.save(rpEntity)
│        └─ INSERT INTO reserva_producto (...) VALUES (...)
│
├─ PASO 6: Construir ReservaDto con todos los datos
│  └─ new ReservaDto(
│       42,                    // id generado
│       cliente_dto,
│       peluqueria_dto,
│       diaSemana,
│       fechaReserva,
│       horaInicio,
│       horaFinal,
│       precioTotal,
│       EstadoReserva.Pendiente,
│       createdAt,
│       updatedAt,
│       iban,
│       productos_dto_list
│     )
│
└─ Response al Cliente:
   HTTP 201 Created
   {
     "id": 42,
     "cliente": {...},
     "peluqueria": {...},
     "fecha": "2025-02-20",
     "horaInicio": "10:30",
     "horaFinal": "11:15",
     "precio": 25.00,
     "estado": "Pendiente",
     "iban": "ES9121000418450200051332",
     "productos": [...]
   }

ESTADO DESPUÉS (Success):
═════════════════════════════════════════════════════════════════════════
  BD (Reserva):     1 fila INSERT ✓
    id: 42
    cliente_id: 1
    peluqueria_id: 2
    estado: 'Pendiente'
    iban: 'ES9121...'
    precio: 25.00
    
  BD (ReservaProducto): 2 filas INSERT ✓
    [1] reserva_id: 42, producto_id: 5
    [2] reserva_id: 42, producto_id: 7
    
  Banco:            dinero cobrado ✓
    Se han transferido 25.00€ a la peluquería
    
  Usuario:          ve confirmación ✅
    Puede ver su reserva en "Mis Reservas"
```

---

## 4️⃣ Comparativa: Éxito vs Error

```
                        ÉXITO ✅               VS              ERROR ❌
═══════════════════════════════════════════════════════════════════════════

Validaciones         Todas pasan ✓              Una falla ❌
Pago Banco          Aprobado ✓                Rechazado ❌
BD Transacción      COMMIT ✓                  ROLLBACK ❌
Reserva Creada      SÍ ✓                      NO ❌
ReservaProducto     INSERT ✓                  NO ❌
Response            201 CREATED ✓             400/422 ERROR ❌
Cliente ve:         Confirmación ✓            Mensaje error ❌
BD Estado:          1 Reserva + 2 Productos   0 registros
Dinero:             Cobrado ✓                 No cobrado ✓
Reintentos:         NO (éxito)                SÍ (puede reintentar)

═══════════════════════════════════════════════════════════════════════════

Timeline:

ÉXITO:
  t=0ms   : Cliente envía request
  t=50ms  : Backend valida datos
  t=100ms : Backend consulta BD (productos, peluquería)
  t=150ms : Backend llama a Banco
  t=300ms : Banco aprueba pago
  t=350ms : Backend obtiene IBAN
  t=400ms : Backend INSERT Reserva
  t=420ms : Backend INSERT ReservaProductos (x2)
  t=450ms : Backend responde 201 CREATED
  t=500ms : Cliente recibe confirmación

TOTAL: ~500ms

ERROR (Fecha pasada):
  t=0ms   : Cliente envía request
  t=50ms  : Backend valida fecha
  t=60ms  : Fecha < hoy → BusinessException
  t=80ms  : Backend responde 400 BAD REQUEST
  t=100ms : Cliente recibe error

TOTAL: ~100ms (mucho más rápido, sin llegar a pago)

ERROR (Tarjeta rechazada):
  t=0ms   : Cliente envía request
  t=50ms  : Backend valida datos (pasan)
  t=100ms : Backend consulta BD (OK)
  t=150ms : Backend llama a Banco
  t=500ms : Banco rechaza "Tarjeta rechazada"
  t=510ms : RestClientException capturada
  t=520ms : ROLLBACK BD (ningún INSERT)
  t=540ms : Backend responde 422 UNPROCESSABLE
  t=600ms : Cliente recibe error

TOTAL: ~600ms

```

---

## 5️⃣ Flujo de Solicitud de Peluquería (Suscripción)

```
┌──────────────────────────────────────────────────────────────────────────┐
│         Cliente se registra como Peluquería - Flujo de Pago             │
└──────────────────────────────────────────────────────────────────────────┘

PASO 1: CREAR SOLICITUD (Sin pago)
═════════════════════════════════════════════════════════════════════════
  POST /api/solicitudes/create/peluquerias
  {
    "municipio": "Madrid",
    "direccion": "Calle Mayor 10",
    "telefono": "912345678"
  }
  
  → Response 200 OK
    SolicitudPeluqueria creada con estado: Pendiente


PASO 2: ESPERAR APROBACIÓN (Admin)
═════════════════════════════════════════════════════════════════════════
  Admin revisa en /solicitudes/pendientes
  
  PUT /api/solicitudes/aprobar/{solicitudId}
  
  → Solicitud pasa a estado: Aprobada


PASO 3: CONFIRMAR SUSCRIPCIÓN (Con pago de 50€)
═════════════════════════════════════════════════════════════════════════
  
  Cliente logueado ve solicitud aprobada
  
  PUT /api/solicitudes/confirmar/{solicitudId}
  {
    "numeroTarjeta": "4111111111111111",
    "fechaCaducidad": "12/25",
    "cvc": "123",
    "nombreCompleto": "Juan Pérez García"
  }
  
  ┌─────────────────────────────────────────────────┐
  │ SolicitudService.confirmarSolicitudPeluqueria() │
  └────────────────┬────────────────────────────────┘
                   │
                   ├─→ Validar token
                   │
                   ├─→ Validar usuario es propietario
                   │
                   ├─→ Validar tipo = Peluqueria
                   │
                   ├─→ Validar estado = Aprobada
                   │
                   ├─→ 💳 BancoService.pagoTarjeta(
                   │      importe: 50.00,
                   │      concepto: "Suscripción a TheBarberHub"
                   │    )
                   │
                   ├─→ IF pago FALLA
                   │   └─→ Exception → Response 422
                   │
                   ├─→ IF pago ÉXITO
                   │   ├─→ Obtener IBAN
                   │   ├─→ Actualizar estado a: Confirmada
                   │   ├─→ UsuarioService.updateRol(user_id, Peluqueria)
                   │   ├─→ Crear Peluqueria entity
                   │   ├─→ Guardar en BD
                   │   └─→ Response 200 OK
                   │
                   └─→ Cliente ahora es Peluqueria
                      Puede crear productos y horarios


ESTADOS FINALES:
═════════════════════════════════════════════════════════════════════════

✅ Éxito:
   Solicitud.estado = Confirmada
   Usuario.rol = Peluqueria
   Peluqueria creada con:
     - usuario
     - municipio
     - direccion
     - telefono
     - iban (del pago)
   50€ cobrados

❌ Error Pago:
   Solicitud.estado = Aprobada (sin cambios)
   Usuario.rol = Cliente (sin cambios)
   Peluqueria NO creada
   50€ NO cobrados
   Response 422


```

---

## 6️⃣ Matriz de Decisión - Qué Hacer en Cada Error

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    ÁRBOL DE DECISIÓN - MANEJO DE ERRORES                │
└──────────────────────────────────────────────────────────────────────────┘


        ¿Recibiste respuesta del servidor?
               │                    │
              NO                    SÍ
               │                    │
        ┌──────▼──────┐      ┌──────▼──────┐
        │ Timeout/     │      │ HTTP Status │
        │ Conexión     │      │ Code        │
        │ Error        │      │             │
        └──────┬──────┘      └──────┬──────┘
               │                    │
        ┌──────▼──────┐      ┌──────▼──────────────────┐
        │ • Reintentar│      │  ¿Cuál es el código?   │
        │   hasta 3x  │      │  (200, 400, 401, etc)  │
        │ • Backoff   │      └──────┬──────────────────┘
        │   exponenc. │             │
        │ • Timeout   │      ┌──────┴──────┬─────┬──────┬──────┐
        │   30seg     │      │             │     │      │      │
        │ • Mostrar   │      2xx          4xx   401   403    500
        │   error     │      (Éxito)    (Valid) (Auth)(Perm)(Serv)
        │   genérico  │      │             │     │      │      │
        └────────────┘      │             │     │      │      │
                            │             │     │      │      │
                     ┌──────▼──┐   ┌─────▼─┐  │      │      │
                     │Procesar │   │Analizar│  │      │      │
                     │respuesta│   │error   │  │      │      │
                     │Guardar  │   │específ.│  │      │      │
                     │en BD    │   │        │  │      │      │
                     │Mostrar  │   │        │  │      │      │
                     │confirm. │   │        │  │      │      │
                     └─────────┘   │        │  │      │      │
                                   │        │  │      │      │
                            ┌──────▼──┐ ┌──▼──▼──┐ ┌──▼──┐ ┌──▼──┐
                            │• Mostrar│ │Redir. │ │Acce-│ │Rein-│
                            │  error  │ │login  │ │so   │ │tent.│
                            │específ. │ │       │ │nega-│ │     │
                            │• Campos │ │       │ │do   │ │     │
                            │ afectad.│ │       │ │     │ │     │
                            │• Opción │ │       │ │     │ │     │
                            │ reinten-│ │       │ │     │ │     │
                            │tar      │ │       │ │     │ │     │
                            └─────────┘ └───────┘ └─────┘ └─────┘


MATRIZ DE ACCIONES:

Status │ Mensaje                      │ Acción Frontend
───────┼──────────────────────────────┼──────────────────────────────
201    │ Reserva creada               │ ✅ Mostrar confirmación
200    │ Solicitud confirmada         │ ✅ Mostrar éxito
───────┼──────────────────────────────┼──────────────────────────────
400    │ Validación fallida           │ 🔴 Mostrar errores por campo
       │ • Fecha pasada               │    Permitir corrección
       │ • Hora inválida              │    Reintentar
       │ • Categoría duplicada        │
───────┼──────────────────────────────┼──────────────────────────────
401    │ Token no válido/expirado     │ 🔴 Limpiar localStorage
       │                              │    Redirigir a /login
       │                              │    Mostrar "Sesión expirada"
───────┼──────────────────────────────┼──────────────────────────────
403    │ No tienes permiso            │ 🔴 Mostrar acceso denegado
       │ • Solo tu propia reserva     │    No permitir reintentos
       │                              │    Redirigir a home
───────┼──────────────────────────────┼──────────────────────────────
404    │ No encontrado                │ 🔴 Mostrar recurso no existe
       │ • Peluquería no existe       │    Volver a lista
───────┼──────────────────────────────┼──────────────────────────────
422    │ Error de pago                │ 🔴 "Tarjeta rechazada"
       │ • Tarjeta rechazada          │    "Fondos insuficientes"
       │ • Fondos insuficientes       │    Permitir reintentar
───────┼──────────────────────────────┼──────────────────────────────
500    │ Error servidor               │ 🔴 Mostrar error genérico
       │                              │    Sugerir reintentar después
───────┼──────────────────────────────┼──────────────────────────────
∅      │ Sin respuesta (timeout)      │ 🔴 Reintentar automático
       │                              │    Max 3 intentos
       │                              │    Mostrar spinner
```

---

Estos diagramas te dan una visión completa del flujo de pagos en cada etapa.
Úsalos como referencia cuando debuguees en el frontend o backend.

