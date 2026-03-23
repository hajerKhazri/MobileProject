package enda_tao.config;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.Map;

public class SecurityUtils {

    public static String getUsername() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return jwt.getClaimAsString("preferred_username");
    }

    public static String getRegion() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Map<String, Object> attributes = jwt.getClaim("region");

        if(attributes == null) return "";

        return attributes.toString();
    }

    public static boolean hasRole(String role) {

        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Map<String, Object> realmAccess = jwt.getClaim("realm_access");

        if (realmAccess == null) return false;

        List<String> roles = (List<String>) realmAccess.get("roles");

        return roles.contains(role);
    }
}