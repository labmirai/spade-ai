import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/logger.dart';
import '../models/auth_model.dart';
import '../services/auth_service.dart';
import '../services/dio_client.dart';
import '../services/token_storage.dart';

/// Auth state model
class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? error;
  final UserResponse? user;
  final String? accessToken;

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.error,
    this.user,
    this.accessToken,
  });

  /// Copy with method for creating new instances
  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? error,
    UserResponse? user,
    String? accessToken,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      user: user ?? this.user,
      accessToken: accessToken ?? this.accessToken,
    );
  }
}

/// Auth Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final TokenStorage _tokenStorage;
  final DioClient _dioClient;

  AuthNotifier({
    AuthService? authService,
    TokenStorage? tokenStorage,
    DioClient? dioClient,
  })  : _dioClient = dioClient ?? DioClient(),
        _tokenStorage = tokenStorage ?? TokenStorage(),
        _authService = authService ?? AuthService(dio: (dioClient ?? DioClient()).dio),
        super(const AuthState());

  /// Login with email and password
  Future<void> login({
    required String email,
    required String password,
  }) async {
    try {
      state = state.copyWith(isLoading: true, error: null);

      final tokenResponse = await _authService.login(
        email: email,
        password: password,
      );

      // Save tokens
      await _tokenStorage.saveTokens(
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
      );

      // Try to fetch user info with retry logic
      UserResponse? user;
      try {
        user = await _authService.getCurrentUser();
      } catch (e) {
        Logger.warning('First attempt to fetch user failed: $e', tag: 'AuthNotifier');
        
        // Wait a bit and retry
        await Future.delayed(const Duration(milliseconds: 500));
        
        try {
          user = await _authService.getCurrentUser();
        } catch (retryError) {
          Logger.warning('Retry also failed: $retryError', tag: 'AuthNotifier');
        }
      }

      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessToken: tokenResponse.accessToken,
        user: user,
      );

      Logger.success('Login successful for $email', tag: 'AuthNotifier');
    } catch (e) {
      Logger.error('Login error: $e', tag: 'AuthNotifier');
      
      String errorMessage = 'Login failed';
      
      // Provide user-friendly error messages
      if (e.toString().contains('401')) {
        errorMessage = 'Invalid email or password';
      } else if (e.toString().contains('Connection refused')) {
        errorMessage = 'Could not connect to server';
      } else if (e.toString().contains('404')) {
        errorMessage = 'Server endpoint not found';
      }

      state = state.copyWith(
        isLoading: false,
        error: errorMessage,
      );
    }
  }

  /// Check if user is authenticated on app start
  Future<void> checkAuthStatus() async {
    try {
      final hasTokens = await _tokenStorage.hasTokens();
      
      if (!hasTokens) {
        state = const AuthState();
        return;
      }

      // Try to fetch current user to validate token
      try {
        final user = await _authService.getCurrentUser();
        final accessToken = await _tokenStorage.getAccessToken();

        state = state.copyWith(
          isAuthenticated: true,
          user: user,
          accessToken: accessToken,
        );

        Logger.success('User authenticated: ${user.email}', tag: 'AuthNotifier');
      } catch (e) {
        Logger.warning('Token validation failed, clearing tokens', tag: 'AuthNotifier');
        await _tokenStorage.clearTokens();
        state = const AuthState();
      }
    } catch (e) {
      Logger.error('Auth check error: $e', tag: 'AuthNotifier');
      state = const AuthState();
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      await _dioClient.logout();
      state = const AuthState();
      Logger.success('Logout successful', tag: 'AuthNotifier');
    } catch (e) {
      Logger.error('Logout error: $e', tag: 'AuthNotifier');
      state = const AuthState();
    }
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  /// Manually fetch current user data (for recovery/retry)
  Future<void> fetchCurrentUser() async {
    try {
      final user = await _authService.getCurrentUser();
      state = state.copyWith(user: user);
      Logger.success('User data updated: ${user.email}', tag: 'AuthNotifier');
    } catch (e) {
      Logger.error('Failed to fetch user data: $e', tag: 'AuthNotifier');
      state = state.copyWith(error: 'Failed to load user data: $e');
    }
  }
}

/// Riverpod provider for auth state
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
