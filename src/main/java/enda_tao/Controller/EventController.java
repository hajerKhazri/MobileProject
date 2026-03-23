package enda_tao.Controller;

import enda_tao.Entity.Event;
import enda_tao.service.EventService;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/events")

public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
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

}