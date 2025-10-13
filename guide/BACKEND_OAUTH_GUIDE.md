# Backend OAuth2 Implementation Guide

This guide provides implementation details for the backend API to support Google OAuth2 authentication.

## Required Endpoints

### 1. OAuth Authorization Endpoint

**Endpoint:** `GET /api/wb/v1/oauth2/authorize/google`

**Purpose:** Initiates OAuth flow by redirecting to Google

**Query Parameters:**
- `redirect_uri` (required) - Frontend redirect URI after authentication

**Implementation Example (Spring Boot):**

```java
@RestController
@RequestMapping("/api/wb/v1/oauth2")
public class OAuth2Controller {

    @Value("${google.client.id}")
    private String googleClientId;
    
    @Value("${google.client.secret}")
    private String googleClientSecret;
    
    @Value("${google.redirect.uri}")
    private String googleRedirectUri;

    @GetMapping("/authorize/google")
    public void authorizeGoogle(
            @RequestParam("redirect_uri") String frontendRedirectUri,
            HttpServletResponse response
    ) throws IOException {
        // Store frontend redirect URI in session/cookie for later use
        // (to redirect user back after authentication)
        
        // Build Google OAuth authorization URL
        String googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth"
            + "?client_id=" + googleClientId
            + "&redirect_uri=" + URLEncoder.encode(googleRedirectUri, "UTF-8")
            + "&response_type=code"
            + "&scope=" + URLEncoder.encode("openid profile email", "UTF-8")
            + "&state=" + generateRandomState(); // CSRF protection
        
        // Redirect user to Google
        response.sendRedirect(googleAuthUrl);
    }
    
    private String generateRandomState() {
        return UUID.randomUUID().toString();
    }
}
```

### 2. OAuth Callback Endpoint

**Endpoint:** `GET /api/wb/v1/oauth2/callback/google`

**Purpose:** Receives authorization code from Google and completes authentication

**Query Parameters:**
- `code` - Authorization code from Google
- `state` - State parameter for CSRF protection

**Implementation Example (Spring Boot):**

```java
@GetMapping("/callback/google")
public void callbackGoogle(
        @RequestParam("code") String code,
        @RequestParam(value = "state", required = false) String state,
        HttpServletRequest request,
        HttpServletResponse response
) throws IOException {
    try {
        // 1. Validate state parameter (CSRF protection)
        validateState(state, request);
        
        // 2. Exchange authorization code for access token
        GoogleTokenResponse tokenResponse = exchangeCodeForToken(code);
        
        // 3. Get user info from Google
        GoogleUserInfo userInfo = getUserInfoFromGoogle(tokenResponse.getAccessToken());
        
        // 4. Find or create user in database
        User user = findOrCreateUser(userInfo);
        
        // 5. Generate JWT token for your application
        String jwtToken = generateJwtToken(user);
        
        // 6. Get frontend redirect URI from session/cookie
        String frontendRedirectUri = getFrontendRedirectUri(request);
        
        // 7. Redirect to frontend with token
        String redirectUrl = frontendRedirectUri 
            + "?token=" + jwtToken 
            + "&type=Bearer";
        
        response.sendRedirect(redirectUrl);
        
    } catch (Exception e) {
        log.error("OAuth callback error", e);
        // Redirect to frontend with error
        String errorRedirectUrl = getFrontendRedirectUri(request) 
            + "?error=" + URLEncoder.encode(e.getMessage(), "UTF-8");
        response.sendRedirect(errorRedirectUrl);
    }
}

private GoogleTokenResponse exchangeCodeForToken(String code) throws IOException {
    RestTemplate restTemplate = new RestTemplate();
    
    MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
    params.add("code", code);
    params.add("client_id", googleClientId);
    params.add("client_secret", googleClientSecret);
    params.add("redirect_uri", googleRedirectUri);
    params.add("grant_type", "authorization_code");
    
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
    
    HttpEntity<MultiValueMap<String, String>> request = 
        new HttpEntity<>(params, headers);
    
    ResponseEntity<GoogleTokenResponse> response = restTemplate.postForEntity(
        "https://oauth2.googleapis.com/token",
        request,
        GoogleTokenResponse.class
    );
    
    return response.getBody();
}

private GoogleUserInfo getUserInfoFromGoogle(String accessToken) {
    RestTemplate restTemplate = new RestTemplate();
    
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(accessToken);
    
    HttpEntity<String> entity = new HttpEntity<>(headers);
    
    ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        HttpMethod.GET,
        entity,
        GoogleUserInfo.class
    );
    
    return response.getBody();
}

private User findOrCreateUser(GoogleUserInfo userInfo) {
    // Check if user exists by email
    Optional<User> existingUser = userRepository.findByEmail(userInfo.getEmail());
    
    if (existingUser.isPresent()) {
        // User exists, update last login
        User user = existingUser.get();
        user.setLastLoginAt(LocalDateTime.now());
        return userRepository.save(user);
    } else {
        // Create new user
        User newUser = new User();
        newUser.setEmail(userInfo.getEmail());
        newUser.setUserName(userInfo.getEmail());
        newUser.setFirstName(userInfo.getGivenName());
        newUser.setLastName(userInfo.getFamilyName());
        newUser.setProfilePicture(userInfo.getPicture());
        newUser.setEmailVerified(userInfo.getVerifiedEmail());
        newUser.setOauthProvider("GOOGLE");
        newUser.setOauthProviderId(userInfo.getId());
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setLastLoginAt(LocalDateTime.now());
        
        return userRepository.save(newUser);
    }
}

private String generateJwtToken(User user) {
    // Generate JWT token using your preferred library (e.g., jjwt)
    return Jwts.builder()
        .setIssuer("USER")
        .setSubject(user.getEmail())
        .claim("id", user.getId())
        .claim("username", user.getUserName())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24 hours
        .signWith(SignatureAlgorithm.RS256, privateKey)
        .compact();
}
```

