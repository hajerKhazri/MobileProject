package enda_tao.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String prenom;
    private String nom;
    private String email;
    private String password;
    private Boolean isEnabled;
    private String region;
    private String role; 

    @Column(nullable = false)
    private Boolean isDeleted = false;

    public User() {}

    public User(String username, String prenom, String nom, String email, String password, Boolean isEnabled, String region, String role) {
        this.username = username;
        this.prenom = prenom;
        this.nom = nom;
        this.email = email;
        this.password = password;
        this.isEnabled = isEnabled;
        this.region = region;
        this.role = role;
        this.isDeleted = false;

    }

  
    public Long getId() { return id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }

    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
   
}