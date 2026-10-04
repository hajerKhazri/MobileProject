package enda_tao.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "visit_types")
    private String visitTypesString;

    // ✅ CORRECTION : Utiliser "agents" si c'est le nom de la colonne en base
    @Column(name = "agents")
    private String superviseurString;

    @Column(name = "event_date_time")
    private LocalDateTime eventDateTime;

    @Column(name = "is_cloture")
    private boolean isCloture = false;

    @Column(name = "created_by")
    private String createdBy;

    private String region;

    @Column(name = "place_clo")
    private String placeCloString;

    // ✅ CONSTRUCTEUR PAR DÉFAUT
    public Event() {
        this.isCloture = false;
        this.visitTypesString = "Visite";
        this.superviseurString = "";
        this.placeCloString = "";
    }

    // ✅ CONSTRUCTEUR AVEC PARAMÈTRES
    public Event(String name, String region, LocalDateTime eventDateTime) {
        this.name = name;
        this.region = region;
        this.eventDateTime = eventDateTime;
        this.isCloture = false;
        this.visitTypesString = "Visite";
        this.superviseurString = "";
        this.placeCloString = "";
    }

    // ===== GETTERS ET SETTERS =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getVisitTypesString() { return visitTypesString; }
    public void setVisitTypesString(String visitTypesString) { this.visitTypesString = visitTypesString; }

    public String getSuperviseurString() { return superviseurString; }
    public void setSuperviseurString(String superviseurString) { this.superviseurString = superviseurString; }

    public LocalDateTime getEventDateTime() { return eventDateTime; }
    public void setEventDateTime(LocalDateTime eventDateTime) { this.eventDateTime = eventDateTime; }

    public boolean isCloture() { return isCloture; }
    public void setCloture(boolean cloture) { isCloture = cloture; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getPlaceCloString() { return placeCloString; }
    public void setPlaceCloString(String placeCloString) { this.placeCloString = placeCloString; }

    // ===== MÉTHODES DE CONVERSION =====
    @Transient
    public List<String> getVisitTypes() {
        if (visitTypesString == null || visitTypesString.isEmpty()) return List.of("Visite");
        return Arrays.stream(visitTypesString.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    public void setVisitTypes(List<String> visitTypes) {
        if (visitTypes == null || visitTypes.isEmpty()) {
            this.visitTypesString = "Visite";
        } else {
            this.visitTypesString = visitTypes.stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.joining(","));
        }
    }

    @Transient
    public List<String> getSuperviseur() {
        if (superviseurString == null || superviseurString.isEmpty()) return List.of();
        return Arrays.stream(superviseurString.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }

    public void setSuperviseur(List<String> superviseur) {
        if (superviseur == null || superviseur.isEmpty()) {
            this.superviseurString = "";
        } else {
            this.superviseurString = superviseur.stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .collect(Collectors.joining(","));
        }
    }

    @Transient
    public List<Double> getPlaceClo() {
        if (placeCloString == null || placeCloString.isEmpty()) return List.of();
        try {
            String[] parts = placeCloString.split(",");
            if (parts.length >= 2) {
                return List.of(Double.parseDouble(parts[0]), Double.parseDouble(parts[1]));
            }
        } catch (Exception e) {
            return List.of();
        }
        return List.of();
    }

    public void setPlaceClo(List<Double> placeClo) {
        if (placeClo == null || placeClo.size() < 2) {
            this.placeCloString = null;
        } else {
            this.placeCloString = placeClo.get(0) + "," + placeClo.get(1);
        }
    }

    @Override
    public String toString() {
        return "Event{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", region='" + region + '\'' +
                ", superviseurString='" + superviseurString + '\'' +
                ", eventDateTime=" + eventDateTime +
                ", createdBy='" + createdBy + '\'' +
                ", isCloture=" + isCloture +
                '}';
    }
}