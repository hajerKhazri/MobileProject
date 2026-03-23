package enda_tao.Repository;

import enda_tao.Entity.Objectif;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ObjectifRepository extends JpaRepository<Objectif, String> {

    List<Objectif> findBySuperviseur(String superviseur);


@Query("SELECT o FROM Objectif o WHERE LOWER(o.superviseur) = LOWER(:superviseur)")
List<Objectif> findBySuperviseurIgnoreCase(@Param("superviseur") String superviseur);

@Query("SELECT DISTINCT o.superviseur FROM Objectif o WHERE o.superviseur IS NOT NULL AND o.superviseur <> ''")
List<String> findAllSuperviseurs();


}