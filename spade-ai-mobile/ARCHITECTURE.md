# SPADE-AI Mobile - Complete Architecture Guide

## 📋 Project Overview
**SPADE-AI** is a Flutter mobile application for soil analysis and agricultural AI recommendations. It uses a layered architecture with state management (Riverpod), HTTP client (Dio), and feature-based structure.

---

## 🏗️ Architecture Layers (Clean Architecture Pattern)

```
┌─────────────────────────────────────────────┐
│         UI Layer (Features)                 │
│   Screens, Widgets, User Interactions      │
├─────────────────────────────────────────────┤
│    State Management Layer (Providers)       │
│   Riverpod StateNotifier for App State     │
├─────────────────────────────────────────────┤
│     Business Logic Layer (Services)         │
│   API Calls, Authentication, Token Mgmt    │
├─────────────────────────────────────────────┤
│       Data Layer (Models, Storage)          │
│   Serialization, Parsing, Data Structures  │
└─────────────────────────────────────────────┘
```

---

## 📁 Directory Structure Explained

### 1. **lib/main.dart** - App Entry Point
```dart
void main() {
  runApp(const ProviderScope(child: MyApp()));
}
```
- **Purpose**: Initializes the Flutter app and wraps it in `ProviderScope` (Riverpod)
- **Key**: Without `ProviderScope`, providers won't work in the app
- **Theme**: Uses `MaterialApp.router` for go_router navigation
- **Title**: "SPADE-AI" app name

---

### 2. **lib/config/** - Configuration & Setup

#### **routes.dart** - App Navigation Routes
- **What it does**: Defines all app routes and navigation flow
- **Key Components**:
  - `splash` (/) → Initial screen when app launches
  - `login` (/login) → Login page (no auth needed)
  - `register` (/register) → Registration page (future)
  - `main/home` (/main/home) → Home dashboard (requires auth)
  - `main/upload` (/main/upload) → Upload soil image screen
  - `main/recommendation` (/main/recommendation) → Analysis results
  - `main/profile` (/main/profile) → User profile & settings

- **Key Feature - Route Guards (Redirect Logic)**:
  ```dart
  redirect: (context, state) {
    if (!isAuthenticated && state.path != '/login') {
      return '/login';  // Force unauthenticated users to login
    }
    if (isAuthenticated && state.path == '/login') {
      return '/main/home';  // Redirect authenticated users from login
    }
  }
  ```
  - Reads `authProvider` to check if user is authenticated
  - Prevents unauthorized access to protected routes
  - Automatically redirects users to appropriate screens

- **ShellRoute Pattern**: 
  - Wraps main app screens with `MainNavigationScreen` (bottom nav bar)
  - Nested routes share the same navigation structure

