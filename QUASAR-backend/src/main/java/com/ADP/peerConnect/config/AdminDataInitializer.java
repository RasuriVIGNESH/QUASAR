package com.ADP.peerConnect.config;

import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.Role;
import com.ADP.peerConnect.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminDataInitializer {

    @Bean
    CommandLineRunner createDefaultAdmins(UserRepository userRepository,
                                          PasswordEncoder passwordEncoder) {

        return args -> {

            // -------- Admin 1 --------
            String admin1Email = "admin1@peerconnect.com";

            if (!userRepository.existsByEmail(admin1Email)) {

                User admin1 = new User();
                admin1.setEmail(admin1Email);
                admin1.setPassword(passwordEncoder.encode("Admin@123"));
                admin1.setFirstName("System");
                admin1.setLastName("Admin");
                admin1.setRole(Role.ADMIN);
                admin1.setVerified(true);

                // keep others optional / null
                userRepository.save(admin1);
            }

            // -------- Admin 2 --------
            String admin2Email = "admin2@peerconnect.com";

            if (!userRepository.existsByEmail(admin2Email)) {

                User admin2 = new User();
                admin2.setEmail(admin2Email);
                admin2.setPassword(passwordEncoder.encode("Admin@456"));
                admin2.setFirstName("Platform");
                admin2.setLastName("Admin");
                admin2.setRole(Role.ADMIN);
                admin2.setVerified(true);

                userRepository.save(admin2);
            }
        };
    }
}
