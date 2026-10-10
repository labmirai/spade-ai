// import 'dart:io' show Platform;

class ApiConfig {
  // IMPORTANT: Update this to your Backend IP address on the network
  static const String _macNetworkIp = '192.168.0.104';
  
  // static const String _localhostUrl = 'http://127.0.0.1:8000';
  static const String _networkUrl = 'http://$_macNetworkIp:8000';

  static String get baseUrl {
    // if (Platform.isIOS) {
    //   return _networkUrl;
    // }
    return _networkUrl;
  }
}
