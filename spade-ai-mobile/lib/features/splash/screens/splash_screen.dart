import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../config/theme.dart';
import '../../../core/constants/strings.dart';
import '../../../providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToNextScreen();
  }

  Future<void> _navigateToNextScreen() async {
    // Check auth status on app start
    await ref.read(authProvider.notifier).checkAuthStatus();

    // Wait a bit to show splash screen
    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      final authState = ref.read(authProvider);
      if (authState.isAuthenticated) {
        context.go('/main/home');
      } else {
        context.go('/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryGreen,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // App Icon/Logo
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppTheme.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Icon(
                Icons.agriculture,
                size: 70,
                color: AppTheme.primaryGreen,
              ),
            ),
            const SizedBox(height: 32),
            // App Title
            Text(
              AppStrings.appTitle,
              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    color: AppTheme.white,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            // App Subtitle
            Text(
              AppStrings.appSubtitle,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppTheme.white.withOpacity(0.8),
              ),
            ),
            const SizedBox(height: 64),
            // Loading Indicator
            SizedBox(
              width: 40,
              height: 40,
              child: CircularProgressIndicator(
                valueColor: const AlwaysStoppedAnimation<Color>(
                  AppTheme.white,
                ),
                strokeWidth: 3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
