import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../widgets/custom_bottom_navigation_bar.dart';

class MainNavigationScreen extends StatefulWidget {
  final Widget child;

  const MainNavigationScreen({
    Key? key,
    required this.child,
  }) : super(key: key);

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });

    // Navigate to the corresponding route
    switch (index) {
      case 0:
        context.go('/main/home');
        break;
      case 1:
        context.go('/main/upload');
        break;
      case 2:
        context.go('/main/recommendation');
        break;
      case 3:
        context.go('/main/profile');
        break;
    }
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  void didUpdateWidget(MainNavigationScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Update selected index based on current route
    final location = GoRouterState.of(context).uri.toString();
    if (location.contains('/home')) {
      _selectedIndex = 0;
    } else if (location.contains('/upload')) {
      _selectedIndex = 1;
    } else if (location.contains('/recommendation')) {
      _selectedIndex = 2;
    } else if (location.contains('/profile')) {
      _selectedIndex = 3;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: CustomBottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}