## Data Models

### GoogleTokenResponse

```java
@Data
public class GoogleTokenResponse {
    @JsonProperty("access_token")
    private String accessToken;
    
    @JsonProperty("expires_in")
    private Integer expiresIn;
    
    @JsonProperty("refresh_token")
    private String refreshToken;
    
    @JsonProperty("scope")
    private String scope;
    
    @JsonProperty("token_type")
    private String tokenType;
    
    @JsonProperty("id_token")
    private String idToken;
}
```

### GoogleUserInfo

```java
@Data
public class GoogleUserInfo {
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("verified_email")
    private Boolean verifiedEmail;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("given_name")
    private String givenName;
    
    @JsonProperty("family_name")
    private String familyName;
    
    @JsonProperty("picture")
    private String picture;
    
    @JsonProperty("locale")
    private String locale;
}
```

### User Entity

```java
@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String userName;
    
    private String firstName;
    private String lastName;
    private String profilePicture;
    
    @Column(name = "email_verified")
    private Boolean emailVerified = false;
    
    // OAuth fields
    @Column(name = "oauth_provider")
    private String oauthProvider; // "GOOGLE", "GITHUB", etc.
    
    @Column(name = "oauth_provider_id")
    private String oauthProviderId; // User ID from OAuth provider
    
    // For traditional login
    @Column(name = "password_hash")
    private String passwordHash; // Null for OAuth users
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
}
```

