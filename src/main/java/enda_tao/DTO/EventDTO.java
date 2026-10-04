package enda_tao.DTO;

import enda_tao.Entity.Event;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;

public class EventDTO {

    private Long id;
    private String name;
    private List<String> visitTypes;
    private List<String> superviseur;
@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")

    private LocalDateTime eventDateTime;
    private boolean cloture;

    public EventDTO() {
    }

    public EventDTO(Long id,
                    String name,
                    List<String> visitTypes,
                    List<String> superviseur,
                    LocalDateTime eventDateTime,
                    boolean cloture) {
        this.id = id;
        this.name = name;
        this.visitTypes = visitTypes;
        this.superviseur = superviseur;
        this.eventDateTime = eventDateTime;
        this.cloture = cloture;
    }

    public static EventDTO fromEntity(Event event) {
        return new EventDTO(
                event.getId(),
                event.getName(),
                event.getVisitTypes(),
                event.getSuperviseur(),
                event.getEventDateTime(),
                event.isCloture()
        );
    }

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

    public List<String> getVisitTypes() {
        return visitTypes;
    }

    public void setVisitTypes(List<String> visitTypes) {
        this.visitTypes = visitTypes;
    }

    public List<String> getSuperviseur() {
        return superviseur;
    }

    public void setSuperviseur(List<String> superviseur) {
        this.superviseur = superviseur;
    }

    public LocalDateTime getEventDateTime() {
        return eventDateTime;
    }

    public void setEventDateTime(LocalDateTime eventDateTime) {
        this.eventDateTime = eventDateTime;
    }

    public boolean isCloture() {
        return cloture;
    }

    public void setCloture(boolean cloture) {
        this.cloture = cloture;
    }
}