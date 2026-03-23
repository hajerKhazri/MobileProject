package enda_tao.Controller;

import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final String TOKEN_URL = "http://localhost:8088/realms/enda_tao_realm/protocol/openid-connect/token";
    private final String CLIENT_ID = "enda_tao_client";
    private final String CLIENT_SECRET = "gCKB6HWAEtPZOYg2n9naXagskjoI0UHY";


    private final String LOGOUT_URL =
            "http://localhost:8088/realms/enda_tao_realm/protocol/openid-connect/logout";


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String username, @RequestParam String password) {

        RestTemplate restTemplate = new RestTemplate();

        // Préparer les paramètres en x-www-form-urlencoded
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "password");
        map.add("client_id", CLIENT_ID);
        map.add("client_secret", CLIENT_SECRET);
        map.add("username", username);
        map.add("password", password);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(TOKEN_URL, request, Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
    }


    @PostMapping("/logout")
public ResponseEntity<?> logout(@RequestParam String refreshToken) {

    RestTemplate restTemplate = new RestTemplate();

    // Créer la map avec les paramètres pour Keycloak
    MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
    map.add("client_id", CLIENT_ID);
    map.add("client_secret", CLIENT_SECRET);
    map.add("refresh_token", refreshToken);

    // Créer les headers
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

    HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

    try {
        // 🔹 Log du token avant l'envoi
        System.out.println("Token envoyé à Keycloak : " + refreshToken);

        // Envoi de la requête vers Keycloak
        ResponseEntity<String> response = restTemplate.postForEntity(LOGOUT_URL, request, String.class);

        // 🔹 Log de la réponse de Keycloak
        System.out.println("Réponse Keycloak : " + response.getBody());

        return ResponseEntity.ok(Map.of("message", "Logged out from Keycloak successfully"));

    } catch (Exception e) {
        e.printStackTrace(); // 🔹 Voir l'erreur complète dans la console
        return ResponseEntity.status(400).body(Map.of(
                "error", "Logout failed",
                "details", e.getMessage()
        ));
    }
}



@GetMapping("/users")
public ResponseEntity<?> getAllUsersWithRoles() {

    RestTemplate restTemplate = new RestTemplate();

    try {
        // 1️⃣ Récupérer token admin
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "password");
        map.add("client_id", CLIENT_ID);
        map.add("username", "superadmin");
        map.add("password", "admin");
        map.add("client_secret", CLIENT_SECRET);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(TOKEN_URL, request, Map.class);
        String accessToken = (String) tokenResponse.getBody().get("access_token");

        // 2️⃣ Récupérer tous les utilisateurs
        HttpHeaders authHeaders = new HttpHeaders();
        authHeaders.setBearerAuth(accessToken);
        HttpEntity<String> entity = new HttpEntity<>(authHeaders);

        String usersUrl = "http://localhost:8088/admin/realms/enda_tao_realm/users";
        ResponseEntity<Object[]> usersResponse = restTemplate.exchange(usersUrl, HttpMethod.GET, entity, Object[].class);

        Object[] users = usersResponse.getBody();

        // 3️⃣ Pour chaque utilisateur, récupérer les rôles
        for (Object userObj : users) {
            Map userMap = (Map) userObj;
            String userId = (String) userMap.get("id");

            String rolesUrl = "http://localhost:8088/admin/realms/enda_tao_realm/users/" + userId + "/role-mappings/realm";
            ResponseEntity<Object[]> rolesResponse = restTemplate.exchange(rolesUrl, HttpMethod.GET, entity, Object[].class);

            // Ajouter les rôles à l'objet utilisateur
            userMap.put("roles", rolesResponse.getBody());
        }

        return ResponseEntity.ok(users);

    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of(
                "error", "Impossible de récupérer les utilisateurs avec les rôles",
                "details", e.getMessage()
        ));
    }
}


}