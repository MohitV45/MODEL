import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/driver_monitoring_controller.dart';
import '../widgets/status_header.dart';
import '../widgets/hud_gauge.dart';
import '../widgets/camera_feed.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF030A05),
      body: Consumer<DriverMonitoringController>(
        builder: (context, controller, child) {
          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                children: [
                  StatusHeader(
                    vehiclePlate: "MH 12 AB 1234",
                    state: controller.state,
                    isOnline: true,
                    serialConnected: false,
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Left: Camera & Gauges
                        Expanded(
                          flex: 2,
                          child: Column(
                            children: [
                              const Expanded(
                                child: CameraFeed(),
                              ),
                              const SizedBox(height: 12),
                              // Gauges Row
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.05),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Colors.white10),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                                  children: [
                                    HudGauge(
                                      value: controller.metrics.fatigueScore,
                                      label: 'Fatigue Score',
                                      color: controller.metrics.fatigueScore > 70 
                                        ? GaugeColor.red 
                                        : controller.metrics.fatigueScore > 40 
                                          ? GaugeColor.amber 
                                          : GaugeColor.green,
                                    ),
                                    HudGauge(
                                      value: controller.metrics.eyeClosureProbability,
                                      label: 'Eye Closure Prob.',
                                      color: controller.metrics.eyeClosureProbability > 70 
                                        ? GaugeColor.red 
                                        : controller.metrics.eyeClosureProbability > 40 
                                          ? GaugeColor.amber 
                                          : GaugeColor.green,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Right: Metrics Panel
                        Expanded(child: _MetricsPanel(controller: controller)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _MetricsPanel extends StatelessWidget {
  final DriverMonitoringController controller;
  const _MetricsPanel({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _MetricBox(
          label: 'Biometric Readouts',
          children: [
            _InfoRow(label: 'EAR', value: controller.metrics.ear.toStringAsFixed(3)),
            _InfoRow(label: 'MAR', value: controller.metrics.mar.toStringAsFixed(3)),
            _InfoRow(label: 'Face', value: controller.metrics.faceDetected ? 'LOCKED' : 'LOST'),
          ],
        ),
        const SizedBox(height: 12),
        _MetricBox(
          label: 'Vehicle Profile',
          children: [
            _InfoRow(label: 'Plate', value: 'MH 12 AB 1234'),
            _InfoRow(label: 'Emergency', value: '+91 98765 43210'),
          ],
        ),
        const Spacer(),
        if (controller.state == DriverState.warn || controller.state == DriverState.emergency)
          ElevatedButton(
            onPressed: () => controller.resetState(),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              side: const BorderSide(color: Color(0xFF00FF44), width: 2),
              padding: const EdgeInsets.symmetric(vertical: 24),
              foregroundColor: const Color(0xFF00FF44),
            ),
            child: const Center(
              child: Text(
                '✓ RESET — I\'M AWAKE',
                style: TextStyle(fontFamily: 'Orbitron', fontWeight: FontWeight.bold),
              ),
            ),
          ),
      ],
    );
  }
}

class _MetricBox extends StatelessWidget {
  final String label;
  final List<Widget> children;
  const _MetricBox({required this.label, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: const TextStyle(color: Colors.white54, fontSize: 8, fontFamily: 'Orbitron', letterSpacing: 1)),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10, fontFamily: 'FiraCode')),
          Text(value, style: const TextStyle(color: Color(0xFF00FF44), fontSize: 10, fontFamily: 'FiraCode')),
        ],
      ),
    );
  }
}