#### **theme.dart** - UI Styling
- **Color Palette**:
  - Primary: Green (#2E7D32) - for soil/agricultural context
  - Secondary: Accent Green (#66BB6A)
  - Status colors: Success (green), Error (red), Warning (orange)

- **Components Styled**:
  - `AppBarTheme`: Green background, white text, centered title
  - `InputDecorationTheme`: Rounded input fields with green focus border
  - `ElevatedButtonTheme`: Full-width green buttons with rounded corners
  - `TextTheme`: Font sizes for display, headlines, body text

#### **api_config.dart** - Backend Configuration
```dart
static const String _macNetworkIp = '192.168.0.104';
static const String _networkUrl = 'http://$_macNetworkIp:8000';
```
- **Purpose**: Centralized backend URL configuration
- **Current**: Set to `192.168.0.104:8000` (local network IP)
- **Change for**: Different environments (localhost, staging, production)
- **Endpoints Expected**:
  - `POST /api/v1/auth/login` - User login
  - `POST /api/v1/auth/refresh` - Refresh access token
  - `GET /api/v1/auth/me` - Get current user info

---

### 3. **lib/core/** - Shared Utilities & Constants

#### **logger.dart** - Debugging Utility
```dart
Logger.info('User logged in', tag: 'AuthService');    // ℹ️
Logger.success('Login successful', tag: 'AuthService'); // ✅
Logger.warning('Token expired', tag: 'DioClient');     // ⚠️
Logger.error('Failed to login', tag: 'AuthService');   // ❌
```
- **Purpose**: Centralized console logging with emojis for different levels
- **Tags**: Identify which module logged the message
- **Used Throughout**: All services for debugging API calls and state changes

#### **constants/** - App-wide Constants
- `strings.dart`: Localized UI strings
- May contain hardcoded values, enums, or constants

#### **widgets/** - Reusable UI Components
- `custom_button.dart` - Styled buttons
- `custom_text_field.dart` - Input fields with validation
- Used across multiple screens (DRY principle)

---

### 4. **lib/models/** - Data Structures

#### **auth_model.dart** - Authentication Data Models
```dart
class UserLoginRequest {
  final String email;
  final String password;
  Map<String, dynamic> toJson() => {...};  // For API requests
}

class TokenResponse {
  final String accessToken;
  final String refreshToken;
  factory TokenResponse.fromJson(Map data) => {...};  // Parse API response
}

class UserResponse {
  final int id, name, email, phone, role, is_active, created_at, updated_at;
  factory UserResponse.fromJson(Map data) => {...};
}
```
- **Purpose**: Define data structures matching backend API
- **Key Methods**:
  - `toJson()`: Convert Dart object → JSON for API requests
  - `fromJson()`: Convert JSON response → Dart object (deserialization)
- **Flow**: Model ↔ Service ↔ Provider ↔ UI

#### **soil_analysis_model.dart** - Analysis Data
```dart
class SoilAnalysisModel {
  final String id, userId, imagePath, soilType;
  final double phLevel, healthScore;
  final String nitrogen, phosphorus, potassium, organicMatter;
  final List<String> recommendations;
  final DateTime analyzedAt;
}
```
- **Purpose**: Represents soil analysis results from backend
- **Data Fields**: pH, NPK values, health score, recommendations
- **Used**: Display analysis results on recommendation screen

---

### 5. **lib/services/** - Business Logic & API Layer

#### **token_storage.dart** - Secure Token Persistence
```
┌─────────────────────────────────┐
│   TokenStorage (Singleton)      │
│   ┌─────────────────────────┐   │
│   │ flutter_secure_storage │   │ Android: Keystore
│   │ (Device Encryption)    │   │ iOS: Keychain
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

- **Purpose**: Securely store JWT tokens on device
- **Singleton Pattern**: Only one instance throughout app lifetime
- **Methods**:
  - `saveTokens(accessToken, refreshToken)` - Encrypt & store both tokens
  - `getAccessToken()` - Retrieve access token (for API requests)
  - `getRefreshToken()` - Retrieve refresh token (for refresh requests)
  - `hasTokens()` - Check if tokens exist
  - `clearTokens()` - Delete on logout

- **Security**: 
  - Uses `flutter_secure_storage` (native encryption)
  - iOS: Keychain
  - Android: Keystore
  - NOT stored in SharedPreferences (not secure)

#### **auth_service.dart** - Authentication API Calls
```
┌──────────────────────────────────┐
│   AuthService                    │
│  ┌────────────────────────────┐  │
│  │ login(email, password)     │──→ POST /api/v1/auth/login
│  │ refreshToken(token)        │──→ POST /api/v1/auth/refresh
│  │ getCurrentUser()            │──→ GET /api/v1/auth/me
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

- **Purpose**: Handle all authentication-related API requests
- **Key Methods**:
  ```dart
  Future<TokenResponse> login({email, password})
    // Sends credentials to backend, receives access/refresh tokens
  
  Future<TokenResponse> refreshToken(refreshToken)
    // Sends refresh token, gets new access token
  
  Future<UserResponse> getCurrentUser()
    // Gets logged-in user info (protected by JWT)
  ```

- **Error Handling**:
  - Catches `DioException` for network errors
  - Converts errors to user-friendly messages
  - Logs errors with tags for debugging

#### **dio_client.dart** - HTTP Client with JWT & Auto-Refresh
```
┌─────────────────────────────────────────────┐
│  DioClient (Singleton)                      │
│  ┌───────────────────────────────────────┐  │
│  │ Interceptors (Request/Response/Error)│  │
│  ├───────────────────────────────────────┤  │
│  │ 1. onRequest: Add JWT Bearer Token   │  │
│  │ 2. onResponse: Pass through          │  │
│  │ 3. onError: Handle 401 & Refresh     │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Request Interceptor** - JWT Token Injection:
```dart
// Every API request gets Authorization header
onRequest: (options, handler) {
  final token = await tokenStorage.getAccessToken();
  options.headers['Authorization'] = 'Bearer $token';
  return handler.next(options);
}
```

**Error Interceptor** - Automatic Token Refresh:
```
1. User makes API request with old token
2. Server returns 401 Unauthorized
3. Error interceptor catches 401
4. Check if already refreshing (prevent race conditions)
5. Call /api/v1/auth/refresh with refresh_token
6. Save new tokens
7. Retry original request with new token
8. Return response to caller
```

**Queue System** - Prevent Multiple Refreshes:
```dart
if (_isRefreshing) {
  // Queue this request, wait for refresh to complete
  Completer<void> completer = Completer();
  _refreshQueue.add(completer);
  await completer.future;
}
```
- Handles concurrent requests from multiple screens
- Only one token refresh happens at a time
- All queued requests retry after refresh completes

**Clean Dio Instance** - Avoid Infinite Loops:
```dart
// For token refresh, use fresh Dio without interceptors
// Otherwise: refresh request → 401 → refresh again → infinite loop
final cleanDio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
final refreshResponse = await cleanDio.post('/api/v1/auth/refresh', ...);
```

---

### 6. **lib/providers/** - State Management (Riverpod)

#### **auth_provider.dart** - Authentication State

**State Class** - Immutable auth state:
```dart
class AuthState {
  final bool isAuthenticated;      // Is user logged in?
  final bool isLoading;            // Is API call in progress?
  final String? error;             // Error message if any
  final UserResponse? user;        // Logged-in user data
  final String? accessToken;       // Current access token
}
```

**StateNotifier** - Manage state changes:
```dart
class AuthNotifier extends StateNotifier<AuthState> {
  // Methods that change state
  Future<void> login(email, password) { ... }
  Future<void> checkAuthStatus() { ... }
  Future<void> logout() { ... }
}
```

**Provider** - Global access point:
```dart
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(),
);
```

**Data Flow**:
```
UI Screen (LoginScreen)
    ↓
User taps "Login" button
    ↓
Screen calls: ref.read(authProvider.notifier).login(email, password)
    ↓
AuthNotifier.login() method executes
    ↓
Calls AuthService.login() → HTTP request to backend
    ↓
Tokens received, saved via TokenStorage
    ↓
AuthNotifier updates state: isAuthenticated = true
    ↓
Screen watches authProvider, sees change
    ↓
UI rebuilds with new state
    ↓
If authenticated, navigate to /main/home
```

**Methods**:

1. **login(email, password)** - User login flow
   - Set isLoading = true
   - Call AuthService.login()
   - Save tokens to secure storage
   - Fetch user info via getCurrentUser()
   - Update state: isAuthenticated = true
   - Set isLoading = false

2. **checkAuthStatus()** - Called on app launch (from SplashScreen)
   - Check if tokens exist in storage
   - If yes: Try to validate with getCurrentUser()
   - If successful: isAuthenticated = true
   - If fails: Clear tokens, logout

3. **logout()** - User logout
   - Clear tokens from storage
   - Reset state to default (all false/null)
   - Force navigation to /login

---

### 7. **lib/features/** - Feature Modules

Each feature is self-contained with screens and widgets specific to that feature.

#### **features/splash/** - App Launch Screen
```dart
class SplashScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // On first frame, check authentication status
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(authProvider.notifier).checkAuthStatus();
    });
    
    // Then route based on auth state
    ref.listen(authProvider, (prev, next) {
      if (next.isAuthenticated) {
        context.go('/main/home');
      } else {
        context.go('/login');
      }
    });
    
    return Scaffold(...);  // Loading UI
  }
}
```
- **Purpose**: Initial screen when app loads
- **Task**: Validate stored tokens and determine next screen
- **Flow**:
  1. App starts → SplashScreen shows loading animation
  2. Calls authProvider.checkAuthStatus()
  3. If tokens valid → Navigate to /main/home
  4. If no tokens → Navigate to /login
  5. If tokens invalid → Clear and navigate to /login

#### **features/auth/** - Authentication Screens

**LoginScreen.dart** - User Login UI
```dart
class LoginScreen extends ConsumerStatefulWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    
    // Display loading, error, or success states
    if (authState.isLoading) {
      return CircularProgressIndicator();
    }
    
    if (authState.error != null) {
      return Text('Error: ${authState.error}');
    }
    
    // Render form with email & password fields
    return Column(
      children: [
        CustomTextField(email),
        CustomTextField(password),
        ElevatedButton(
          onPressed: () {
            ref.read(authProvider.notifier).login(email, password);
          },
          child: Text('Sign In'),
        ),
      ],
    );
  }
}
```

- **Features**:
  - Email & password input fields
  - Form validation (email format, required fields)
  - Loading spinner while authenticating
  - Error message display
  - Auto-navigation on success
  - Link to register screen

- **Input Validation**:
  ```dart
  bool _isValidEmail(String email) {
    return RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(email);
  }
  ```

**RegisterScreen.dart** - User Registration (Future)
- Currently a stub/placeholder
- Will allow new user signup (when backend ready)

#### **features/home/** - Main Dashboard
- Displays user's soil analysis history
- Shows statistics/health scores
- Quick action buttons (upload, view recommendations)

#### **features/upload/** - Image Upload
- Camera/gallery image picker integration
- Send image to backend for analysis
- Show processing state

#### **features/recommendation/** - Results Display
- Show soil analysis results
- Display NPK values, pH level, health score
- Show AI recommendations
- Plant suggestions based on soil type

#### **features/profile/** - User Profile
```dart
class ProfileScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    
    return Column(
      children: [
        Text('${authState.user?.name}'),
        Text('${authState.user?.email}'),
        ElevatedButton(
          onPressed: () {
            ref.read(authProvider.notifier).logout();
            context.go('/login');
          },
          child: Text('Logout'),
        ),
      ],
    );
  }
}
```
- Display logged-in user information
- Logout button

#### **features/navigation/** - App Navigation Structure
```dart
class MainNavigationScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,  // Current screen content
      bottomNavigationBar: BottomNavigationBar(
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.upload), label: 'Upload'),
          BottomNavigationBarItem(icon: Icon(Icons.assessment), label: 'Results'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
        onTap: (index) {
          // Navigate to different screens
        },
      ),
    );
  }
}
```
- Wraps authenticated screens with bottom navigation
- Allows navigation between home, upload, recommendation, profile
- Non-authenticated screens (splash, login, register) don't show nav bar

---

## 🔄 Complete User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      App Starts (main.dart)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
                   ┌─────────────────────┐
                   │  SplashScreen Shown │
                   └────────────┬────────┘
                                │
                                ↓
                   checkAuthStatus() called
                   TokenStorage checks for tokens
                        │
          ┌─────────────┴─────────────┐
          │                           │
       NO tokens                  YES tokens found
          │                           │
          ↓                           ↓
    Navigate to              validateUser with backend
    /login                           │
          │                    ┌──────┴──────┐
          │                    │             │
          │                Valid        Invalid/Expired
          │                    │             │
          │                    ↓             ↓
          │              Update state    Clear tokens
          │              isAuthenticated └─→ Navigate to /login
          │                    │             │
          └────────┬───────────┘             │
                   ↓                         │
          ┌─────────────────────┐            │
          │  LoginScreen        │◄───────────┘
          │  (Email + Password) │
          └────────────┬────────┘
                       │
              User fills & submits
                       │
                       ↓
          authProvider.notifier.login()
                       │
                       ↓
          DioClient injects empty JWT
          Send POST /api/v1/auth/login
                       │
          ┌────────────┴──────────────┐
          │                           │
       Error (401)             Success (200)
          │                           │
          ↓                           ↓
    Show error msg         TokenResponse received
    Stay on login          (accessToken, refreshToken)
                                      │
                                      ↓
                          TokenStorage.saveTokens()
                          (encrypted in Keychain/Keystore)
                                      │
                                      ↓
                          AuthService.getCurrentUser()
                                      │
                                      ↓
                          AuthNotifier updates state
                          isAuthenticated = true
                                      │
                                      ↓
                          LoginScreen detects change
                          Navigate to /main/home
                                      │
                                      ↓
          ┌─────────────────────────────────────────┐
          │  MainNavigationScreen + HomeScreen      │
          │  (With bottom nav bar)                  │
          │  Every API request gets JWT injected    │
          └─────────────────────────────────────────┘
```

