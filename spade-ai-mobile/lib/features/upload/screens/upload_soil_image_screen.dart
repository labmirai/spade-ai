import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';
import 'dart:io';
import '../../../config/theme.dart';
import '../../../core/constants/strings.dart';
import '../../../core/widgets/custom_button.dart';
import '../widgets/image_picker_widget.dart';

class UploadSoilImageScreen extends StatefulWidget {
  const UploadSoilImageScreen({Key? key}) : super(key: key);

  @override
  State<UploadSoilImageScreen> createState() => _UploadSoilImageScreenState();
}

class _UploadSoilImageScreenState extends State<UploadSoilImageScreen> {
  File? _selectedImage;
  bool _isAnalyzing = false;
  final ImagePicker _imagePicker = ImagePicker();

  Future<void> _pickImage(ImageSource source) async {
    final pickedFile = await _imagePicker.pickImage(source: source);
    if (pickedFile != null) {
      setState(() => _selectedImage = File(pickedFile.path));
    }
  }

  Future<void> _analyzeImage() async {
    if (_selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an image first')),
      );
      return;
    }

    setState(() => _isAnalyzing = true);

    // Simulate API call
    await Future.delayed(const Duration(seconds: 3));

    setState(() => _isAnalyzing = false);

    if (mounted) {
      context.go('/main/recommendation', extra: {
        'soilData': {
          'soilType': 'Loamy Soil',
          'phLevel': 6.8,
          'nitrogen': 'Medium',
          'phosphorus': 'Low',
          'potassium': 'High',
          'organicMatter': '3.5%',
          'recommendations': [
            'Add phosphorus-rich fertilizer',
            'Increase irrigation frequency',
            'Consider crop rotation with legumes',
          ],
        },
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(AppStrings.uploadSoilImage),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Instructions
            Container(
              decoration: BoxDecoration(
                color: AppTheme.lightGreen.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.lightGreen),
              ),
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Icon(
                    Icons.info_outline,
                    color: AppTheme.primaryGreen,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Take a clear photo of your soil for accurate analysis',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.primaryGreen,
                          ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Image Preview or Placeholder
            if (_selectedImage != null)
              Column(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.file(
                      _selectedImage!,
                      height: 300,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextButton.icon(
                    onPressed: () => setState(() => _selectedImage = null),
                    icon: const Icon(Icons.close),
                    label: const Text('Remove Image'),
                  ),
                ],
              )
            else
              Container(
                height: 300,
                decoration: BoxDecoration(
                  color: AppTheme.lightGrey,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: AppTheme.primaryGreen.withOpacity(0.3),
                    width: 2,
                    style: BorderStyle.solid,
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.image_outlined,
                        size: 64,
                        color: AppTheme.mediumGrey,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No image selected',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 32),

            // Image Source Buttons
            Text(
              'Select Image Source',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ImagePickerWidget(
                    icon: Icons.camera_alt,
                    label: AppStrings.takePhoto,
                    onPressed: () => _pickImage(ImageSource.camera),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ImagePickerWidget(
                    icon: Icons.image,
                    label: AppStrings.chooseFromGallery,
                    onPressed: () => _pickImage(ImageSource.gallery),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // Analyze Button
            CustomButton(
              text: _isAnalyzing ? AppStrings.analyzing : AppStrings.uploadImage,
              isLoading: _isAnalyzing,
              onPressed: _selectedImage != null ? _analyzeImage : () {},
            ),
          ],
        ),
      ),
    );
  }
}
