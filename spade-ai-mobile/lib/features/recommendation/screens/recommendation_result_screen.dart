import 'package:flutter/material.dart';
import '../../../config/theme.dart';
import '../../../core/constants/strings.dart';
import '../../../core/widgets/custom_button.dart';

class RecommendationResultScreen extends StatelessWidget {
  final Map<String, dynamic> soilData;

  const RecommendationResultScreen({
    Key? key,
    required this.soilData,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final recommendations = soilData['recommendations'] as List<dynamic>? ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text(AppStrings.recommendations),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Soil Health Score Card
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.lightGreen,
                    AppTheme.accentGreen,
                  ],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppStrings.soilHealth,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.white,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Score: 8.2/10',
                        style: Theme.of(context).textTheme.displaySmall?.copyWith(
                              color: AppTheme.white,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      Icon(
                        Icons.check_circle,
                        size: 40,
                        color: AppTheme.white,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: 0.82,
                      minHeight: 6,
                      backgroundColor: AppTheme.white.withOpacity(0.3),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        AppTheme.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Soil Parameters
            Text(
              'Soil Analysis',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            _ParameterCard(
              label: 'Soil Type',
              value: soilData['soilType'] ?? 'N/A',
            ),
            const SizedBox(height: 12),
            _ParameterCard(
              label: 'pH Level',
              value: '${soilData['phLevel'] ?? 'N/A'}',
            ),
            const SizedBox(height: 12),
            _ParameterCard(
              label: 'Organic Matter',
              value: soilData['organicMatter'] ?? 'N/A',
            ),
            const SizedBox(height: 12),
            _ParameterCard(
              label: 'Nitrogen',
              value: soilData['nitrogen'] ?? 'N/A',
            ),
            const SizedBox(height: 12),
            _ParameterCard(
              label: 'Phosphorus',
              value: soilData['phosphorus'] ?? 'N/A',
            ),
            const SizedBox(height: 12),
            _ParameterCard(
              label: 'Potassium',
              value: soilData['potassium'] ?? 'N/A',
            ),
            const SizedBox(height: 32),

            // Recommendations
            Text(
              AppStrings.fertilizerRecommendation,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            ...recommendations.asMap().entries.map((entry) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _RecommendationItem(
                  number: entry.key + 1,
                  text: entry.value.toString(),
                ),
              );
            }).toList(),
            const SizedBox(height: 32),

            // Action Buttons
            CustomButton(
              text: AppStrings.saveResult,
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Result saved successfully')),
                );
              },
            ),
            const SizedBox(height: 12),
            CustomButton(
              text: AppStrings.share,
              isOutlined: true,
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Result shared')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _ParameterCard extends StatelessWidget {
  final String label;
  final String value;

  const _ParameterCard({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.lightGrey),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppTheme.primaryGreen,
                ),
          ),
        ],
      ),
    );
  }
}

class _RecommendationItem extends StatelessWidget {
  final int number;
  final String text;

  const _RecommendationItem({
    required this.number,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: AppTheme.primaryGreen,
            borderRadius: BorderRadius.circular(50),
          ),
          child: Center(
            child: Text(
              number.toString(),
              style: const TextStyle(
                color: AppTheme.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
      ],
    );
  }
}
