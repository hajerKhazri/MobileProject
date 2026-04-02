package enda_tao.Controller;

import enda_tao.Entity.Event;
import enda_tao.service.EventService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
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
    public Event createEvent(@RequestBody Event event) {
        return eventService.createEvent(event);
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
public Event cloturerEvent(@PathVariable Long id, @RequestBody List<Double> location) {
    return eventService.cloturerEvent(id, location);
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

}