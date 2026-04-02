package enda_tao.Repository;

import enda_tao.Entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository  // <- import correct obligatoire
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByCreatedBy(String createdBy);

    List<Event> findByRegion(String region);

    List<Event> findByCreatedByIn(List<String> usernames);


    
    @Query("SELECT e FROM Event e WHERE e.superviseurString LIKE :superviseur")
    List<Event> findBySuperviseur(@Param("superviseur") String superviseur);

}