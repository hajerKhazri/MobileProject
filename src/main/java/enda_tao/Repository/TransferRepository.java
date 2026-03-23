package enda_tao.Repository;

import enda_tao.Entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransferRepository extends JpaRepository<Transfer, String> {

    List<Transfer> findByMsisdn(String msisdn);

}