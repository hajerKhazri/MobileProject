package enda_tao.service;

import enda_tao.Entity.Event;
import enda_tao.Entity.User;
import enda_tao.Repository.EventRepository;
import enda_tao.Repository.UserRepository;
import enda_tao.config.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // ==========================================================
    // CREATE - Version corrigée
    // ==========================================================
    // EventService.java - createEvent
    @Transactional
    public Event createEvent(Event event) {
        String username = SecurityUtils.getUsername();
        System.out.println("👤 Utilisateur connecté: " + username);

        // ✅ SI L'UTILISATEUR EST ANONYMOUS, UTILISER LE PREMIER SUPERVISEUR
        if ("anonymousUser".equals(username) || username == null || username.isEmpty()) {
            List<String> superviseurs = event.getSuperviseur();
            if (superviseurs != null && !superviseurs.isEmpty()) {
                username = superviseurs.get(0);
                System.out.println("👤 Utilisateur remplacé par le superviseur: " + username);
            } else {
                username = "system";
            }
        }

        // Récupérer la région DEPUIS L'ÉVÉNEMENT (pas depuis l'utilisateur)
        String region = event.getRegion();
        if (region == null || region.isEmpty()) {
            region = "Non définie";
        }
        System.out.println("📍 Région: '" + region + "'");

        // Set les champs
        event.setCreatedBy(username);
        event.setRegion(region);
        event.setCloture(false);

        // Gérer les superviseurs
        List<String> superviseurs = event.getSuperviseur();
        if (superviseurs == null || superviseurs.isEmpty()) {
            superviseurs = new ArrayList<>();
            superviseurs.add(username);
            event.setSuperviseur(superviseurs);
        }

        // Gérer visitTypes
        if (event.getVisitTypes() == null || event.getVisitTypes().isEmpty()) {
            event.setVisitTypes(List.of("Visite"));
        }

        System.out.println("💾 Sauvegarde finale:");
        System.out.println("   - name: " + event.getName());
        System.out.println("   - region: " + event.getRegion());
        System.out.println("   - superviseurString: " + event.getSuperviseurString());
        System.out.println("   - createdBy: " + event.getCreatedBy());

        return eventRepository.save(event);
    }

    // ==========================================================
    // GET ALL
    // ==========================================================
    public List<Event> getAllEvents() {
        System.out.println("📡 Récupération de tous les événements");
        try {
            List<Event> events = eventRepository.findAll();
            System.out.println("📡 " + events.size() + " événements trouvés");
            return events;
        } catch (Exception e) {
            System.err.println("❌ Erreur récupération événements: " + e.getMessage());
            throw e;
        }
    }

    // ==========================================================
    // GET AVAILABLE AGENTS
    // ==========================================================
    public List<String> getAvailableAgents() {
        String username = SecurityUtils.getUsername();

        if (SecurityUtils.hasRole("ROLE_SUPERADMIN") || SecurityUtils.hasRole("SUPERADMIN")) {
            return userRepository.findAll().stream()
                    .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                    .map(User::getUsername)
                    .toList();
        }

        if (SecurityUtils.hasRole("ROLE_REGIONAL_SUPERVISOR") || SecurityUtils.hasRole("REGIONAL_SUPERVISOR")) {
            String region = userRepository.findByUsername(username)
                    .map(User::getRegion)
                    .orElse("");

            List<String> agents = userRepository.findAll().stream()
                    .filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
                    .filter(u -> "ROLE_SUPERVISOR".equalsIgnoreCase(u.getRole()))
                    .filter(u -> region.equalsIgnoreCase(u.getRegion()))
                    .map(User::getUsername)
                    .toList();

            agents = new ArrayList<>(agents);
            if (!agents.contains(username)) {
                agents.add(username);
            }
            return agents;
        }

        return List.of(username);
    }

    // ==========================================================
    // CLOTURE
    // ==========================================================
    public Event cloturerEvent(Long id, List<Double> location) {
        System.out.println("📍 Clôture événement ID: " + id);
        System.out.println("📍 Location: " + location);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event non trouvé"));

        event.setCloture(true);
        event.setPlaceClo(location);

        return eventRepository.save(event);
    }

    // ==========================================================
    // GET BY SUPERVISEUR
    // ==========================================================
    public List<Event> getEventBySuperviseur(String superviseur) {
        return eventRepository.findBySuperviseur(superviseur);
    }

    // ==========================================================
    // UPDATE
    // ==========================================================
    @Transactional
    public Event updateEvent(Long id, Event eventData) {
        Event existingEvent = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé avec ID: " + id));

        // Mise à jour des champs
        if (eventData.getName() != null) {
            existingEvent.setName(eventData.getName());
        }
        if (eventData.getRegion() != null) {
            existingEvent.setRegion(eventData.getRegion());
        }
        if (eventData.getSuperviseur() != null && !eventData.getSuperviseur().isEmpty()) {
            existingEvent.setSuperviseur(eventData.getSuperviseur());
        }
        if (eventData.getEventDateTime() != null) {
            existingEvent.setEventDateTime(eventData.getEventDateTime());
        }
        if (eventData.getVisitTypes() != null && !eventData.getVisitTypes().isEmpty()) {
            existingEvent.setVisitTypes(eventData.getVisitTypes());
        }

        System.out.println("✅ Mise à jour événement ID: " + id);
        return eventRepository.save(existingEvent);
    }

    // ==========================================================
    // DELETE
    // ==========================================================
    @Transactional
    public void deleteEvent(Long id) {
        System.out.println("🔥 Suppression événement ID: " + id);

        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Événement non trouvé avec ID: " + id);
        }

        eventRepository.deleteById(id);
        System.out.println("✅ Événement supprimé ID: " + id);
    }

    // EventService.java
    public Event getEventById(Long id) {
        System.out.println("🔍 Recherche événement ID: " + id);
        return eventRepository.findById(id).orElse(null);
    }


}