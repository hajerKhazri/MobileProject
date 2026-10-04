package enda_tao.Controller;

import org.springframework.http.ResponseEntity;
import enda_tao.service.DashboardService;
import enda_tao.service.KeycloakAdminService;
import enda_tao.Repository.LocalisationApRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final KeycloakAdminService keycloakAdminService;
    private final LocalisationApRepository localisationApRepository;

    public DashboardController(DashboardService dashboardService,
                               KeycloakAdminService keycloakAdminService,
                               LocalisationApRepository localisationApRepository) {
        this.dashboardService = dashboardService;
        this.keycloakAdminService = keycloakAdminService;
        this.localisationApRepository = localisationApRepository;
    }

    @GetMapping("/superviseur/{name}")
    public ResponseEntity<?> getAgents(@PathVariable String name) {
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le paramètre 'name' ne peut pas être vide", "status", 400));
        }
        try {
            List<Map<String, Object>> agents = dashboardService.getAgentsBySuperviseur(name);
            return ResponseEntity.ok(agents);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage(), "status", 500));
        }
    }

    @GetMapping("/superviseurs")
    public ResponseEntity<List<String>> getAllSuperviseurs() {
        return ResponseEntity.ok(dashboardService.getAllSuperviseurs());
    }

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

    @PutMapping("/assign-region/{userId}")
    public ResponseEntity<String> assignRegion(@PathVariable String userId, @RequestParam String region) {
        try {
            String result = keycloakAdminService.assignRegionToUser(userId, region);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur : " + e.getMessage());
        }
    }

    // ✅ GET - Récupérer toutes les régions
    @GetMapping("/regions")
    public ResponseEntity<List<String>> getRegions() {
        try {
            List<String> regions = localisationApRepository.findDistinctRegions();
            if (regions == null) {
                return ResponseEntity.ok(List.of());
            }
            return ResponseEntity.ok(regions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(List.of());
        }
    }

    // ✅ POST - Créer une nouvelle région
    @PostMapping("/regions")
    public ResponseEntity<?> createRegion(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        System.out.println("📝 POST /dashboard/regions - " + name);
        
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nom invalide"));
        }
        
        try {
            // ✅ Ajouter la région à la base de données
            // Ici tu dois implémenter la logique de sauvegarde
            // Par exemple : localisationApRepository.saveRegion(name);
            
            return ResponseEntity.ok(Map.of("message", "Région créée avec succès: " + name));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ PUT - Modifier une région
    @PutMapping("/regions/{oldName}")
    public ResponseEntity<?> updateRegion(
            @PathVariable String oldName,
            @RequestBody Map<String, String> body) {
        
        String newName = body.get("name");
        System.out.println("✏️ PUT /dashboard/regions/" + oldName + " → " + newName);
        
        if (newName == null || newName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nom invalide"));
        }
        
        try {
            // ✅ Mettre à jour la région dans la base de données
            // Ici tu dois implémenter la logique de mise à jour
            // Par exemple : localisationApRepository.updateRegion(oldName, newName);
            
            return ResponseEntity.ok(Map.of("message", "Région modifiée avec succès: " + oldName + " → " + newName));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ DELETE - Supprimer une région
    @DeleteMapping("/regions/{name}")
    public ResponseEntity<?> deleteRegion(@PathVariable String name) {
        System.out.println("🗑️ DELETE /dashboard/regions/" + name);
        
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nom invalide"));
        }
        
        try {
            // ✅ Supprimer la région de la base de données
            // Ici tu dois implémenter la logique de suppression
            // Par exemple : localisationApRepository.deleteRegion(name);
            
            return ResponseEntity.ok(Map.of("message", "Région supprimée avec succès: " + name));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

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
            return ResponseEntity.ok(Map.of("isSuperAdmin", false));
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> realmAccess = (Map<String, Object>) jwt.getClaim("realm_access");
        if (realmAccess == null) {
            return ResponseEntity.ok(Map.of("isSuperAdmin", false));
        }
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) realmAccess.get("roles");
        boolean isSuperAdmin = roles != null && roles.contains("ROLE_SUPERADMIN");
        return ResponseEntity.ok(Map.of("isSuperAdmin", isSuperAdmin));
    }
}