package enda_tao.Controller;

import enda_tao.Entity.LocalisationAp;
import enda_tao.service.LocalisationApService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/localisation_ap")
public class LocalisationApController {

    private final LocalisationApService service;

    public LocalisationApController(LocalisationApService service) {
        this.service = service;
    }

@GetMapping("/superviseur/{superviseur}")
public List<LocalisationAp> getBySuperviseur(@PathVariable String superviseur) {
    try {
        return service.getBySuperviseur(superviseur);
    } catch (Exception e) {
        e.printStackTrace(); // <-- affichera la stack trace complète
        throw e; // ou renvoie une ResponseEntity avec message d'erreur
    }
}


  @GetMapping("/all")
    public List<LocalisationAp> getAllAgents() {
        try {
            return service.getAllLocalisations();
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }


}