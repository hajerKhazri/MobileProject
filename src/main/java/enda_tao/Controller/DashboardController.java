package enda_tao.Controller;

import org.springframework.http.ResponseEntity;
import enda_tao.service.DashboardService;
import enda_tao.service.KeycloakAdminService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken; 
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @Autowired
    private KeycloakAdminService keycloakAdminService;

    // Injection du service via le constructeur
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // ── GET /dashboard/superviseur/{name} ─────────────────────
    @GetMapping("/superviseur/{name}")
    public List<Map<String, Object>> getAgents(@PathVariable String name) {
        try {
            return dashboardService.getAgentsBySuperviseur(name);
        } catch (Exception e) {
            e.printStackTrace(); // Affiche l'erreur dans la console
            return List.of(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /dashboard/superviseurs ──────────────────────────
    @GetMapping("/superviseurs")
    public ResponseEntity<List<String>> getAllSuperviseurs() {
        return ResponseEntity.ok(dashboardService.getAllSuperviseurs());
    }

    // ── PUT /dashboard/assign-role/{userId} ──────────────────
    @PutMapping("/assign-role/{userId}")
    public ResponseEntity<String> assignRole(@PathVariable String userId) {
        try {
            String result = keycloakAdminService.assignRegionalSupervisorRole(userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur : " + e.getMessage());
        }
    }

    // ── PUT /dashboard/assign-region/{userId}?region=xxx ────
    @PutMapping("/assign-region/{userId}")
    public ResponseEntity<String> assignRegion(
            @PathVariable String userId,
            @RequestParam String region) {
        try {
            String result = keycloakAdminService.assignRegionToUser(userId, region);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur : " + e.getMessage());
        }
    }

    // ── GET /dashboard/regions ───────────────────────────────
    @GetMapping("/regions")
    public ResponseEntity<List<String>> getRegions() {
        try {
            List<String> regions = keycloakAdminService.getAllRegions();
            return ResponseEntity.ok(regions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(List.of());
        }
    }

    // ── PUT /dashboard/unassign-role/{userId} ───────────────
    @PutMapping("/unassign-role/{userId}")
    public ResponseEntity<String> unassignRole(@PathVariable String userId) {
        try {
            String message = keycloakAdminService.unassignRoleFromUser(userId);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur : " + e.getMessage());
        }
    }

 
 @GetMapping("/check-superadmin")
public ResponseEntity<Map<String, Boolean>> checkSuperAdmin(@AuthenticationPrincipal Jwt jwt) {
    if (jwt == null) {
        return ResponseEntity.status(401).body(Map.of("isSuperAdmin", false));
    }

    // Récupérer les rôles dans le token
    Map<String, Object> realmAccess = (Map<String, Object>) jwt.getClaims().get("realm_access");
    List<String> roles = (List<String>) realmAccess.get("roles");

    boolean isSuperAdmin = roles.contains("ROLE_SUPERADMIN");

    return ResponseEntity.ok(Map.of("isSuperAdmin", isSuperAdmin));
}

}