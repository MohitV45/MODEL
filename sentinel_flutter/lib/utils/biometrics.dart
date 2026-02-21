import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';

class Biometrics {
  // Landmarks indices for ML Kit Face Detection
  // Note: ML Kit provides specific landmarks (LeftEye, RightEye, etc.) 
  // rather than a full 468 mesh by default without extra setup.
  // We will use the available landmarks or the full mesh if available.

  static double distance(Point<double> p1, Point<double> p2) {
    return sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2));
  }

  static double calculateEAR(List<Offset> eyeLandmarks) {
    if (eyeLandmarks.length < 6) return 0.3;

    // Based on typical 6-point eye landmark configuration
    // P1, P4 are horizontal; P2, P3, P5, P6 are vertical
    double v1 = (Offset(eyeLandmarks[1].dx, eyeLandmarks[1].dy) - Offset(eyeLandmarks[5].dx, eyeLandmarks[5].dy)).distance;
    double v2 = (Offset(eyeLandmarks[2].dx, eyeLandmarks[2].dy) - Offset(eyeLandmarks[4].dx, eyeLandmarks[4].dy)).distance;
    double h = (Offset(eyeLandmarks[0].dx, eyeLandmarks[0].dy) - Offset(eyeLandmarks[3].dx, eyeLandmarks[3].dy)).distance;

    return (v1 + v2) / (2.0 * h);
  }

  static double calculateMAR(List<Offset> mouthLandmarks) {
    if (mouthLandmarks.length < 4) return 0.1;

    // Simple MAR: vertical distance / horizontal distance
    double v = (Offset(mouthLandmarks[1].dx, mouthLandmarks[1].dy) - Offset(mouthLandmarks[3].dx, mouthLandmarks[3].dy)).distance;
    double h = (Offset(mouthLandmarks[0].dx, mouthLandmarks[0].dy) - Offset(mouthLandmarks[2].dx, mouthLandmarks[2].dy)).distance;

    return v / h;
  }
}
