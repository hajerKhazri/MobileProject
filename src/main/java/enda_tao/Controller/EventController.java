package enda_tao.Controller;

import enda_tao.Entity.Event;
import enda_tao.service.EventService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

import enda_tao.Entity.User;
import enda_tao.Repository.UserRepository;
import org.springframework.http.ResponseEntity;
import enda_tao.config.SecurityUtils;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;

    public EventController(EventService eventService, UserRepository userRepository) {
        this.eventService = eventService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        try {
            System.out.println("📝 Création événement reçue: " + event);
            Event created = eventService.createEvent(event);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            System.err.println("❌ Erreur création événement: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/agents")
    public List<String> getAvailableAgents() {
        return eventService.getAvailableAgents();
    }

    @PutMapping("/{id}/cloture")
    public ResponseEntity<?> cloturerEvent(@PathVariable Long id, @RequestBody List<Double> location) {
        System.out.println("=========================================");
        System.out.println("📍 CLÔTURE ÉVÉNEMENT ID: " + id);
        System.out.println("📍 Location reçue: " + location);

        try {
            Event event = eventService.cloturerEvent(id, location);
            System.out.println("✅ Événement clôturé ID: " + id);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            System.err.println("❌ Erreur clôture: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/superviseur/{superviseur}")
    public List<Event> getEventBySuperviseur(@PathVariable String superviseur) {
        return eventService.getEventBySuperviseur(superviseur);
    }

    @GetMapping("/regional-superviseurs/{region}")
    public List<String> getSuperviseursByRegion(@PathVariable String region) {
        return userRepository.findAll().stream()
                .filter(u -> "ROLE_SUPERVISOR".equalsIgnoreCase(u.getRole()))
                .filter(u -> region.equalsIgnoreCase(u.getRegion()))
                .map(User::getUsername)
                .toList();
    }

    @GetMapping("/me/region")
    public ResponseEntity<String> getMyRegion() {
        String username = SecurityUtils.getUsername();
        String region = userRepository.findByUsername(username)
                .map(u -> u.getRegion() != null ? u.getRegion() : "")
                .orElse("");
        return ResponseEntity.ok(region);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        try {
            Event updated = eventService.updateEvent(id, event);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.err.println("❌ Erreur mise à jour: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // EventController.java
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        System.out.println("=========================================");
        System.out.println("🔥 DELETE reçu pour ID: " + id);
        System.out.println("🔥 Type de ID: " + id.getClass().getSimpleName());

        try {
            // ✅ Vérifier que l'événement existe
            Event event = eventService.getEventById(id);
            if (event == null) {
                System.out.println("❌ Événement ID " + id + " non trouvé");
                return ResponseEntity.status(404).body(Map.of("error", "Événement non trouvé"));
            }

            System.out.println("📋 Événement à supprimer: " + event.getName());
            System.out.println("📋 Créé par: " + event.getCreatedBy());

            // ✅ Supprimer
            eventService.deleteEvent(id);
            System.out.println("✅ Événement supprimé ID: " + id);

            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            System.err.println("❌ Erreur suppression: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}