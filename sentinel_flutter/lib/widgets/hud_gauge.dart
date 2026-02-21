import 'dart:math';
import 'package:flutter/material.dart';

class HudGauge extends StatelessWidget {
  final double value;
  final double max;
  final String label;
  final String unit;
  final GaugeColor color;
  final double size;

  const HudGauge({
    super.key,
    required this.value,
    this.max = 100,
    required this.label,
    this.unit = '%',
    this.color = GaugeColor.green,
    this.size = 160,
  });

  @override
  Widget build(BuildContext context) {
    final colorMap = {
      GaugeColor.green: const Color(0xFF00FF44), // hsl(136, 100%, 50%)
      GaugeColor.red: const Color(0xFFFF0044),   // hsl(346, 100%, 50%)
      GaugeColor.amber: const Color(0xFFFFB800), // hsl(45, 100%, 50%)
    };

    final strokeColor = colorMap[color]!;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: size,
          height: size,
          child: Stack(
            children: [
              Positioned.fill(
                child: CustomPaint(
                  painter: _GaugePainter(
                    percentage: (value / max).clamp(0.0, 1.0),
                    strokeColor: strokeColor,
                  ),
                ),
              ),
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    TweenAnimationBuilder<double>(
                      tween: Tween<double>(begin: 0, end: value),
                      duration: const Duration(milliseconds: 500),
                      builder: (context, val, child) {
                        return Text(
                          val.round().toString(),
                          style: TextStyle(
                            color: strokeColor,
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Orbitron',
                            shadows: [
                              Shadow(
                                color: strokeColor.withOpacity(0.5),
                                blurRadius: 10,
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    Text(
                      unit,
                      style: const TextStyle(
                        color: Colors.white54,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 10,
            letterSpacing: 1.5,
            fontWeight: FontWeight.w600,
            fontFamily: 'Orbitron',
          ),
        ),
      ],
    );
  }
}

enum GaugeColor { green, red, amber }

class _GaugePainter extends CustomPainter {
  final double percentage;
  final Color strokeColor;

  _GaugePainter({required this.percentage, required this.strokeColor});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - 12) / 2;
    const strokeWidth = 6.0;

    // Background circle
    final bgPaint = Paint()
      ..color = const Color(0xFF002208)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    canvas.drawCircle(center, radius, bgPaint);

    // Progress arc
    final progressPaint = Paint()
      ..color = strokeColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..maskFilter = MaskFilter.blur(BlurStyle.solid, 4);

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -pi / 2,
      2 * pi * percentage,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _GaugePainter oldDelegate) {
    return oldDelegate.percentage != percentage || oldDelegate.strokeColor != strokeColor;
  }
}
