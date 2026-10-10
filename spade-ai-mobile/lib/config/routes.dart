import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/logger.dart';
import '../features/splash/screens/splash_screen.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/home/screens/home_screen.dart';
import '../features/upload/screens/upload_soil_image_screen.dart';
import '../features/recommendation/screens/recommendation_result_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/navigation/screens/main_navigation_screen.dart';
import '../providers/auth_provider.dart';

class AppRoutes {
  // Route names
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/main/home';
  static const String uploadSoil = '/main/upload';
  static const String recommendation = '/main/recommendation';
  static const String profile = '/main/profile';

  static final GoRouter router = GoRouter(
    initialLocation: splash,
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.uri.toString()}'),
      ),
    ),
    redirect: (context, state) { // It runs EVERY time route changes.
      // Get the ProviderContainer from context
      final container = ProviderScope.containerOf(context);
      final authState = container.read(authProvider);
      final isAuthenticated = authState.isAuthenticated;
      final isLoading = authState.isLoading;

      // If loading, stay on current route
      if (isLoading) {
        return null;
      }

      // If on splash, let it handle routing
      if (state.uri.path == splash) {
        return null;
      }

      // If not authenticated
      if (!isAuthenticated) {
        // Allow login and register pages
        if (state.uri.path == login || state.uri.path == register) {
          return null;
        }
        // Redirect any other page to login
        if (state.uri.path != login) {
          Logger.info('Redirecting to login', tag: 'Routes');
          return login;
        }
        return null;
      }

      // If authenticated
      if (isAuthenticated) {
        // Redirect login/register to home
        if (state.uri.path == login || state.uri.path == register) {
          return home;
        }
        // Allow access to all other pages
        return null;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: splash,
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: register,
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) {
          return MainNavigationScreen(child: child);
        },
        routes: [
          GoRoute(
            path: home,
            name: 'homeTab',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: uploadSoil,
            name: 'uploadTab',
            builder: (context, state) => const UploadSoilImageScreen(),
          ),
          GoRoute(
            path: recommendation,
            name: 'recommendationTab',
            builder: (context, state) {
              final extra = state.extra as Map<String, dynamic>?;
              return RecommendationResultScreen(
                soilData: extra?['soilData'] ?? {},
              );
            },
          ),
          GoRoute(
            path: profile,
            name: 'profileTab',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
  );
}
