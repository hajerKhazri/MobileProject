package enda_tao.Repository;

import enda_tao.Entity.LocalisationAp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LocalisationApRepository extends JpaRepository<LocalisationAp, Long> {
    List<LocalisationAp> findBySuperviseur(String superviseur);

}