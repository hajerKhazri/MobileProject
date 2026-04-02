package enda_tao.service;

import enda_tao.Entity.LocalisationAp;
import enda_tao.Repository.LocalisationApRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LocalisationApService {

    private final LocalisationApRepository repository;

    public LocalisationApService(LocalisationApRepository repository) {
        this.repository = repository;
    }

    public List<LocalisationAp> getAllLocalisations() {
        return repository.findAll();
    }

    public LocalisationAp saveLocalisation(LocalisationAp loc) {
        return repository.save(loc);
    }

    public List<LocalisationAp> getBySuperviseur(String superviseur) {
        List<LocalisationAp> locs = repository.findBySuperviseur(superviseur);

        for (LocalisationAp loc : locs) {
            String localisation = loc.getLocalisationFiabilise();

            if (localisation != null && !localisation.isBlank() && localisation.contains(",")) {
                try {
                    String[] parts = localisation.split(","); // utilise la variable déjà récupérée
                    
                    if (parts.length >= 2) { // vérifie qu'il y a bien 2 parties
                        loc.setLatitude(Double.parseDouble(parts[0].trim()));
                        loc.setLongitude(Double.parseDouble(parts[1].trim()));
                    } else {
                        loc.setLatitude(null);
                        loc.setLongitude(null);
                    }

                } catch (NumberFormatException e) {
                    // NumberFormatException plus précis que Exception
                    System.err.println("Coordonnées invalides pour agent: " 
                        + loc.getAgent() + " -> " + localisation);
                    loc.setLatitude(null);
                    loc.setLongitude(null);
                }
            } else {
                loc.setLatitude(null);
                loc.setLongitude(null);
            }
        }

        return locs;
    }




    
}