---

## 🔐 JWT Token Lifecycle

```
1. LOGIN PHASE
   User: email + password
      ↓
   Backend: validates credentials
      ↓
   Response: {access_token, refresh_token}
      ↓
   TokenStorage: saves both (encrypted)

2. AUTHENTICATED REQUEST PHASE
   App makes request (e.g., GET /api/v1/soil-history)
      ↓
   DioClient.onRequest interceptor:
      - Get access_token from TokenStorage
      - Add: Authorization: Bearer {access_token}
      ↓
   Send request to backend
      ↓
   Backend validates JWT signature
      ↓
   Response: 200 OK with data
      ↓
   Return data to caller

3. TOKEN EXPIRED PHASE
   App makes request with old token
      ↓
   DioClient sends request with old JWT
      ↓
   Backend: token expired (401 Unauthorized)
      ↓
   DioClient.onError interceptor catches 401:
      - Check if already refreshing (queue logic)
      - Get refresh_token from TokenStorage
      - Send POST /api/v1/auth/refresh
      ↓
   Backend validates refresh_token
      ↓
   Response: {new_access_token, new_refresh_token}
      ↓
   TokenStorage: update with new tokens
      ↓
   DioClient: retry original request with new token
      ↓
   Backend: accepts new JWT, returns data
      ↓
   Success! Data returned to caller

4. LOGOUT PHASE
   User taps "Logout" button
      ↓
   authProvider.notifier.logout()
      ↓
   TokenStorage.clearTokens() (delete from device)
      ↓
   AuthNotifier: reset state (isAuthenticated = false)
      ↓
   Route guard redirects to /login
      ↓
   LoginScreen displayed
```

