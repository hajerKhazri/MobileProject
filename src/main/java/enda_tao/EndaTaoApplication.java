package enda_tao;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EndaTaoApplication {

	public static void main(String[] args) {
		SpringApplication.run(EndaTaoApplication.class, args);
	}

}
