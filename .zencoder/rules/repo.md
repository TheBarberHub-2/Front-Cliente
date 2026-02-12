---
description: Repository Information Overview
alwaysApply: true
---

# front-cliente Information

## Summary
The `front-cliente` project is an Angular-based web application (Version 20.3.0) developed for a client interface, likely for a service-oriented business (service names like `peluquerias`, `reservas`, and `carrito` suggest a barber shop or hair salon). It features a modern frontend architecture with clear separation of concerns using services, models, and a component-based UI.

## Structure
- **`src/app/`**: Core application logic.
  - **`components/`**: UI components organized by `pages` and `ui`.
  - **`services/`**: API interaction and business logic (e.g., Auth, Cart, Reservations).
  - **`models/`**: TypeScript interfaces and data models.
  - **`scss/`**: Modularized style definitions.
  - **`interceptors/`**: HTTP request/response middleware.
- **`public/`**: Static assets like images and favicons.
- **`angular.json`**: Angular CLI configuration.
- **`tsconfig.json`**: TypeScript compilation settings.

## Language & Runtime
**Language**: TypeScript  
**Version**: ^5.9.2 (TypeScript), ^20.3.0 (Angular)  
**Build System**: Angular CLI  
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- `@angular/core`: ^20.3.0
- `@angular/common`: ^20.3.0
- `@angular/router`: ^20.3.0
- `@angular/forms`: ^20.3.0
- `rxjs`: ~7.8.0
- `zone.js`: ~0.15.0

**Development Dependencies**:
- `@angular/cli`: ^20.3.0
- `@angular/build`: ^20.3.0
- `typescript`: ~5.9.2
- `jasmine-core`: ~5.9.0
- `karma`: ~6.4.0

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server
npm run start

# Build for production
npm run build
```

## Testing

**Framework**: Karma & Jasmine
**Test Location**: Throughout `src/app/` (e.g., `app.spec.ts`) and `tsconfig.spec.json` configuration.
**Naming Convention**: `*.spec.ts`
**Configuration**: `karma.conf.js` (implied), `tsconfig.spec.json`

**Run Command**:
```bash
npm run test
```