---

## 🎯 Key Design Patterns Used

### 1. **Singleton Pattern** (DioClient, TokenStorage)
- Only ONE instance exists throughout app lifetime
- Share state and resources across entire app
```dart
factory TokenStorage() {
  return _instance;  // Always same instance
}
```

### 2. **State Notifier Pattern** (AuthNotifier via Riverpod)
- Immutable state objects
- Methods that trigger state transitions
- Observers listen to changes
```dart
class AuthNotifier extends StateNotifier<AuthState> {
  // state = current immutable state
  // state = newState (creates new instance)
}
```

### 3. **Interceptor Pattern** (DioClient)
- Intercept requests before sending
- Intercept responses before returning
- Intercept errors for handling
```dart
_dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) { ... },
  onError: (error, handler) { ... },
));
```

### 4. **Repository Pattern** (Services)
- AuthService abstracts backend API
- Single point of contact with server
- Easy to mock for testing

### 5. **Consumer Pattern** (Riverpod)
```dart
Consumer(builder: (context, ref, child) {
  ref.watch(provider);      // Listen to changes
  ref.read(provider);       // One-time read
  ref.read(provider.notifier);  // Access notifier
})
```

---

## 📊 Data Flow Example: Login

```
LoginScreen (UI)
    ↓
User enters email: "user@example.com", password: "password123"
    ↓
User taps "Sign In" button
    ↓
LoginScreen calls:
  ref.read(authProvider.notifier).login(
    email: "user@example.com",
    password: "password123"
  )
    ↓
AuthNotifier.login() executes:
  1. Set state: isLoading = true
  2. Call AuthService.login()
    ↓
  AuthService.login():
    a. Create UserLoginRequest {email, password}
    b. Convert to JSON: {"email": "...", "password": "..."}
    c. Call _dio.post("/api/v1/auth/login", data: {...})
    ↓
  DioClient.onRequest interceptor:
    - Get access_token (none yet, first login)
    - Add header: "Authorization: Bearer " (empty, but present)
    ↓
  Network: Send POST request
    ↓
  Backend validates credentials
    ↓
  Backend returns: {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
    ↓
  AuthService receives response:
    - Parse JSON to TokenResponse object
    - Return TokenResponse
    ↓
  AuthNotifier receives TokenResponse:
    3. Call TokenStorage.saveTokens(accessToken, refreshToken)
    ↓
  TokenStorage:
    - Encrypt access_token
    - Encrypt refresh_token
    - Store in iOS Keychain / Android Keystore
    ↓
  AuthNotifier continues:
    4. Call AuthService.getCurrentUser()
    ↓
  AuthService.getCurrentUser():
    - Call _dio.get("/api/v1/auth/me")
    ↓
  DioClient.onRequest interceptor:
    - Get access_token from TokenStorage (now exists)
    - Add header: "Authorization: Bearer eyJhbGc..."
    ↓
  Network: Send GET request with JWT
    ↓
  Backend validates JWT, returns user data:
    {
      "id": 1,
      "name": "John Farmer",
      "email": "user@example.com",
      "phone": "...",
      "role": "farmer",
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    }
    ↓
  AuthService parses to UserResponse object
    ↓
  AuthNotifier receives UserResponse:
    5. Update state:
       - isAuthenticated = true
       - user = UserResponse object
       - accessToken = tokenResponse.accessToken
       - isLoading = false
       - error = null
    ↓
  AuthNotifier state updated → notify all listeners
    ↓
  LoginScreen watches authProvider:
    - Detects isAuthenticated changed to true
    - Call ref.listen() callback
    ↓
  LoginScreen navigates:
    context.go('/main/home')
    ↓
  Route guard in AppRoutes:
    - Checks: isAuthenticated? YES
    - Checks: path == '/login'? YES
    - Allow transition to /main/home
    ↓
  HomeScreen renders with user data
    - Can access user info via authProvider
    - All subsequent requests inject JWT automatically
```

