package com.priyamart.backend;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/auth")
public class AuthController {

    private final userRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(userRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            return "Username already exists!";
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already exists!";
        }

        String hashedPassword =
                passwordEncoder.encode(request.getPassword());

        user user = new user();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(hashedPassword);

        userRepository.save(user);

        return "Registration successful!";
    }

@PostMapping("/login")
public String login(@RequestBody LoginRequest request) {

    user user = userRepository.findByUsername(request.getUsername());

    if (user == null) {
        user = userRepository.findByEmail(request.getUsername());
    }

    if (user == null) {
        return "Invalid username or password!";
    }

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        return "Invalid username or password!";
    }

    return "Login successful!";
}
}