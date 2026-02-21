import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:usb_serial/usb_serial.dart';

class HardwareService extends ChangeNotifier {
  bool _isConnected = false;
  String _lastReceived = '';
  UsbPort? _port;
  
  bool get isConnected => _isConnected;
  String get lastReceived => _lastReceived;

  Future<void> connect() async {
    List<UsbDevice> devices = await UsbSerial.listDevices();
    if (devices.isEmpty) return;

    _port = await devices.first.create();
    bool openResult = await _port!.open();
    if (!openResult) return;

    await _port!.setDTR(true);
    await _port!.setRTS(true);
    _port!.setPortParameters(115200, UsbPort.DATABITS_8, UsbPort.STOPBITS_1, UsbPort.PARITY_NONE);

    _isConnected = true;
    notifyListeners();

    _port!.inputStream!.listen((Uint8List event) {
      _lastReceived = String.fromCharCodes(event).trim();
      notifyListeners();
    });
  }

  Future<void> send(String data) async {
    if (_port != null && _isConnected) {
      await _port!.write(Uint8List.fromList(data.codeUnits));
    }
  }

  Future<void> disconnect() async {
    await _port?.close();
    _isConnected = false;
    _port = null;
    notifyListeners();
  }
}
