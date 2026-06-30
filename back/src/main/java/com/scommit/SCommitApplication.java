package com.scommit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SCommitApplication {

    public static void main(String[] args) {
        SpringApplication.run(SCommitApplication.class, args);
    }

}
