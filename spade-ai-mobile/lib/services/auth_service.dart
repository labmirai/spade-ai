import 'package:dio/dio.dart';
import '../core/logger.dart';
import '../models/auth_model.dart';

class AuthService {
  final Dio _dio;

  AuthService({required Dio dio})
      : _dio = dio;

  /// Login with email and password
  Future<TokenResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      final request = UserLoginRequest(
        email: email,
        password: password,
      );

      final response = await _dio.post(
        '/api/v1/auth/login',
        data: request.toJson(),
      );

      Logger.success('Login successful', tag: 'AuthService');
      return TokenResponse.fromJson(response.data);
    } on DioException catch (e) {
      Logger.error('Login failed: ${e.message}', tag: 'AuthService');
      _handleDioError(e);
      rethrow;
    } catch (e) {
      Logger.error('Unexpected error: $e', tag: 'AuthService');
      throw Exception('Login failed: $e');
    }
  }

  /// Refresh access token using refresh token
  Future<TokenResponse> refreshToken(String refreshToken) async {
    try {
      final request = RefreshTokenRequest(refreshToken: refreshToken);
      
      final response = await _dio.post(
        '/api/v1/auth/refresh',
        data: request.toJson(),
      );

      Logger.success('Token refresh successful', tag: 'AuthService');
      return TokenResponse.fromJson(response.data);
    } on DioException catch (e) {
      Logger.error('Token refresh failed: ${e.message}', tag: 'AuthService');
      _handleDioError(e);
      rethrow;
    } catch (e) {
      Logger.error('Unexpected error: $e', tag: 'AuthService');
      throw Exception('Token refresh failed: $e');
    }
  }

  /// Get current user info
  Future<UserResponse> getCurrentUser() async {
    try {
      final response = await _dio.get('/api/v1/auth/me');
      
      Logger.success('User fetched successfully', tag: 'AuthService');
      return UserResponse.fromJson(response.data);
    } on DioException catch (e) {
      Logger.error('Failed to fetch user: ${e.message}', tag: 'AuthService');
      _handleDioError(e);
      rethrow;
    } catch (e) {
      Logger.error('Unexpected error: $e', tag: 'AuthService');
      throw Exception('Failed to fetch user: $e');
    }
  }

  /// Handle Dio errors and provide user-friendly messages
  void _handleDioError(DioException error) {
    final statusCode = error.response?.statusCode;
    final errorData = error.response?.data;
    Logger.info('Error: Status=$statusCode, Data=$errorData', tag: 'AuthService');
  }
}
