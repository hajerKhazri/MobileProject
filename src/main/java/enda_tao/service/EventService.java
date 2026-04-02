package enda_tao.service;

import enda_tao.Entity.Event;
import enda_tao.Entity.User;
import enda_tao.Repository.EventRepository;
import enda_tao.Repository.UserRepository;
import enda_tao.config.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    // Création d'un événement
    // Création d'un événement
public Event createEvent(Event event) {
    String username = SecurityUtils.getUsername();

    // Récupération de la région depuis la DB
    String region = userRepository.findByUsername(username)
            .map(u -> u.getRegion() != null ? u.getRegion() : "")
            .orElse("");

    event.setCreatedBy(username);
    event.setRegion(region);

    // ⚡ Assurer que superviseur est non nul et unique
    if (event.getSuperviseur() == null || event.getSuperviseur().isEmpty()) {
        // Si aucun superviseur sélectionné, mettre au moins le créateur
        List<String> defaultSuperviseur = new ArrayList<>();
        defaultSuperviseur.add(username);
        event.setSuperviseur(defaultSuperviseur);
    } else {
        // Trim et supprimer doublons
        List<String> cleanSuperviseur = event.getSuperviseur().stream()
                .map(String::trim)
                .distinct()
                .toList();
        event.setSuperviseur(cleanSuperviseur);
    }

    return eventRepository.save(event);
}

    // Récupérer tous les événements selon le rôle
    // GET /api/events pour l'utilisateur courant
public List<Event> getAllEvents() {
    String username = SecurityUtils.getUsername();

    // Superadmin → tous les événements
    if (SecurityUtils.hasRole("ROLE_SUPERADMIN")) {
        return eventRepository.findAll();
    }

    // Regional supervisor → tout ce qu'il crée + événements assignés à ses agents
    if (SecurityUtils.hasRole("ROLE_REGIONAL_SUPERVISOR")) {
        String region = userRepository.findByUsername(username)
                .map(u -> u.getRegion() != null ? u.getRegion() : "")
                .orElse("");

        // Tous les superviseurs de la région
        List<String> supervisorUsernames = userRepository.findAll().stream()
                .filter(u -> "ROLE_SUPERVISOR".equalsIgnoreCase(u.getRole()))
                .filter(u -> region.equalsIgnoreCase(u.getRegion()))
                .map(User::getUsername)
                .toList();

        List<String> usernamesToInclude = new ArrayList<>(supervisorUsernames);
        usernamesToInclude.add(username); // ajouter le régional

        // Retourner événements où créé par ces utilisateurs OU assigné à eux
        return eventRepository.findAll().stream()
                .filter(ev -> usernamesToInclude.contains(ev.getCreatedBy())
                        || (ev.getSuperviseur() != null && ev.getSuperviseur().contains(username)))
                .toList();
    }

    // Utilisateur normal → lui-même et événements où il est assigné
    return eventRepository.findAll().stream()
            .filter(ev -> username.equals(ev.getCreatedBy())
                    || (ev.getSuperviseur() != null && ev.getSuperviseur().contains(username)))
            .toList();
}


    // GET /api/events/agents
    public List<String> getAvailableAgents() {
        String username = SecurityUtils.getUsername();

        // Superadmin → tous les agents actifs
        if (SecurityUtils.hasRole("ROLE_SUPERADMIN")) {
            return userRepository.findAll().stream()
                    .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                    .map(User::getUsername)
                    .toList();
        }

        // Regional supervisor → tous les superviseurs de sa région + lui-même
        if (SecurityUtils.hasRole("ROLE_REGIONAL_SUPERVISOR")) {
            String region = userRepository.findByUsername(username)
                    .map(u -> u.getRegion() != null ? u.getRegion() : "")
                    .orElse("");

            List<String> agents = userRepository.findAll().stream()
                    .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                    .filter(u -> "ROLE_SUPERVISOR".equalsIgnoreCase(u.getRole()))
                    .filter(u -> region.equalsIgnoreCase(u.getRegion()))
                    .map(User::getUsername)
                    .toList();

            agents = new ArrayList<>(agents);
            agents.add(username); // ajouter le régional lui-même

            return agents;
        }

        // ROLE_USER ou autre → seulement lui-même
        return List.of(username);
    }


 public Event cloturerEvent(Long id, List<Double> location) {
    System.out.println("Location reçue pour clôture : " + location); // <-- log ici

    Event event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event non trouvé"));

    event.setCloture(true);
    event.setPlaceClo(location);

    return eventRepository.save(event);
}

  public List<Event> getEventBySuperviseur(String superviseur) {
        return eventRepository.findBySuperviseur(superviseur);
    }
    

}