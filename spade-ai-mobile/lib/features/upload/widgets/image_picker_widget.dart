import 'package:flutter/material.dart';
import '../../../config/theme.dart';

class ImagePickerWidget extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  const ImagePickerWidget({
    Key? key,
    required this.icon,
    required this.label,
    required this.onPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        side: const BorderSide(color: AppTheme.primaryGreen, width: 1.5),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            size: 32,
            color: AppTheme.primaryGreen,
          ),
          const SizedBox(height: 8),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppTheme.primaryGreen,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
