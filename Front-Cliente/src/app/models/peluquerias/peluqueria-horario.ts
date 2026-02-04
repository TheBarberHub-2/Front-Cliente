export interface PeluqueriaHorario {
    id: number;
    peluqueriaId?: number; // Optional as it might be nested or just ID reference
    diaSemana: string; // 'LUNES', 'MARTES', etc.
    horaApertura: string; // 'HH:mm:ss'
    horaCierre: string; // 'HH:mm:ss'
}
