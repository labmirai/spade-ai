class SoilAnalysisModel {
  final String id;
  final String userId;
  final String imagePath;
  final String soilType;
  final double phLevel;
  final String nitrogen;
  final String phosphorus;
  final String potassium;
  final String organicMatter;
  final double healthScore;
  final List<String> recommendations;
  final DateTime analyzedAt;

  SoilAnalysisModel({
    required this.id,
    required this.userId,
    required this.imagePath,
    required this.soilType,
    required this.phLevel,
    required this.nitrogen,
    required this.phosphorus,
    required this.potassium,
    required this.organicMatter,
    required this.healthScore,
    required this.recommendations,
    required this.analyzedAt,
  });

  factory SoilAnalysisModel.fromJson(Map<String, dynamic> json) {
    return SoilAnalysisModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      imagePath: json['imagePath'] ?? '',
      soilType: json['soilType'] ?? '',
      phLevel: (json['phLevel'] ?? 0).toDouble(),
      nitrogen: json['nitrogen'] ?? '',
      phosphorus: json['phosphorus'] ?? '',
      potassium: json['potassium'] ?? '',
      organicMatter: json['organicMatter'] ?? '',
      healthScore: (json['healthScore'] ?? 0).toDouble(),
      recommendations: List<String>.from(json['recommendations'] ?? []),
      analyzedAt: DateTime.parse(json['analyzedAt'] ?? DateTime.now().toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'imagePath': imagePath,
      'soilType': soilType,
      'phLevel': phLevel,
      'nitrogen': nitrogen,
      'phosphorus': phosphorus,
      'potassium': potassium,
      'organicMatter': organicMatter,
      'healthScore': healthScore,
      'recommendations': recommendations,
      'analyzedAt': analyzedAt.toIso8601String(),
    };
  }
}
