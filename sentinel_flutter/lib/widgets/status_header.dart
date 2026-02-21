import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/driver_monitoring_controller.dart';

class StatusHeader extends StatelessWidget {
  final String vehiclePlate;
  final DriverState state;
  final bool isOnline;
  final bool serialConnected;

  const StatusHeader({
    super.key,
    required this.vehiclePlate,
    required this.state,
    required this.isOnline,
    required this.serialConnected,
  });

  @override
  Widget build(BuildContext context) {
    final stateConfig = {
      DriverState.safe: _StateInfo('ALL SYSTEMS NOMINAL', const Color(0xFF00FF44), '●'),
      DriverState.yawn: _StateInfo('YAWN DETECTED', const Color(0xFFFFB800), '◐'),
      DriverState.caution: _StateInfo('DRIVER OUT OF FRAME', const Color(0xFFFFB800), '◑'),
      DriverState.warn: _StateInfo('DROWSINESS WARNING', const Color(0xFFFF0044), '▲'),
      DriverState.emergency: _StateInfo('EMERGENCY SOS', const Color(0xFFFF0044), '⚠'),
    };

    final info = stateConfig[state]!;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Left: Brand
          Row(
            children: [
              Text(
                'RESCU-EYE',
                style: GoogleFonts.orbitron(
                  color: const Color(0xFF00FF44),
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'PRO',
                style: GoogleFonts.orbitron(
                  color: Colors.white24,
                  fontSize: 10,
                  letterSpacing: 2,
                ),
              ),
            ],
          ),

          // Center: Vehicle
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white24),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              vehiclePlate.isEmpty ? '---' : vehiclePlate,
              style: GoogleFonts.firaCode(
                color: const Color(0xFF00FF44),
                fontSize: 14,
                letterSpacing: 1.5,
              ),
            ),
          ),

          // Right: Status
          Row(
            children: [
              _StatusIndicator(
                icon: info.icon,
                label: info.label,
                color: info.color,
                pulse: state == DriverState.warn || state == DriverState.emergency,
              ),
              const SizedBox(width: 16),
              const VerticalDivider(color: Colors.white10, width: 1, indent: 4, endIndent: 4),
              const SizedBox(width: 16),
              _DotStatus(label: 'NET', active: isOnline),
              const SizedBox(width: 8),
              _DotStatus(label: 'HW', active: serialConnected),
            ],
          ),
        ],
      ),
    );
  }
}

class _StateInfo {
  final String label;
  final Color color;
  final String icon;
  _StateInfo(this.label, this.color, this.icon);
}

class _StatusIndicator extends StatelessWidget {
  final String icon;
  final String label;
  final Color color;
  final bool pulse;

  const _StatusIndicator({required this.icon, required this.label, required this.color, this.pulse = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          icon,
          style: TextStyle(color: color, fontSize: 18),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: GoogleFonts.orbitron(
            color: color,
            fontSize: 10,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

class _DotStatus extends StatelessWidget {
  final String label;
  final bool active;

  const _DotStatus({required this.label, required this.active});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: active ? const Color(0xFF00FF44) : const Color(0xFFFF0044),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: GoogleFonts.firaCode(
            color: Colors.white54,
            fontSize: 8,
          ),
        ),
      ],
    );
  }
}
