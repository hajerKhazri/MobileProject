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

    @Column(name = "superviseur")
    private String superviseurString;

    private LocalDateTime eventDateTime;

    @Column(name = "is_cloture")
    private boolean isCloture;

    private String createdBy;  
    private String region;      

    @Column(name = "place_clo")
    private String placeCloString;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    @Transient
    public List<String> getVisitTypes() {
        if (visitTypesString == null || visitTypesString.isEmpty()) return List.of();
        return Arrays.asList(visitTypesString.split(","));
    }

    public void setVisitTypes(List<String> visitTypes) {
        this.visitTypesString = (visitTypes == null || visitTypes.isEmpty()) ? "" : String.join(",", visitTypes);
    }

    @Transient
    public List<String> getSuperviseur() {
        if (superviseurString == null || superviseurString.isEmpty()) return List.of();
        return Arrays.stream(superviseurString.split(","))
                     .map(String::trim)
                     .distinct()
                     .collect(Collectors.toList());
    }

    public void setSuperviseur(List<String> superviseur) {
        if (superviseur == null || superviseur.isEmpty()) {
            this.superviseurString = "";
        } else {
            this.superviseurString = superviseur.stream()
                                                 .map(String::trim)
                                                 .distinct()
                                                 .collect(Collectors.joining(","));
        }
    }

    public LocalDateTime getEventDateTime() { return eventDateTime; }
    public void setEventDateTime(LocalDateTime eventDateTime) { this.eventDateTime = eventDateTime; }

    public boolean isCloture() { return isCloture; }
    public void setCloture(boolean cloture) { isCloture = cloture; }

    @Transient
    public List<Double> getPlaceClo() {
        if (placeCloString == null || placeCloString.isEmpty()) return List.of();
        String[] parts = placeCloString.split(",");
        return List.of(Double.parseDouble(parts[0]), Double.parseDouble(parts[1]));
    }

    public void setPlaceClo(List<Double> placeClo) {
        if (placeClo == null || placeClo.isEmpty()) {
            this.placeCloString = null;
        } else {
            this.placeCloString = placeClo.get(0) + "," + placeClo.get(1);
        }
    }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

}