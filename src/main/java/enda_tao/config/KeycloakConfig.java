package enda_tao.config;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakConfig {

    // ⚡ Renseigne tes données Keycloak
    private final String serverUrl = "http://localhost:8088";
    private final String realm = "enda_tao_realm";
    private final String clientId = "admin-cli";
    private final String username = "superadmin";
    private final String password = "admin";

    @Bean
    public Keycloak keycloak() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(realm)
                .grantType(OAuth2Constants.PASSWORD)
                .clientId(clientId)
                .username(username)
                .password(password)
                .build();
    }
}