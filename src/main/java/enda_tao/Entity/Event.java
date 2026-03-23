package enda_tao.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // Stocké en base sous forme String pour visitTypes
    @Column(name = "visit_types")
    private String visitTypesString;

    // Stocké en base sous forme String pour agents
    @Column(name = "agents")
    private String agentsString;

    private LocalDateTime eventDateTime;

    @Column(name = "is_cloture")
    private boolean isCloture;

    private String createdBy;   // username
    private String region;      // région du user

    // ========================
    // Localisation
    // ========================
    @Column(name = "place_clo")
    private String placeCloString;

    // ========================
    // GETTERS / SETTERS
    // ========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // ========================
    // Visit Types
    // ========================
    @Transient
    public List<String> getVisitTypes() {
        if (visitTypesString == null || visitTypesString.isEmpty()) {
            return List.of();
        }
        return Arrays.asList(visitTypesString.split(","));
    }

    public void setVisitTypes(List<String> visitTypes) {
        if (visitTypes == null || visitTypes.isEmpty()) {
            this.visitTypesString = "";
        } else {
            this.visitTypesString = String.join(",", visitTypes);
        }
    }

    // ========================
    // Agents
    // ========================
    @Transient
    public List<String> getAgents() {
        if (agentsString == null || agentsString.isEmpty()) {
            return List.of();
        }
        return Arrays.asList(agentsString.split(","));
    }

    public void setAgents(List<String> agents) {
        if (agents == null || agents.isEmpty()) {
            this.agentsString = "";
        } else {
            this.agentsString = String.join(",", agents);
        }
    }

    // ========================
    // Date
    // ========================
    public LocalDateTime getEventDateTime() {
        return eventDateTime;
    }

    public void setEventDateTime(LocalDateTime eventDateTime) {
        this.eventDateTime = eventDateTime;
    }

    // ========================
    // Clôture
    // ========================
    public boolean isCloture() {
        return isCloture;
    }

    public void setCloture(boolean cloture) {
        isCloture = cloture;
    }

    // ========================
    // Place Clôture
    // ========================
    @Transient
    public List<Double> getPlaceClo() {
        if (placeCloString == null || placeCloString.isEmpty()) {
            return List.of();
        }
        String[] parts = placeCloString.split(",");
        return List.of(
                Double.parseDouble(parts[0]),
                Double.parseDouble(parts[1])
        );
    }

    public void setPlaceClo(List<Double> placeClo) {
        if (placeClo == null || placeClo.isEmpty()) {
            this.placeCloString = null;
        } else {
            this.placeCloString = placeClo.get(0) + "," + placeClo.get(1);
        }
    }

    // ========================
    // CreatedBy / Region
    // ========================
    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }
}