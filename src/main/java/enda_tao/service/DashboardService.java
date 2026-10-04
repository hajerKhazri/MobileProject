package enda_tao.service;

import enda_tao.Entity.Objectif;
import enda_tao.Entity.Transfer;
import enda_tao.Entity.User;                     // ✅ Import ajouté
import enda_tao.Repository.ObjectifRepository;
import enda_tao.Repository.TransferRepository;
import enda_tao.Repository.UserRepository;       // ✅ Import ajouté
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ObjectifRepository objectifRepository;
    private final TransferRepository transferRepository;
    private final UserRepository userRepository;   // ✅ Déclaration du champ

    // ✅ Constructeur avec les 3 repositories
    public DashboardService(ObjectifRepository objectifRepository,
                            TransferRepository transferRepository,
                            UserRepository userRepository) {
        this.objectifRepository = objectifRepository;
        this.transferRepository = transferRepository;
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> getAgentsBySuperviseur(String superviseur) {
        List<Objectif> agents = objectifRepository.findBySuperviseur(superviseur);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Objectif agent : agents) {
            List<Transfer> transfers = transferRepository.findByMsisdn(agent.getMsisdn());
            Map<String, Object> map = new HashMap<>();
            map.put("agent", agent);
            map.put("transfers", transfers);
            result.add(map);
        }

        return result;
    }
    public List<String> getAllSuperviseurs() {
        return userRepository.findAll().stream()
                .filter(u -> "ROLE_SUPERVISOR".equalsIgnoreCase(u.getRole()))
                .map(User::getUsername)
                .distinct()  // ✅ Supprime les doublons
                .collect(Collectors.toList());
    }
}