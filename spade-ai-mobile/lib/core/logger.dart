/// Centralized logging utility for the application
class Logger {
  static const String _prefix = '[SPADE-AI]';

  /// Log error messages
  static void error(String message, {String? tag}) {
    final label = tag != null ? '[$tag]' : '';
    print('$_prefix ❌ $label $message');
  }

  /// Log success messages
  static void success(String message, {String? tag}) {
    final label = tag != null ? '[$tag]' : '';
    print('$_prefix ✅ $label $message');
  }

  /// Log warning messages
  static void warning(String message, {String? tag}) {
    final label = tag != null ? '[$tag]' : '';
    print('$_prefix ⚠️ $label $message');
  }

  /// Log info messages
  static void info(String message, {String? tag}) {
    final label = tag != null ? '[$tag]' : '';
    print('$_prefix ℹ️ $label $message');
  }
}
