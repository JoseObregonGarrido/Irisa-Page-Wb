package com.example.irisa_authentication.config;

import com.example.irisa_authentication.entity.User;
import com.example.irisa_authentication.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword ;

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findByUsername(adminUsername).orElseGet(() -> {
                User user = new User();
                user.setUsername(adminUsername);
                user.setPassword(passwordEncoder.encode(adminPassword)); // contraseña encriptada
                user.setActive(true);
                return userRepository.save(user);
            });
        };
    }
}