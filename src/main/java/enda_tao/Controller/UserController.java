package enda_tao.Controller;

import enda_tao.service.KeycloakUserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

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
    public Map<String, String> getCurrentUser(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return Map.of(
            "username", jwt.getClaimAsString("preferred_username"),
            "email", jwt.getClaimAsString("email")
        );
    }

}