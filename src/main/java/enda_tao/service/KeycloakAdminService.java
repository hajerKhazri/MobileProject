package enda_tao.service;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class KeycloakAdminService {

    @Autowired
    private Keycloak keycloak;

    private final String realm = "enda_tao_realm";

    /**
     * Assigner le rôle ROLE_REGIONAL_SUPERVISOR à un utilisateur
     * Supprime ROLE_SUPERVISOR si présent
     */
    public String assignRegionalSupervisorRole(String userId) {
        RealmResource realmResource = keycloak.realm(realm);
        UserResource userResource = realmResource.users().get(userId);

        List<String> roles = userResource.roles()
                .realmLevel()
                .listAll()
                .stream()
                .map(RoleRepresentation::getName)
                .collect(Collectors.toList());

        if (roles.contains("ROLE_REGIONAL_SUPERVISOR")) {
            return "L'utilisateur est déjà Regional Supervisor";
        }

        // Supprimer ROLE_SUPERVISOR si présent
        if (roles.contains("ROLE_SUPERVISOR")) {
            RoleRepresentation supervisorRole = realmResource.roles()
                    .get("ROLE_SUPERVISOR")
                    .toRepresentation();
            userResource.roles().realmLevel().remove(List.of(supervisorRole));
        }

        // Assigner ROLE_REGIONAL_SUPERVISOR
        RoleRepresentation regionalRole = realmResource.roles()
                .get("ROLE_REGIONAL_SUPERVISOR")
                .toRepresentation();
        userResource.roles().realmLevel().add(List.of(regionalRole));

        return "Rôle Regional Supervisor assigné avec succès";
    }

    /**
     * Assigner une région à un utilisateur
     * Vérifie que l'utilisateur est Regional Supervisor
     */
    public String assignRegionToUser(String userId, String region) {
    RealmResource realmResource = keycloak.realm(realm);
    UserResource userResource = realmResource.users().get(userId);

    // Vérifier le rôle
    List<String> roles = userResource.roles()
            .realmLevel()
            .listAll()
            .stream()
            .map(RoleRepresentation::getName)
            .collect(Collectors.toList());

    if (!roles.contains("ROLE_REGIONAL_SUPERVISOR")) {
        return "Erreur : L'utilisateur n'est pas Regional Supervisor";
    }

    // 🔵 récupérer toutes les régions existantes
    List<String> existingRegions = getAllRegions();

    // vérifier si la région existe
    if (!existingRegions.contains(region)) {
        return "Erreur : La région '" + region + "' n'existe pas dans Keycloak";
    }

    // mettre à jour l'attribut region
    UserRepresentation userRep = userResource.toRepresentation();
    Map<String, List<String>> attrs = userRep.getAttributes();

    if (attrs == null) {
        attrs = new HashMap<>();
    }

    attrs.put("region", List.of(region));
    userRep.setAttributes(attrs);

    userResource.update(userRep);

    return "Région '" + region + "' assignée avec succès";
}

    /**
     * Retourne la liste de toutes les régions existantes (attribut region)
     */
    public List<String> getAllRegions() {
        RealmResource realmResource = keycloak.realm(realm);

        // Récupérer tous les utilisateurs (0-1000)
        List<UserRepresentation> users = realmResource.users().list(0, 1000);

        Set<String> regions = new HashSet<>();
        for (UserRepresentation user : users) {
            Map<String, List<String>> attrs = user.getAttributes();
            if (attrs != null && attrs.containsKey("region")) {
                regions.addAll(attrs.get("region"));
            }
        }

        return new ArrayList<>(regions); // valeurs uniques
    }

    /**
     * Retourne la liste de tous les rôles disponibles dans le realm Keycloak
     */
    public List<String> getAllRoles() {
        RealmResource realmResource = keycloak.realm(realm);
        return realmResource.roles().list()
                .stream()
                .map(RoleRepresentation::getName)
                .collect(Collectors.toList());
    }

    /**
     * Assigne un rôle existant à un utilisateur
     * Si le rôle est ROLE_REGIONAL_SUPERVISOR, supprime ROLE_SUPERVISOR si présent
     */
    public String assignRoleToUser(String userId, String roleName) {
        RealmResource realmResource = keycloak.realm(realm);
        UserResource userResource = realmResource.users().get(userId);

        // Vérifier que le rôle existe
        RoleRepresentation roleRep;
        try {
            roleRep = realmResource.roles().get(roleName).toRepresentation();
        } catch (Exception e) {
            return "Erreur : le rôle '" + roleName + "' n'existe pas";
        }

        // Vérifier si l'utilisateur a déjà ce rôle
        List<String> roles = userResource.roles()
                .realmLevel()
                .listAll()
                .stream()
                .map(RoleRepresentation::getName)
                .collect(Collectors.toList());

        if (roles.contains(roleName)) {
            return "L'utilisateur a déjà le rôle '" + roleName + "'";
        }

        // Si l'on assigne ROLE_REGIONAL_SUPERVISOR, supprimer ROLE_SUPERVISOR si présent
        if (roleName.equals("ROLE_REGIONAL_SUPERVISOR") && roles.contains("ROLE_SUPERVISOR")) {
            RoleRepresentation supRole = realmResource.roles().get("ROLE_SUPERVISOR").toRepresentation();
            userResource.roles().realmLevel().remove(List.of(supRole));
        }

        // Assigner le rôle
        userResource.roles().realmLevel().add(List.of(roleRep));
        return "Rôle '" + roleName + "' assigné avec succès";
    }



    /**
 * Désassigne un rôle existant à un utilisateur
 */
public String unassignRoleFromUser(String userId) {
    RealmResource realmResource = keycloak.realm(realm);
    UserResource userResource = realmResource.users().get(userId);

    List<RoleRepresentation> allRoles = userResource.roles().realmLevel().listAll();
    List<String> roleNames = allRoles.stream().map(RoleRepresentation::getName).collect(Collectors.toList());

    // Cas 1 : l'utilisateur est Regional Supervisor → on le transforme en Supervisor normal
    if (roleNames.contains("ROLE_REGIONAL_SUPERVISOR")) {
        // Supprimer ROLE_REGIONAL_SUPERVISOR
        RoleRepresentation regionalRole = realmResource.roles().get("ROLE_REGIONAL_SUPERVISOR").toRepresentation();
        userResource.roles().realmLevel().remove(List.of(regionalRole));

        // Ajouter ROLE_SUPERVISOR si absent
        if (!roleNames.contains("ROLE_SUPERVISOR")) {
            RoleRepresentation supervisorRole = realmResource.roles().get("ROLE_SUPERVISOR").toRepresentation();
            userResource.roles().realmLevel().add(List.of(supervisorRole));
        }

        return "L'utilisateur est maintenant Supervisor normal";
    }

    // Cas 2 : l'utilisateur est déjà Supervisor normal
    if (roleNames.contains("ROLE_SUPERVISOR")) {
        return "L'utilisateur est déjà Supervisor normal";
    }

    // Cas 3 : aucun rôle correspondant
    return "Aucun rôle à désassigner pour cet utilisateur";
}





/**
 * Vérifie si un utilisateur est SUPERADMIN
 */
public boolean isUserSuperAdmin(String username) {
    RealmResource realmResource = keycloak.realm(realm);

    // Récupérer tous les utilisateurs
    List<UserRepresentation> users = realmResource.users().search(username, 0, 1);
    if (users.isEmpty()) return false;

    UserRepresentation user = users.get(0);

    // Récupérer les rôles du user
    List<String> roles = userResource(user.getId())
            .roles()
            .realmLevel()
            .listAll()
            .stream()
            .map(RoleRepresentation::getName)
            .collect(Collectors.toList());

    // Vérifier le rôle SUPERADMIN
    return roles.contains("ROLE_SUPERADMIN");
}

// Méthode utilitaire pour obtenir UserResource
private UserResource userResource(String userId) {
    return keycloak.realm(realm).users().get(userId);
}


}