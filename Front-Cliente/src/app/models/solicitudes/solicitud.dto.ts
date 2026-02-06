export interface SolicitudDto {
    id: number;
    usuarioId: number;
    usuarioNombre: string;
    tipo: string;
    estado: string;
    fechaCreacion: string;
    motivo?: string;
}
