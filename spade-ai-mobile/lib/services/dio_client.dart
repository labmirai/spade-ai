import 'dart:async';
import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../core/logger.dart';
import '../models/auth_model.dart';
import 'token_storage.dart';

class DioClient {
  static final DioClient _instance = DioClient._internal();
  late Dio _dio;
  final TokenStorage _tokenStorage = TokenStorage();
  bool _isRefreshing = false;
  List<Completer<void>> _refreshQueue = [];

  factory DioClient() {
    return _instance;
  }

  DioClient._internal() {
    _initializeDio();
  }

  void _initializeDio() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        contentType: 'application/json',
      ),
    );

    // Add request interceptor for JWT token injection
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          try {
            final token = await _tokenStorage.getAccessToken();
            if (token != null && token.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $token';
            }
          } catch (e) {
            Logger.warning('Error getting token: $e', tag: 'DioClient');
          }
          
          return handler.next(options);
        },
        onResponse: (response, handler) {
          return handler.next(response);
        },
        onError: (error, handler) async {
          // Handle 401 Unauthorized - try to refresh token
          if (error.response?.statusCode == 401) {
            return _handleTokenRefresh(error, handler);
          }
          
          return handler.next(error);
        },
      ),
    );
  }

  /// Handle token refresh on 401 response
  Future<dynamic> _handleTokenRefresh(
    DioException error,
    ErrorInterceptorHandler handler,
  ) async {
    try {
      // Prevent multiple refresh attempts
      if (_isRefreshing) {
        final completer = Completer<void>();
        _refreshQueue.add(completer);
        await completer.future;
        
        // Retry the failed request after token is refreshed
        return _retryRequest(error, handler);
      }

      _isRefreshing = true;

      final refreshToken = await _tokenStorage.getRefreshToken();
      if (refreshToken == null || refreshToken.isEmpty) {
        Logger.error('No refresh token found', tag: 'DioClient');
        _isRefreshing = false;
        return handler.next(error);
      }

      // Create a clean Dio instance without interceptors to avoid infinite loop
      final cleanDio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
      
      final refreshResponse = await cleanDio.post(
        '/api/v1/auth/refresh',
        data: {'refresh_token': refreshToken},
      );

      if (refreshResponse.statusCode == 200) {
        final tokenResponse = TokenResponse.fromJson(refreshResponse.data);
        
        // Save new tokens
        await _tokenStorage.saveTokens(
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
        );
        
        Logger.success('Token refreshed', tag: 'DioClient');
        _isRefreshing = false;

        // Notify all queued requests
        for (final completer in _refreshQueue) {
          if (!completer.isCompleted) {
            completer.complete();
          }
        }
        _refreshQueue.clear();

        // Retry the original request with new token
        return _retryRequest(error, handler);
      } else {
        Logger.error('Token refresh returned ${refreshResponse.statusCode}', tag: 'DioClient');
        _isRefreshing = false;
        return handler.next(error);
      }
    } catch (e) {
      Logger.error('Token refresh failed: $e', tag: 'DioClient');
      _isRefreshing = false;
      
      // Clear tokens on refresh failure
      await _tokenStorage.clearTokens();
      
      return handler.next(error);
    }
  }

  /// Retry the failed request with new token
  Future<dynamic> _retryRequest(
    DioException error,
    ErrorInterceptorHandler handler,
  ) async {
    try {
      final token = await _tokenStorage.getAccessToken();
      
      if (token == null || token.isEmpty) {
        Logger.error('No token available for retry', tag: 'DioClient');
        return handler.next(error);
      }
      
      final options = error.requestOptions;
      options.headers['Authorization'] = 'Bearer $token';
      
      final response = await _dio.request<dynamic>(
        options.path,
        data: options.data,
        queryParameters: options.queryParameters,
        options: Options(
          method: options.method,
          headers: options.headers,
          contentType: options.contentType,
          responseType: options.responseType,
        ),
      );

      return handler.resolve(response);
    } catch (e) {
      Logger.error('Retry failed: $e', tag: 'DioClient');
      return handler.next(error);
    }
  }

  /// Get Dio instance
  Dio get dio => _dio;

  /// Clear all tokens and reset state
  Future<void> logout() async {
    await _tokenStorage.clearTokens();
    Logger.success('Logged out', tag: 'DioClient');
  }
}
