export interface AutorizacionRequest {
    login: string;
    api_token: string;
}

export interface OrigenPagoTarjetaRequest {
    numeroTarjeta: string;
    nombreCompleto: string;
    fechaCaducidad: string;
    cvc: string;
}

export interface DestinoRequest {
    iban: string;
}

export interface PagoDetalleRequest {
    importe: number;
    concepto?: string;
}

export interface PagoTarjetaRequest {
    autorizacion: AutorizacionRequest;
    origen: OrigenPagoTarjetaRequest;
    destino: DestinoRequest;
    pago: PagoDetalleRequest;
}
// Para crear reserva con pago integrado
export interface ReservaInsertRequest {
    clienteId: number;
    peluqueriaId: number;
    diaSemana: number; // 0-6 (Sunday-Saturday)
    productoIds: number[];
    fechaReserva: string; // yyyy-MM-dd
    horaInicio: string; // HH:mm
}

export interface CrearReservaRequest {
    reserva: ReservaInsertRequest;
    origen: OrigenPagoTarjetaRequest;
}