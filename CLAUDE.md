# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`enda_tao` — Spring Boot 4.0.2 / Java 17 backend for a field-agent management system (visit events, targets/"objectifs", transfers, GPS localisation of agents) built around a Keycloak-backed role hierarchy: `ROLE_SUPERADMIN` > `ROLE_REGIONAL_SUPERVISOR` > `ROLE_SUPERVISOR` > `ROLE_USER`. No frontend lives in this repo (CORS is configured for an Angular app on `localhost:4200/4201`).

## Commands

Windows: use `mvnw.cmd`; the same targets apply.

```
./mvnw clean install                          # build
./mvnw test                                   # run all tests
./mvnw test -Dtest=EndaTaoApplicationTests    # single test class
./mvnw test -Dtest=EndaTaoApplicationTests#contextLoads   # single test method
./mvnw spring-boot:run                        # run locally (port 8085)
```

Running locally requires a MySQL instance (`jdbc:mysql://localhost:3306/enda_tao`, auto-created, user `root`) and a Keycloak instance at `http://localhost:8088` with realm `enda_tao_realm` and client `enda_tao_client`. Swagger UI is at `/swagger-ui.html` once running.

## Architecture

### Dual authentication path (important, non-obvious)

The app does **not** use Spring's standard OAuth2-login redirect flow even though `spring-boot-starter-oauth2-client` is on the classpath and configured. Instead:

- `AuthController` (`/auth/login`, `/auth/refresh`, `/auth/logout`) proxies username/password directly to Keycloak's token endpoint (Resource Owner Password Credentials grant) via `RestTemplate`, then sets the resulting Keycloak `access_token`/`refresh_token` as **HttpOnly cookies** (`ACCESS_TOKEN`, `REFRESH_TOKEN`) — it does not use a Spring session or Spring's OAuth2 client machinery.
- `JwtCookieFilter` (registered in `SecurityConfig` before `UsernamePasswordAuthenticationFilter`) reads the `ACCESS_TOKEN` cookie on every request, decodes it with the standard resource-server `JwtDecoder`, and manually populates `SecurityContextHolder`. This is what actually authenticates requests — the resource-server config (`spring.security.oauth2.resourceserver.jwt.issuer-uri`) is reused for decoding, but the token is expected to arrive as a cookie, not an `Authorization: Bearer` header (Swagger's bearer-auth security scheme is defined in `SwaggerConfig` but isn't how the app itself authenticates browser traffic).

### Authorization is enforced in the service layer, not in SecurityConfig

`SecurityConfig.filterChain` only distinguishes `permitAll()` vs `authenticated()` — there is no `hasRole(...)` anywhere in the security filter chain. Role checks happen ad hoc inside controllers/services via `SecurityUtils.hasRole(String)` / `SecurityUtils.getUsername()` / `SecurityUtils.getRegion()` (static helpers reading claims off the JWT in `SecurityContextHolder`), e.g. in `EventService.getAllEvents()` and `DashboardController.checkSuperAdmin`. When adding a new endpoint that should be role-restricted, follow this existing pattern (check inside the method) rather than assuming the security filter chain protects it — most admin-style endpoints currently only require *any* authenticated user.

### Keycloak is the identity source of truth; the local `users` table is a read cache

`KeycloakSyncService` runs on an hourly `@Scheduled(cron = "0 0 * * * *")` job (`syncUsersAutomatically`) that pulls all users from Keycloak's admin REST API and upserts them into the local `User` entity/`users` table (username, name, email, region, role, soft-delete flag). Business logic (`EventService`, `DashboardService`, `UserController`) reads region/role from this local table rather than calling Keycloak per-request. Region and role are stored as Keycloak user *attributes*/*realm roles* respectively; `KeycloakAdminService` is what mutates them (assign/unassign region or regional-supervisor role) directly against Keycloak, independent of the sync job.

Keycloak connection details (server URL, realm, admin credentials, client id) are currently duplicated across `KeycloakConfig`, `KeycloakUserService`, `KeycloakSyncService`, and the constants in `KeycloakUrls` — when changing Keycloak connectivity (URL, realm, credentials), grep for all of these rather than assuming one config class governs it.

### List-valued fields are stored as delimited strings, not JPA collections

`Event` stores `visitTypes`, `superviseur` (list of assigned supervisor usernames) and `placeClo` (GPS pair) as single comma-joined DB columns (`visitTypesString`, `superviseurString`, `placeCloString`), exposed via `@Transient` getters/setters that split/join on `,`. There's no `@ElementCollection`/join table involved. `LocalisationApService` similarly parses a single `"lat,lon"` string column into transient `latitude`/`longitude` doubles. When touching these fields, follow the same string-splitting convention rather than introducing a real collection mapping.

### Legacy/imported data tables

`Objectif` (`@Table(name = "objetife122025")`) and `Transfer` (`@Table(name = "transfer_122025")`) map to pre-existing, dated tables that look like monthly data imports (column names in `SCREAMING_SNAKE_CASE` matching a CSV/SQL source, e.g. `NOMBRE_MFI`, `VOLUME_AIRTIME`). This naming is intentional (mirrors the external data source), not an inconsistency to "fix" during unrelated changes.

### Two CORS configurations are both active

`SecurityConfig.corsConfigurationSource()` and `WebConfig.corsConfigurer()` both define CORS mappings independently (with slightly different allowed origins). If you need to add an allowed origin, update both.

### Error handling

`GlobalExceptionHandler` is a catch-all `@RestControllerAdvice` on `Exception.class` returning the exception's class name and message with HTTP 500 — there's no per-exception-type mapping (e.g. a "not found" `RuntimeException` in `EventService.cloturerEvent` surfaces as a generic 500, not 404).