## Database Schema

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_picture TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    oauth_provider VARCHAR(50), -- 'GOOGLE', 'GITHUB', etc.
    oauth_provider_id VARCHAR(255), -- User ID from OAuth provider
    password_hash VARCHAR(255), -- NULL for OAuth users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster OAuth lookups
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_provider_id);
CREATE INDEX idx_users_email ON users(email);
```

## Configuration

### application.yml (Spring Boot)

```yaml
google:
  client:
    id: ${GOOGLE_CLIENT_ID}
    secret: ${GOOGLE_CLIENT_SECRET}
  redirect:
    uri: ${GOOGLE_OAUTH_CALLBACK_URI:http://localhost:8080/api/wb/v1/oauth2/callback/google}

oauth:
  frontend:
    redirect-uri: ${FRONTEND_OAUTH_REDIRECT_URI:http://localhost:3000/oauth2/redirect}

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000 # 24 hours in milliseconds

# CORS configuration to allow frontend requests
cors:
  allowed-origins:
    - http://localhost:3000
    - https://your-production-domain.com
  allowed-methods:
    - GET
    - POST
    - PUT
    - DELETE
    - OPTIONS
  allowed-headers:
    - "*"
  allow-credentials: true
```

### Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_OAUTH_CALLBACK_URI=http://localhost:8080/api/wb/v1/oauth2/callback/google

# Frontend
FRONTEND_OAUTH_REDIRECT_URI=http://localhost:3000/oauth2/redirect

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=86400000

# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/planpro
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
```

## Security Considerations

### 1. State Parameter (CSRF Protection)

```java
// Generate and store state in session
private String generateAndStoreState(HttpSession session) {
    String state = UUID.randomUUID().toString();
    session.setAttribute("oauth_state", state);
    return state;
}

// Validate state from callback
private void validateState(String state, HttpServletRequest request) {
    HttpSession session = request.getSession(false);
    if (session == null) {
        throw new SecurityException("No session found");
    }
    
    String storedState = (String) session.getAttribute("oauth_state");
    if (storedState == null || !storedState.equals(state)) {
        throw new SecurityException("Invalid state parameter");
    }
    
    // Remove state after validation
    session.removeAttribute("oauth_state");
}
```

### 2. Token Security

```java
@Bean
public JwtDecoder jwtDecoder() {
    return NimbusJwtDecoder.withPublicKey(publicKey).build();
}

@Bean
public JwtEncoder jwtEncoder() {
    JWK jwk = new RSAKey.Builder(publicKey)
        .privateKey(privateKey)
        .build();
    JWKSource<SecurityContext> jwkSource = new ImmutableJWKSet<>(new JWKSet(jwk));
    return new NimbusJwtEncoder(jwkSource);
}
```

### 3. Rate Limiting

```java
@Bean
public RateLimiter oauthRateLimiter() {
    return RateLimiter.create(10.0); // 10 requests per second
}

// In controller
@GetMapping("/authorize/google")
public void authorizeGoogle(...) {
    if (!oauthRateLimiter.tryAcquire()) {
        throw new TooManyRequestsException("Rate limit exceeded");
    }
    // ... rest of implementation
}
```

## Testing

### Unit Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
class OAuth2ControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserRepository userRepository;
    
    @Test
    void testAuthorizeGoogle() throws Exception {
        mockMvc.perform(get("/api/wb/v1/oauth2/authorize/google")
                .param("redirect_uri", "http://localhost:3000/oauth2/redirect"))
            .andExpect(status().is3xxRedirection())
            .andExpect(redirectedUrlPattern("https://accounts.google.com/**"));
    }
    
    @Test
    void testCallbackGoogle() throws Exception {
        // Mock user
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        
        when(userRepository.findByEmail(anyString()))
            .thenReturn(Optional.of(user));
        
        mockMvc.perform(get("/api/wb/v1/oauth2/callback/google")
                .param("code", "mock-auth-code")
                .param("state", "mock-state"))
            .andExpect(status().is3xxRedirection())
            .andExpect(redirectedUrlPattern("http://localhost:3000/oauth2/redirect?token=*"));
    }
}
```

### Integration Tests

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OAuth2IntegrationTest {
    
    @LocalServerPort
    private int port;
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testOAuthFlow() {
        String redirectUri = "http://localhost:3000/oauth2/redirect";
        
        // Test authorization endpoint
        ResponseEntity<String> response = restTemplate.getForEntity(
            "http://localhost:" + port + "/api/wb/v1/oauth2/authorize/google?redirect_uri=" + redirectUri,
            String.class
        );
        
        assertEquals(HttpStatus.FOUND, response.getStatusCode());
        assertTrue(response.getHeaders().getLocation().toString()
            .contains("accounts.google.com"));
    }
}
```

## Logging

```java
@Slf4j
@RestController
public class OAuth2Controller {
    
    @GetMapping("/callback/google")
    public void callbackGoogle(...) {
        log.info("OAuth callback received - code: {}, state: {}", 
            code != null ? "present" : "missing", 
            state != null ? "present" : "missing");
        
        try {
            GoogleTokenResponse tokenResponse = exchangeCodeForToken(code);
            log.debug("Token exchange successful");
            
            GoogleUserInfo userInfo = getUserInfoFromGoogle(tokenResponse.getAccessToken());
            log.info("User info retrieved for email: {}", userInfo.getEmail());
            
            User user = findOrCreateUser(userInfo);
            log.info("User authenticated: {}", user.getId());
            
            // ... rest of implementation
            
        } catch (Exception e) {
            log.error("OAuth callback error", e);
            throw e;
        }
    }
}
```

## Troubleshooting

### Common Issues

1. **Invalid redirect URI**
   - Ensure Google Cloud Console has exact URI
   - Check for trailing slashes
   - Verify protocol (http vs https)

2. **Token exchange fails**
   - Verify client ID and secret
   - Check authorization code hasn't expired
   - Ensure redirect URI matches

3. **User info retrieval fails**
   - Verify access token is valid
   - Check Google API is enabled
   - Ensure proper scopes requested

## Production Checklist

- [ ] Enable HTTPS
- [ ] Configure proper CORS settings
- [ ] Implement rate limiting
- [ ] Add comprehensive logging
- [ ] Set up monitoring and alerts
- [ ] Configure secure session management
- [ ] Use environment variables for secrets
- [ ] Implement proper error handling
- [ ] Add database indexes
- [ ] Set up backup and recovery
- [ ] Test with production Google credentials
- [ ] Update Google Cloud Console with production URIs

## Additional Resources

- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Spring Security OAuth](https://spring.io/projects/spring-security-oauth)
- [JWT.io](https://jwt.io/)
- [OWASP OAuth Security](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html)

