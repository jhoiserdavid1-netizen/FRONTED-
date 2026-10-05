# Vitalis · Plataforma de reservas — Sprint 2

Interfaz de demostración para los flujos del Sprint 2: perfil del paciente, registro y edición de especialidades, consulta y bloqueo de disponibilidad, gestión de citas, cancelación y reprogramación.

## Requisitos

- Node.js 20.19+ o 22.12+
- pnpm

## Ejecutar en desarrollo

```bash
pnpm install
pnpm dev
```

Vite mostrará la dirección local, normalmente `http://localhost:5173`. Esa dirección funciona en el equipo donde corre el servidor. Para que otras personas accedan, el proyecto debe publicarse en un servicio de hosting.

## Compilar para producción

```bash
pnpm build
pnpm preview
```

La compilación estática queda en `dist/`.

## Alcance de esta entrega

La aplicación usa datos de demostración en el navegador (`localStorage`). No está conectada a Azure, una API, autenticación real ni una base de datos. Los cambios son locales al navegador utilizado.

## Historias cubiertas

- HU-03: consultar y actualizar el perfil del paciente.
- HU-04: registrar especialistas desde el rol administrador.
- HU-07: actualizar información y duración de especialidades.
- HU-10: filtrar disponibilidad.
- HU-11: bloquear y desbloquear horarios disponibles.
- HU-13: consultar las citas y su estado.
- HU-14: cancelar una cita.
- HU-15: reprogramar una cita.

Los roles de paciente, especialista y administrador se pueden alternar desde el selector de demostración de la cabecera.