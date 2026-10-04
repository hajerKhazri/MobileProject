package enda_tao.Controller;

import enda_tao.config.KeycloakUrls;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:8081", "exp://localhost:8081"})
public class AuthController {

    private static final String TOKEN_URL = KeycloakUrls.TOKEN_URL;
    private static final String LOGOUT_URL = KeycloakUrls.LOGOUT_URL;
    private static final String CLIENT_ID = KeycloakUrls.CLIENT_ID;

    @Value("${keycloak.client-secret}")
    private String CLIENT_SECRET;

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body,
                                   HttpServletResponse response) {

        String username = body.get("username");
        String password = body.get("password");

        RestTemplate restTemplate = new RestTemplate();

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "password");
        params.add("client_id", CLIENT_ID);
        params.add("client_secret", CLIENT_SECRET);
        params.add("username", username);
        params.add("password", password);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request =
                new HttpEntity<>(params, headers);

        try {
            ResponseEntity<Map> kcResponse =
                    restTemplate.postForEntity(TOKEN_URL, request, Map.class);

            String accessToken = (String) kcResponse.getBody().get("access_token");
            String refreshToken = (String) kcResponse.getBody().get("refresh_token");

            // =========================
            // ACCESS COOKIE
            // =========================
            Cookie accessCookie = new Cookie("ACCESS_TOKEN", accessToken);
            accessCookie.setHttpOnly(true);
            accessCookie.setPath("/");
            accessCookie.setMaxAge(3600);
            accessCookie.setSecure(false); // TRUE en HTTPS
            response.addCookie(accessCookie);

            // =========================
            // REFRESH COOKIE
            // =========================
            Cookie refreshCookie = new Cookie("REFRESH_TOKEN", refreshToken);
            refreshCookie.setHttpOnly(true);
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(7 * 24 * 3600);
            refreshCookie.setSecure(false); // TRUE en HTTPS
            response.addCookie(refreshCookie);

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "token", accessToken,   // ⚠️ C'est LA ligne qui sauve ton app
                    "refreshToken", refreshToken
            ));

        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid credentials"));
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

        String usersUrl = KeycloakUrls.ADMIN_USERS_URL;
        ResponseEntity<Object[]> usersResponse = restTemplate.exchange(usersUrl, HttpMethod.GET, entity, Object[].class);

        Object[] users = usersResponse.getBody();

        // 3️⃣ Pour chaque utilisateur, récupérer les rôles
        for (Object userObj : users) {
            Map userMap = (Map) userObj;
            String userId = (String) userMap.get("id");

            String rolesUrl = String.format(KeycloakUrls.ADMIN_USER_ROLES_URL, userId);
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


    // =========================
    // LOGOUT
    // =========================
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request,
                                    HttpServletResponse response) {

        String refreshToken = extractCookie(request, "REFRESH_TOKEN");

        if (refreshToken == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Refresh token missing"));
        }

        try {
            RestTemplate restTemplate = new RestTemplate();

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("client_id", CLIENT_ID);
            params.add("client_secret", CLIENT_SECRET);
            params.add("refresh_token", refreshToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> entity =
                    new HttpEntity<>(params, headers);

            restTemplate.postForEntity(LOGOUT_URL, entity, String.class);

            clearCookies(response);

            return ResponseEntity.ok(Map.of(
                    "message", "Logged out successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("error", "Logout failed"));
        }
    }

    // =========================
    // REFRESH TOKEN
    // =========================
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request,
                                     HttpServletResponse response) {

        String refreshToken = extractCookie(request, "REFRESH_TOKEN");

        if (refreshToken == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Refresh token missing"));
        }

        try {
            RestTemplate restTemplate = new RestTemplate();

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "refresh_token");
            params.add("client_id", CLIENT_ID);
            params.add("client_secret", CLIENT_SECRET);
            params.add("refresh_token", refreshToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> entity =
                    new HttpEntity<>(params, headers);

            ResponseEntity<Map> kcResponse =
                    restTemplate.postForEntity(TOKEN_URL, entity, Map.class);

            String newAccess = (String) kcResponse.getBody().get("access_token");
            String newRefresh = (String) kcResponse.getBody().get("refresh_token");

            setCookie(response, "ACCESS_TOKEN", newAccess, 3600);
            setCookie(response, "REFRESH_TOKEN", newRefresh, 7 * 24 * 3600);

            return ResponseEntity.ok(Map.of(
                    "message", "Token refreshed"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Refresh failed"));
        }
    }

   
    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;

        for (Cookie c : request.getCookies()) {
            if (name.equals(c.getName())) return c.getValue();
        }
        return null;
    }

    private void setCookie(HttpServletResponse response,
                           String name,
                           String value,
                           int maxAge) {

        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        cookie.setSecure(false); // true en HTTPS
        response.addCookie(cookie);
    }

    private void clearCookies(HttpServletResponse response) {

        Cookie access = new Cookie("ACCESS_TOKEN", "");
        access.setPath("/");
        access.setMaxAge(0);

        Cookie refresh = new Cookie("REFRESH_TOKEN", "");
        refresh.setPath("/");
        refresh.setMaxAge(0);

        response.addCookie(access);
        response.addCookie(refresh);
    }
}