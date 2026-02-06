package com.example.irisa_authentication.config;

import com.example.irisa_authentication.entity.User;
import com.example.irisa_authentication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername(adminUsername).isEmpty()) {
            User user = new User();
            user.setUsername(adminUsername);
            user.setPassword(passwordEncoder.encode(adminPassword));
            user.setActive(true);
            userRepository.save(user);
            System.out.println("Usuario admin creado: " + adminUsername);
        }
    }
}