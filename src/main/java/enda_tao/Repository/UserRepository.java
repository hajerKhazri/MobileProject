package enda_tao.Repository;

import enda_tao.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List; // 🔥 AJOUTER CET IMPORT


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

     List<User> findByRegion(String region);
         String findRegionByUsername(String username);

List<User> findByRegionAndRoleAndIsDeletedFalse(String region, String role);

}