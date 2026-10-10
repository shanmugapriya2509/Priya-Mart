package com.priyamart.backend;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class AuthController 
{

    private final userRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(userRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        String username = request.getUsername();
String email = request.getEmail();
String password = request.getPassword();

if (username == null || username.trim().length() < 3) {
    return "Username must contain at least 3 characters!";
}

if (username.contains(" ")) {
    return "Username must not contain spaces!";
}

if (email == null || email.trim().isEmpty()) {
    return "Please enter your email!";
}

email = email.trim().toLowerCase();

if (!email.matches("^[A-Za-z0-9._%+-]+@gmail\\.com$")) {
    return "Please enter a valid Gmail address ending with @gmail.com!";
}

if (password == null || password.length() < 8) {
    return "Password must contain at least 8 characters!";
}

if (password.contains(" ")) {
    return "Password must not contain spaces!";
}

if (!password.matches(".*[A-Z].*")) {
    return "Password must contain at least one uppercase letter!";
}

if (!password.matches(".*[a-z].*")) {
    return "Password must contain at least one lowercase letter!";
}

if (!password.matches(".*[0-9].*")) {
    return "Password must contain at least one number!";
}

if (!password.matches(".*[^A-Za-z0-9].*")) {
    return "Password must contain at least one special character!";
}

if (userRepository.existsByUsername(username.trim())) {
                return "Username already exists!";
        }

if (userRepository.existsByEmail(email)) {
                return "Email already exists!";
        }

        String hashedPassword =
                   passwordEncoder.encode(password);
        user user = new user();
    user.setUsername(username.trim());
    user.setEmail(email);
    user.setPassword(hashedPassword);

     String accountType = request.getAccountType();

    if ("SELLER".equalsIgnoreCase(accountType)) {
    user.setRole("SELLER_PENDING");
   } else {
    user.setRole("BUYER");
   }

userRepository.save(user);


        return "Registration successful!";
    }

            @PostMapping("/login")
     public ResponseEntity<?> login(
        @RequestBody LoginRequest request,
        jakarta.servlet.http.HttpServletRequest requestSession) {
    user account = userRepository.findByUsername(request.getUsername());

    if (account == null) {
        account = userRepository.findByEmail(request.getUsername());
    }

    if (account == null ||
        !passwordEncoder.matches(
            request.getPassword(),
            account.getPassword()
        )) {

        return ResponseEntity
                .status(401)
                .body(Map.of(
                    "message", "Invalid username or password!"
                ));
    }

    String role = account.getRole();

    if (role == null || role.isBlank()) {
        role = "BUYER";
    }

    HttpSession oldSession = requestSession.getSession(false);

if (oldSession != null) {
    oldSession.invalidate();
}

HttpSession session = requestSession.getSession(true);

session.setAttribute("userId", account.getId());
session.setAttribute("role", role.toUpperCase());

    return ResponseEntity.ok(
        Map.of(
            "message", "Login successful!",
            "userId", account.getId(),
            "username", account.getUsername(),
            "email", account.getEmail(),
            "role", role
        )
    );
}
}