---

## 🚀 How a Protected API Call Works

```
User on HomeScreen taps "View History"
    ↓
HomeScreen calls:
  final response = await dioClient.get('/api/v1/soil-history')
    ↓
DioClient.onRequest interceptor:
  1. Get access_token from TokenStorage
  2. Add Authorization header: "Bearer eyJhbGc..."
  3. Pass to backend
    ↓
Backend validates JWT
  → If valid: return user's soil history
  → If expired/invalid: return 401 Unauthorized
    ↓
IF VALID (200 OK):
  ├─ Response returned to caller
  └─ HomeScreen receives data, displays it
    ↓
IF EXPIRED (401):
  DioClient.onError interceptor catches it:
  1. Check: _isRefreshing? NO → Start refresh
  2. Get refresh_token from TokenStorage
  3. Create clean Dio (no interceptors)
  4. Send: POST /api/v1/auth/refresh
         Body: {"refresh_token": "eyJhbGc..."}
    ↓
  Backend returns: {
    "access_token": "new_eyJhbGc...",
    "refresh_token": "new_eyJhbGc..."
  }
    ↓
  5. TokenStorage.saveTokens(new tokens)
  6. Notify queued requests: refresh complete
  7. Retry original request with new token
    ↓
  8. Original request now succeeds with new JWT
  9. Response returned to caller
```

