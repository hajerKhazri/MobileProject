package enda_tao.Repository;

import enda_tao.Entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;   

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByCreatedBy(String createdBy);

    List<Event> findByRegion(String region);
    List<Event> findByCreatedByIn(List<String> usernames);
}