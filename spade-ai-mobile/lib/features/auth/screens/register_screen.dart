import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Registration'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Registration Coming Soon'),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                context.go('/login');
              },
              child: const Text('Back to Login'),
            ),
          ],
        ),
      ),
    );
  }
}
