import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../config/theme.dart';
import '../../../core/constants/strings.dart';
import '../../../core/logger.dart';
import '../../../providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  static String _formatDate(DateTime dateTime) {
    return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
  }

  Future<void> _refreshUserData(WidgetRef ref) async {
    try {
      await ref.read(authProvider.notifier).fetchCurrentUser();
    } catch (e) {
      Logger.error('Failed to refresh user data: $e', tag: 'ProfileScreen');
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    // Auto-fetch user data if authenticated but user is null and not already loading
    if (authState.isAuthenticated && user == null && !authState.isLoading) {
      Future.microtask(() {
        ref.read(authProvider.notifier).fetchCurrentUser();
      });
    }

    // Calculate days since member joined
    String getMemberSince() {
      if (user?.createdAt == null) return 'Recently';
      final now = DateTime.now();
      final difference = now.difference(user!.createdAt);
      if (difference.inDays < 1) return 'Today';
      if (difference.inDays < 30) return '${difference.inDays}d';
      if (difference.inDays < 365) return '${(difference.inDays / 30).toStringAsFixed(0)}mo';
      return '${(difference.inDays / 365).toStringAsFixed(0)}y';
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text(AppStrings.myProfile),
      ),
      body: authState.isLoading
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : user == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.person_off_outlined,
                        size: 64,
                        color: AppTheme.mediumGrey,
                      ),
                      const SizedBox(height: 16),
                      const Text('No user data available'),
                      const SizedBox(height: 8),
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 24),
                        child: Text(
                          'Please check your connection or try logging in again',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: AppTheme.mediumGrey, fontSize: 14),
                        ),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => _refreshUserData(ref),
                                icon: const Icon(Icons.refresh),
                                label: const Text('Retry'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () {
                                  ref.read(authProvider.notifier).logout();
                                  context.go('/login');
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.error,
                                ),
                                child: const Text('Logout'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile Header
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Center(
                      child: Column(
                        children: [
                          Container(
                            width: 120,
                            height: 120,
                            decoration: BoxDecoration(
                              color: AppTheme.lightGrey,
                              borderRadius: BorderRadius.circular(60),
                              border: Border.all(
                                color: AppTheme.primaryGreen,
                                width: 3,
                              ),
                            ),
                            child: const Icon(
                              Icons.person,
                              size: 60,
                              color: AppTheme.primaryGreen,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            user.name,
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            user.email,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppTheme.mediumGrey,
                                ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.lightGreen,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              'Role: ${user.role.toUpperCase()}',
                              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                    color: AppTheme.primaryGreen,
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Profile Information
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Text(
                      'Personal Information',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _ProfileInfoItem(
                    icon: Icons.person_outline,
                    label: 'Full Name',
                    value: user.name,
                  ),
                  _ProfileInfoItem(
                    icon: Icons.email_outlined,
                    label: 'Email',
                    value: user.email,
                  ),
                  _ProfileInfoItem(
                    icon: Icons.phone_outlined,
                    label: 'Phone',
                    value: user.phone ?? 'Not provided',
                  ),
                  _ProfileInfoItem(
                    icon: Icons.badge_outlined,
                    label: 'User ID',
                    value: '#${user.id}',
                  ),
                  const SizedBox(height: 32),

                  // Account Status
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Text(
                      'Account Info',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _ProfileInfoItem(
                    icon: Icons.check_circle_outline,
                    label: 'Status',
                    value: user.isActive ? 'Active' : 'Inactive',
                  ),
                  _ProfileInfoItem(
                    icon: Icons.calendar_today_outlined,
                    label: 'Member Since',
                    value: getMemberSince(),
                  ),
                  _ProfileInfoItem(
                    icon: Icons.update_outlined,
                    label: 'Last Updated',
                    value: _formatDate(user.updatedAt),
                  ),
                  const SizedBox(height: 32),
                  
                  // Settings & Actions
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Settings & Actions',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 16),
                        _SettingItem(
                          icon: Icons.edit_outlined,
                          label: AppStrings.editProfile,
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Edit profile feature coming soon')),
                            );
                          },
                        ),
                        _SettingItem(
                          icon: Icons.settings_outlined,
                          label: AppStrings.settings,
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Settings feature coming soon')),
                            );
                          },
                        ),
                        _SettingItem(
                          icon: Icons.help_outline,
                          label: 'Help & Support',
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Help feature coming soon')),
                            );
                          },
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () async {
                              // Logout
                              await ref.read(authProvider.notifier).logout();
                              if (context.mounted) {
                                context.go('/login');
                              }
                            },
                            icon: const Icon(Icons.logout),
                            label: const Text(AppStrings.logout),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.error,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

class _ProfileInfoItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ProfileInfoItem({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.primaryGreen, size: 24),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.labelSmall,
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SettingItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _SettingItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.primaryGreen),
      title: Text(label),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
      contentPadding: EdgeInsets.zero,
    );
  }
}
