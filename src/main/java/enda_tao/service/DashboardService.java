package enda_tao.service;

import enda_tao.Entity.Objectif;
import enda_tao.Entity.Transfer;
import enda_tao.Repository.ObjectifRepository;
import enda_tao.Repository.TransferRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DashboardService {

    private final ObjectifRepository objectifRepository;
    private final TransferRepository transferRepository;

    public DashboardService(ObjectifRepository objectifRepository, TransferRepository transferRepository) {
        this.objectifRepository = objectifRepository;
        this.transferRepository = transferRepository;
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
    return objectifRepository.findAllSuperviseurs();
}
}