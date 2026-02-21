import 'dart:async';
import 'package:flutter/material.dart';
import '../utils/biometrics.dart';

enum DriverState { safe, warn, emergency, yawn, caution }

class DriverMetrics {
  final double ear;
  final double mar;
  final bool faceDetected;
  final double fatigueScore;
  final double eyeClosureProbability;

  DriverMetrics({
    this.ear = 0.3,
    this.mar = 0.1,
    this.faceDetected = false,
    this.fatigueScore = 0,
    this.eyeClosureProbability = 0,
  });

  DriverMetrics copyWith({
    double? ear,
    double? mar,
    bool? faceDetected,
    double? fatigueScore,
    double? eyeClosureProbability,
  }) {
    return DriverMetrics(
      ear: ear ?? this.ear,
      mar: mar ?? this.mar,
      faceDetected: faceDetected ?? this.faceDetected,
      fatigueScore: fatigueScore ?? this.fatigueScore,
      eyeClosureProbability: eyeClosureProbability ?? this.eyeClosureProbability,
    );
  }
}

class DriverMonitoringController extends ChangeNotifier {
  DriverState _state = DriverState.safe;
  DriverMetrics _metrics = DriverMetrics();
  
  DriverState get state => _state;
  DriverMetrics get metrics => _metrics;

  DateTime? _earBelowStart;
  DateTime? _warningStart;
  
  static const double earThreshold = 0.2;
  static const double marThreshold = 0.5;
  static const int warningDurationMs = 3000;
  static const int emergencyDurationMs = 10000;

  void resetState() {
    _state = DriverState.safe;
    _earBelowStart = null;
    _warningStart = null;
    _metrics = _metrics.copyWith(fatigueScore: 0, eyeClosureProbability: 0);
    notifyListeners();
  }

  void processLandmarks(List<Offset>? eyeLandmarks, List<Offset>? mouthLandmarks) {
    final now = DateTime.now();

    if (eyeLandmarks == null || eyeLandmarks.isEmpty) {
      _metrics = _metrics.copyWith(faceDetected: false);
      if (_state != DriverState.emergency && _state != DriverState.warn) {
        _state = DriverState.caution;
      }
      notifyListeners();
      return;
    }

    final ear = Biometrics.calculateEAR(eyeLandmarks);
    final mar = Biometrics.calculateMAR(mouthLandmarks ?? []);
    final eyeClosureProb = ((earThreshold - ear) / earThreshold).clamp(0.0, 1.0);

    double fatigueScore = _metrics.fatigueScore;

    if (ear < earThreshold) {
      _earBelowStart ??= now;
      final elapsed = now.difference(_earBelowStart!).inMilliseconds;
      fatigueScore = (elapsed / warningDurationMs * 60).clamp(0.0, 100.0);

      if (elapsed >= warningDurationMs && _state != DriverState.emergency) {
        _state = DriverState.warn;
        _warningStart ??= now;
      }
    } else {
      _earBelowStart = null;
      if (_state == DriverState.safe || _state == DriverState.yawn || _state == DriverState.caution) {
        fatigueScore = (fatigueScore - 2).clamp(0.0, 100.0);
      }
    }

    // Yawn check
    if (mar > marThreshold && _state == DriverState.safe) {
      _state = DriverState.yawn;
      fatigueScore = (fatigueScore + 5).clamp(0.0, 100.0);
    } else if (mar <= marThreshold && _state == DriverState.yawn) {
      _state = DriverState.safe;
    }

    // Emergency escalation
    if (_state == DriverState.warn && _warningStart != null) {
      final warningElapsed = now.difference(_warningStart!).inMilliseconds;
      fatigueScore = (60 + (warningElapsed / emergencyDurationMs * 40)).clamp(0.0, 100.0);
      if (warningElapsed >= emergencyDurationMs) {
        _state = DriverState.emergency;
        fatigueScore = 100;
        _warningStart = null;
      }
    }

    // Reset from caution
    if (ear >= earThreshold && mar <= marThreshold && _state == DriverState.caution) {
      _state = DriverState.safe;
    }

    _metrics = _metrics.copyWith(
      ear: double.parse(ear.toStringAsFixed(3)),
      mar: double.parse(mar.toStringAsFixed(3)),
      faceDetected: true,
      fatigueScore: fatigueScore.roundToDouble(),
      eyeClosureProbability: (eyeClosureProb * 100).roundToDouble(),
    );

    notifyListeners();
  }
}
