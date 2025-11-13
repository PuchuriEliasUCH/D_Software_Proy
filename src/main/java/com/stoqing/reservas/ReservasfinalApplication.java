package com.stoqing.reservas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class ReservasfinalApplication {

public static void main(String[] args) {
    SpringApplication.run(ReservasfinalApplication.class, args);
}

}
