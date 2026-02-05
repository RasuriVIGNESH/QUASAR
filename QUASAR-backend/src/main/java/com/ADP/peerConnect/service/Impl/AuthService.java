package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ConflictException;
import com.ADP.peerConnect.exception.UnauthorizedException;
import com.ADP.peerConnect.model.dto.request.Auth.LoginRequest;
import com.ADP.peerConnect.model.dto.request.Auth.RegisterRequest;
import com.ADP.peerConnect.model.dto.response.AuthResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.College;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import com.ADP.peerConnect.repository.UserRepository;
import com.ADP.peerConnect.security.JwtTokenProvider;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iAuthService;
import com.ADP.peerConnect.util.Constants;
import com.ADP.peerConnect.util.ValidationUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for authentication operations
 */
@Service
@Transactional
public class AuthService implements iAuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CollegeService collegeService; // Autowire the CollegeService

    /**
     * Register a new user
     */
    public AuthResponse register(RegisterRequest registerRequest) {
        // Validate input
        validateRegisterRequest(registerRequest);

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new ConflictException(Constants.EMAIL_ALREADY_EXISTS);
        }

        // Find the college entity using the ID from the request
        College college = collegeService.getCollegeById(registerRequest.getCollegeId());

        // Create new user
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setBranch(registerRequest.getBranch());
        user.setGraduationYear(registerRequest.getGraduationYear());
        user.setBio(registerRequest.getBio());
        user.setCollege(college); // Assign the fetched college to the user

        user.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        user.setIsVerified(false);

        // Save user
        User savedUser = userRepository.save(user);

        // Generate JWT token
        String jwt = tokenProvider.generateTokenFromUserId(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName()
        );

        // Convert to response DTO
        UserResponse userResponse = new UserResponse(savedUser);

        return new AuthResponse(jwt, userResponse);
    }

    /**
     * Authenticate user login
     */
    public AuthResponse login(LoginRequest loginRequest) {
        // Validate input
        validateLoginRequest(loginRequest);

        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token
        String jwt = tokenProvider.generateToken(authentication);

        // Get user details
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException(Constants.USER_NOT_FOUND));

        // Convert to response DTO
        UserResponse userResponse = new UserResponse(user);

        return new AuthResponse(jwt, userResponse);
    }

    /**
     * Get current authenticated user
     */
    public UserResponse getCurrentUser(UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new UnauthorizedException(Constants.USER_NOT_FOUND));

        return new UserResponse(user);
    }

    /**
     * Validate register request
     */
    private void validateRegisterRequest(RegisterRequest request) {
        if (!ValidationUtils.isValidEmail(request.getEmail())) {
            throw new BadRequestException("Invalid email format");
        }

        if (!ValidationUtils.isValidPassword(request.getPassword())) {
            throw new BadRequestException("Password must contain at least 8 characters, one uppercase, one lowercase, and one digit");
        }

        if (!ValidationUtils.isValidLength(request.getFirstName(), Constants.MIN_NAME_LENGTH, Constants.MAX_NAME_LENGTH)) {
            throw new BadRequestException("First name must be between " + Constants.MIN_NAME_LENGTH + " and " + Constants.MAX_NAME_LENGTH + " characters");
        }

        if (!ValidationUtils.isValidLength(request.getLastName(), Constants.MIN_NAME_LENGTH, Constants.MAX_NAME_LENGTH)) {
            throw new BadRequestException("Last name must be between " + Constants.MIN_NAME_LENGTH + " and " + Constants.MAX_NAME_LENGTH + " characters");
        }

        if (!ValidationUtils.isValidBranch(request.getBranch())) {
            throw new BadRequestException("Invalid branch. Please select from the available options");
        }

        if (!ValidationUtils.isValidGraduationYear(request.getGraduationYear())) {
            throw new BadRequestException("Graduation year must be between " + Constants.MIN_GRADUATION_YEAR + " and " + Constants.MAX_GRADUATION_YEAR);
        }

        if (request.getBio() != null && request.getBio().length() > Constants.MAX_BIO_LENGTH) {
            throw new BadRequestException("Bio must not exceed " + Constants.MAX_BIO_LENGTH + " characters");
        }

        if (request.getCollegeId() == null) {
            throw new BadRequestException("College ID is required.");
        }
    }

    /**
     * Validate login request
     */
    private void validateLoginRequest(LoginRequest request) {
        if (!ValidationUtils.isValidEmail(request.getEmail())) {
            throw new BadRequestException("Invalid email format");
        }

        if (!ValidationUtils.isNotEmpty(request.getPassword())) {
            throw new BadRequestException("Password is required");
        }
    }
}
