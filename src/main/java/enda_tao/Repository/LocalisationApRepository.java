package enda_tao.Repository;

import enda_tao.Entity.LocalisationAp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LocalisationApRepository extends JpaRepository<LocalisationAp, Long> {
    List<LocalisationAp> findBySuperviseur(String superviseur);
    @Query("SELECT DISTINCT l.region FROM LocalisationAp l WHERE l.region IS NOT NULL")
    List<String> findDistinctRegions();

}