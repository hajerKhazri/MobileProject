package enda_tao.Controller;

import enda_tao.service.KeycloakSyncService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;

@RestController
public class SyncController {

    private final KeycloakSyncService keycloakSyncService;

    public SyncController(KeycloakSyncService keycloakSyncService) {
        this.keycloakSyncService = keycloakSyncService;
    }

    @GetMapping("/sync-users")
    public ResponseEntity<Map<String,Object>> syncUsers() {
        List<String> messages = keycloakSyncService.syncUsers();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Synchronisation terminée",
                "details", messages
        ));
    }
}