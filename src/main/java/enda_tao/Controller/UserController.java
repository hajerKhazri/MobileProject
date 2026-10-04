package enda_tao.Controller;

import enda_tao.service.KeycloakUserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final KeycloakUserService keycloakUserService;

    public UserController(KeycloakUserService keycloakUserService) {
        this.keycloakUserService = keycloakUserService;
    }

    @PostMapping("/create")
    public String createUser(@RequestParam String username,
                             @RequestParam String password,
                             @RequestParam String role) {
        keycloakUserService.createUser(username, password, role);
        return "Utilisateur créé avec succès !";
    }

    @GetMapping("/api/me")
    public Map<String, Object> getCurrentUser(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        
        String fullName = jwt.getClaimAsString("name");
        if (fullName == null || fullName.isEmpty()) {
            String given = jwt.getClaimAsString("given_name");
            String family = jwt.getClaimAsString("family_name");
            fullName = (given != null ? given : "") + " " + (family != null ? family : "");
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> realmAccess = (Map<String, Object>) jwt.getClaim("realm_access");
        java.util.List<String> roles = realmAccess != null ? (java.util.List<String>) realmAccess.get("roles") : java.util.List.of();
        
        @SuppressWarnings("unchecked")
        Map<String, Object> attributes = (Map<String, Object>) jwt.getClaim("attributes");
        String region = "";
        if (attributes != null && attributes.containsKey("region")) {
            @SuppressWarnings("unchecked")
            java.util.List<String> regionList = (java.util.List<String>) attributes.get("region");
            region = regionList != null && !regionList.isEmpty() ? regionList.get(0) : "";
        }
        
        return Map.of(
            "username", jwt.getClaimAsString("preferred_username"),
            "email", jwt.getClaimAsString("email") != null ? jwt.getClaimAsString("email") : "",
            "fullName", fullName.trim(),
            "roles", roles,
            "region", region
        );
    }

}