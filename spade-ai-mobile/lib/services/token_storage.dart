import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/logger.dart';

class TokenStorage {
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  
  static final TokenStorage _instance = TokenStorage._internal();
  
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  String? _cachedAccessToken;
  String? _cachedRefreshToken;

  factory TokenStorage() {
    return _instance;
  }

  TokenStorage._internal();

  /// Save tokens to secure storage
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    try {
      _cachedAccessToken = accessToken;
      _cachedRefreshToken = refreshToken;
      
      await Future.wait([
        _storage.write(key: _accessTokenKey, value: accessToken),
        _storage.write(key: _refreshTokenKey, value: refreshToken),
      ]);
      Logger.success('Tokens saved', tag: 'TokenStorage');
    } catch (e) {
      Logger.warning('Using memory cache only: $e', tag: 'TokenStorage');
    }
  }

  /// Get access token (tries secure storage first, falls back to memory)
  Future<String?> getAccessToken() async {
    try {
      final token = await _storage.read(key: _accessTokenKey);
      if (token != null) {
        _cachedAccessToken = token;
        return token;
      }
    } catch (e) {
      Logger.warning('Secure storage error: $e', tag: 'TokenStorage');
    }
    
    if (_cachedAccessToken != null) {
      return _cachedAccessToken;
    }
    
    return null;
  }

  /// Get refresh token (tries secure storage first, falls back to memory)
  Future<String?> getRefreshToken() async {
    try {
      final token = await _storage.read(key: _refreshTokenKey);
      if (token != null) {
        _cachedRefreshToken = token;
        return token;
      }
    } catch (e) {
      Logger.warning('Secure storage error: $e', tag: 'TokenStorage');
    }
    
    if (_cachedRefreshToken != null) {
      return _cachedRefreshToken;
    }
    
    return null;
  }

  /// Clear all tokens
  Future<void> clearTokens() async {
    _cachedAccessToken = null;
    _cachedRefreshToken = null;
    
    try {
      await Future.wait([
        _storage.delete(key: _accessTokenKey),
        _storage.delete(key: _refreshTokenKey),
      ]);
      Logger.success('Tokens cleared', tag: 'TokenStorage');
    } catch (e) {
      Logger.warning('Error clearing tokens: $e', tag: 'TokenStorage');
    }
  }

  /// Check if tokens exist
  Future<bool> hasTokens() async {
    try {
      final accessToken = await getAccessToken();
      return accessToken != null && accessToken.isNotEmpty;
    } catch (e) {
      return false;
    }
  }
}
