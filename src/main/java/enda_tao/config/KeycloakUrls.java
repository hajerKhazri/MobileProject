package enda_tao.config;

public final class KeycloakUrls {

    private KeycloakUrls() {
    }

    public static final String BASE_URL = "http://localhost:8088";
    public static final String REALM = "enda_tao_realm";
    public static final String CLIENT_ID = "enda_tao_client";
    public static final String TOKEN_PATH = "/realms/" + REALM + "/protocol/openid-connect/token";
    public static final String LOGOUT_PATH = "/realms/" + REALM + "/protocol/openid-connect/logout";
    public static final String TOKEN_URL = BASE_URL + TOKEN_PATH;
    public static final String LOGOUT_URL = BASE_URL + LOGOUT_PATH;
    public static final String ADMIN_USERS_URL = BASE_URL + "/admin/realms/" + REALM + "/users";
    public static final String ADMIN_USER_ROLES_URL = BASE_URL + "/admin/realms/" + REALM + "/users/%s/role-mappings/realm";
}
