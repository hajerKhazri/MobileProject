package enda_tao.service;

import enda_tao.Entity.User;
import enda_tao.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.*;

@Service
public class KeycloakSyncService {

    private final UserRepository userRepository;

    public KeycloakSyncService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private final String tokenUrl = "http://localhost:8088/realms/enda_tao_realm/protocol/openid-connect/token";
    private final String usersUrl = "http://localhost:8088/admin/realms/enda_tao_realm/users";
    private final String rolesUrl = "http://localhost:8088/admin/realms/enda_tao_realm/users/";

    private final String adminUsername = "superadmin";
    private final String adminPassword = "admin";
    private final String clientId = "admin-cli";

    public List<String> syncUsers() {

        List<String> messages = new ArrayList<>();

        try {

            RestTemplate restTemplate = new RestTemplate();
            ObjectMapper mapper = new ObjectMapper();
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

            // 1️⃣ GET ADMIN TOKEN
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            String body =
                    "username=" + adminUsername +
                    "&password=" + adminPassword +
                    "&grant_type=password" +
                    "&client_id=" + clientId;

            HttpEntity<String> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> tokenResponse =
                    restTemplate.postForEntity(tokenUrl, request, String.class);

            JsonNode tokenJson = mapper.readTree(tokenResponse.getBody());
            String accessToken = tokenJson.get("access_token").asText();

            // 2️⃣ GET USERS FROM KEYCLOAK

            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);

            HttpEntity<String> entity = new HttpEntity<>(userHeaders);

            ResponseEntity<String> usersResponse =
                    restTemplate.exchange(usersUrl, HttpMethod.GET, entity, String.class);

            JsonNode usersArray = mapper.readTree(usersResponse.getBody());

            // 3️⃣ SYNC EXISTING USERS

            List<User> allDbUsers = userRepository.findAll();

            for (User dbUser : allDbUsers) {

                Optional<JsonNode> matchingUser = Optional.empty();

                for (JsonNode kcUser : usersArray) {
                    if (kcUser.get("username").asText().equals(dbUser.getUsername())) {
                        matchingUser = Optional.of(kcUser);
                        break;
                    }
                }

                if (matchingUser.isPresent()) {

                    JsonNode kcUser = matchingUser.get();

                    dbUser.setPrenom(kcUser.path("firstName").asText(""));
                    dbUser.setNom(kcUser.path("lastName").asText(""));
                    dbUser.setEmail(kcUser.path("email").asText(""));
                    dbUser.setIsEnabled(kcUser.path("enabled").asBoolean(true));

                    // REGION
                    String region =
                            kcUser.path("attributes")
                                    .path("region")
                                    .path(0)
                                    .asText("");

                    dbUser.setRegion(region);

                    // ROLE
                    String userId = kcUser.get("id").asText();
                    String role = getUserRole(userId, accessToken);

                    dbUser.setRole(role);

                    if (dbUser.getIsDeleted())
                        dbUser.setIsDeleted(false);

                    userRepository.save(dbUser);

                    messages.add("✅ Utilisateur mis à jour : " + dbUser.getUsername());

                } else {

                    if (!dbUser.getIsDeleted()) {

                        dbUser.setIsDeleted(true);

                        userRepository.save(dbUser);

                        messages.add("❌ Utilisateur supprimé Keycloak : " + dbUser.getUsername());
                    }
                }
            }

            // 4️⃣ ADD NEW USERS

            for (JsonNode kcUser : usersArray) {

                String username = kcUser.get("username").asText();

                Optional<User> optionalUser = userRepository.findByUsername(username);

                if (optionalUser.isEmpty()) {

                    User user = new User();

                    user.setUsername(username);
                    user.setPrenom(kcUser.path("firstName").asText(""));
                    user.setNom(kcUser.path("lastName").asText(""));
                    user.setEmail(kcUser.path("email").asText(""));
                    user.setIsEnabled(kcUser.path("enabled").asBoolean(true));

                    String region =
                            kcUser.path("attributes")
                                    .path("region")
                                    .path(0)
                                    .asText("");

                    user.setRegion(region);

                    String userId = kcUser.get("id").asText();
                    String role = getUserRole(userId, accessToken);

                    user.setRole(role);

                    String tempPassword =
                            "Temp-" + UUID.randomUUID().toString().substring(0, 8);

                    user.setPassword(passwordEncoder.encode(tempPassword));
                    user.setIsDeleted(false);

                    userRepository.save(user);

                    messages.add("➕ Nouvel utilisateur ajouté : " + username);
                }
            }

        } catch (Exception e) {

            e.printStackTrace();

            messages.add("❌ Erreur synchronisation : " + e.getMessage());
        }

        return messages;
    }

    // GET ROLE FROM KEYCLOAK

    private String getUserRole(String userId, String accessToken) {

        try {

            RestTemplate restTemplate = new RestTemplate();

            String url = rolesUrl + userId + "/role-mappings/realm";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response =
                    restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode rolesArray = mapper.readTree(response.getBody());

            for (JsonNode role : rolesArray) {

                String roleName = role.get("name").asText();

                if (roleName.equals("ROLE_SUPERADMIN"))
                    return "ROLE_SUPERADMIN";

                if (roleName.equals("ROLE_REGIONAL_SUPERVISOR"))
                    return "ROLE_REGIONAL_SUPERVISOR";

                if (roleName.equals("ROLE_SUPERVISOR"))
                    return "ROLE_SUPERVISOR";
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return "ROLE_USER";
    }
}