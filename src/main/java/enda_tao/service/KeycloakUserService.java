package enda_tao.service;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.stereotype.Service;

import javax.ws.rs.core.Response;
import java.util.Collections;
import java.util.List;

@Service
public class KeycloakUserService {

    // Connexion à Keycloak via admin-cli du realm master
    private Keycloak keycloak = KeycloakBuilder.builder()
            .serverUrl("http://localhost:8088/")   // URL de ton Keycloak
            .realm("enda_tao_realm")                       // Realm admin
            .username("admin")                     // Admin username
            .password("admin")                     // Admin password
            .clientId("enda_tao_client")                 // Client admin CLI
            .build();

    private final String realm = "enda_tao_realm"; // Realm cible

    public String createUser(String username, String password, String role) {

        // Vérifier si l'utilisateur existe déjà
        List<UserRepresentation> existing = keycloak.realm(realm).users().search(username);
        if (!existing.isEmpty()) {
            return "Utilisateur déjà existant !";
        }

        // Création de l'utilisateur
        UserRepresentation user = new UserRepresentation();
        user.setUsername(username);
        user.setEnabled(true);

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setTemporary(false);
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        user.setCredentials(Collections.singletonList(credential));

        Response response = keycloak.realm(realm).users().create(user);
        if (response.getStatus() != 201) {
            return "Erreur création utilisateur, status: " + response.getStatus();
        }

        // Récupérer l'ID du nouvel utilisateur
        String userId = keycloak.realm(realm).users().search(username).get(0).getId();

        // Vérifier si le rôle existe
        if (keycloak.realm(realm).roles().get(role).toRepresentation() == null) {
            return "Le rôle n'existe pas !";
        }

        // Assigner le rôle
        keycloak.realm(realm).users().get(userId).roles()
                .realmLevel()
                .add(Collections.singletonList(
                        keycloak.realm(realm).roles().get(role).toRepresentation()
                ));

        return "Utilisateur créé avec succès !";
    }
}