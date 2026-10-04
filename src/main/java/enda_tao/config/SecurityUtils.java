package enda_tao.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;

public class SecurityUtils {

    /**
     * Récupère le nom d'utilisateur de l'utilisateur actuellement authentifié.
     * Gère aussi bien le cas où le principal est un Jwt que le cas où c'est un String.
     */
    public static String getUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Jwt) {
            Jwt jwt = (Jwt) principal;
            return jwt.getClaimAsString("preferred_username");
        }

        if (principal instanceof String) {
            return (String) principal;
        }

        return authentication.getName();
    }

    /**
     * Vérifie si l'utilisateur actuel possède un rôle donné.
     * Accepte aussi bien "ROLE_SUPERADMIN" que "SUPERADMIN".
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        for (GrantedAuthority authority : authorities) {
            String name = authority.getAuthority();
            if (name.equals(role) || name.equals(role.replace("ROLE_", ""))) {
                return true;
            }
        }
        return false;
    }
}