---

## 📝 Summary: How Everything Works Together

| Layer | Component | Purpose |
|-------|-----------|---------|
| **UI** | Features (screens, widgets) | User interface & interactions |
| **State** | Providers (Riverpod) | Global app state management |
| **Logic** | Services (Auth, Dio) | Business logic & API calls |
| **Data** | Models & Storage | Data structures & persistence |

**The Flow**:
1. **User interacts** with UI (screen)
2. **Screen reads/watches** provider
3. **Provider notifier** executes business logic
4. **Service** calls backend API or accesses device storage
5. **Model** serializes/deserializes data
6. **Provider** updates state
7. **UI rebuilds** with new data

---

## 🔧 Configuration & Customization

### Change Backend URL
File: [lib/config/api_config.dart](lib/config/api_config.dart#L3)
```dart
static const String _macNetworkIp = '192.168.0.104';  // Change this
```

### Change Theme Colors
File: [lib/config/theme.dart](lib/config/theme.dart#L4)
```dart
static const Color primaryGreen = Color(0xFF2E7D32);  // Change to your color
```

### Add New Route
File: [lib/config/routes.dart](lib/config/routes.dart#L23)
```dart
GoRoute(
  path: '/new-path',
  builder: (context, state) => const NewScreen(),
),
```

### Add New Provider
File: `lib/providers/new_provider.dart`
```dart
final newProvider = StateNotifierProvider<NewNotifier, NewState>(
  (ref) => NewNotifier(),
);
```

---

## 🧪 Testing the Flow

### 1. Test Login
- App starts → SplashScreen
- No tokens → Navigate to /login
- Enter credentials → Call login()
- Success → Save tokens, navigate to /main/home

### 2. Test Token Refresh
- Make requests while logged in
- Artificially expire token (backend)
- Next request triggers 401
- DioClient auto-refreshes token
- Request retries and succeeds

### 3. Test Logout
- On profile screen, tap Logout
- State cleared, tokens deleted
- Redirect to /login
- Tokens gone from storage

---

This is the complete SPADE-AI architecture explained! Every piece connects logically to create a secure, maintainable mobile app.
