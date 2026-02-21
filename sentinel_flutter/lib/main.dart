import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'controllers/driver_monitoring_controller.dart';
import 'services/hardware_service.dart';
import 'pages/dashboard_page.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => DriverMonitoringController()),
        ChangeNotifierProvider(create: (_) => HardwareService()),
      ],
      child: const SentinelApp(),
    ),
  );
}

class SentinelApp extends StatelessWidget {
  const SentinelApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sentinel Drive Assist',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF00FF44),
        scaffoldBackgroundColor: const Color(0xFF030A05),
        textTheme: GoogleFonts.orbitronTextTheme(
          ThemeData.dark().textTheme,
        ),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00FF44),
          secondary: Color(0xFF00FF44),
          surface: Color(0xFF030A05),
        ),
      ),
      home: const DashboardPage(),
    );
  }
}
