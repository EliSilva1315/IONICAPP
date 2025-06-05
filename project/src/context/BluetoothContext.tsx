import React, { createContext, useState, useContext, useEffect } from 'react';
import { BluetoothLe, ScanResult } from '@capacitor-community/bluetooth-le'; // ✅ Nombre correcto del paquet
import { Toast } from '@capacitor/toast';

interface BluetoothContextType {
  isInitialized: boolean;
  isScanning: boolean;
  isConnected: boolean;
  connectedDevice: ScanResult | null;
  discoveredDevices: ScanResult[];
  batteryLevel: number;
  lastCommand: string;
  commandHistory: Array<{ command: string; timestamp: Date }>;
  initializeBluetooth: () => Promise<void>;
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
  clearCommandHistory: () => void;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

// Service and characteristic UUIDs for ZUMOBOT
// These would need to be updated with the actual UUIDs for your robot
const ZUMO_SERVICE = '0000ffe0-0000-1000-8000-00805f9b34fb';
const ZUMO_CHARACTERISTIC = '0000ffe1-0000-1000-8000-00805f9b34fb';
const BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb';
const BATTERY_CHARACTERISTIC = '00002a19-0000-1000-8000-00805f9b34fb';

export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<ScanResult | null>(null);
  const [discoveredDevices, setDiscoveredDevices] = useState<ScanResult[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [lastCommand, setLastCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<Array<{ command: string; timestamp: Date }>>([]);

  // Initialize Bluetooth
  const initializeBluetooth = async () => {
    try {
      await BleClient.initialize();
      setIsInitialized(true);
      await Toast.show({ text: 'Bluetooth initialized' });
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      await Toast.show({ text: 'Error initializing Bluetooth' });
    }
  };

  // Start scanning for devices
  const startScan = async () => {
    if (!isInitialized) {
      await initializeBluetooth();
    }

    try {
      setDiscoveredDevices([]);
      setIsScanning(true);

      await BleClient.requestLEScan(
        {
          services: [ZUMO_SERVICE],
          namePrefix: 'ZUMO',
          allowDuplicates: false,
        },
        (result) => {
          setDiscoveredDevices((prevDevices) => {
            // Check if device already exists in the list
            const exists = prevDevices.some((device) => device.device.deviceId === result.device.deviceId);
            if (!exists) {
              return [...prevDevices, result];
            }
            return prevDevices;
          });
        }
      );

      // Auto-stop scan after 10 seconds
      setTimeout(async () => {
        if (isScanning) {
          await stopScan();
        }
      }, 10000);
    } catch (error) {
      console.error('Error scanning for devices:', error);
      await Toast.show({ text: 'Error scanning for devices' });
      setIsScanning(false);
    }
  };

  // Stop scanning for devices
  const stopScan = async () => {
    try {
      await BleClient.stopLEScan();
      setIsScanning(false);
    } catch (error) {
      console.error('Error stopping scan:', error);
    }
  };

  // Connect to a device
  const connectToDevice = async (deviceId: string) => {
    try {
      await BleClient.connect(deviceId, (deviceId) => {
        setIsConnected(false);
        setConnectedDevice(null);
        Toast.show({ text: 'Disconnected from device' });
      });

      // Find the device in the discovered list
      const device = discoveredDevices.find((d) => d.device.deviceId === deviceId) || null;
      setConnectedDevice(device);
      setIsConnected(true);
      
      // Read initial battery level if available
      try {
        const battery = await BleClient.read(deviceId, BATTERY_SERVICE, BATTERY_CHARACTERISTIC);
        setBatteryLevel(battery.getUint8(0));

        // Set up notifications for battery level changes
        await BleClient.startNotifications(
          deviceId,
          BATTERY_SERVICE,
          BATTERY_CHARACTERISTIC,
          (value) => {
            setBatteryLevel(value.getUint8(0));
          }
        );
      } catch (error) {
        console.log('Battery service not available on this device');
      }

      await Toast.show({ text: 'Connected to device' });
    } catch (error) {
      console.error('Error connecting to device:', error);
      await Toast.show({ text: 'Error connecting to device' });
    }
  };

  // Disconnect from device
  const disconnectDevice = async () => {
    if (connectedDevice && isConnected) {
      try {
        await BleClient.disconnect(connectedDevice.device.deviceId);
        setIsConnected(false);
        setConnectedDevice(null);
        await Toast.show({ text: 'Disconnected from device' });
      } catch (error) {
        console.error('Error disconnecting from device:', error);
        await Toast.show({ text: 'Error disconnecting from device' });
      }
    }
  };

  // Send command to connected device
  const sendCommand = async (command: string) => {
    if (connectedDevice && isConnected) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(command);
        
        await BleClient.write(
          connectedDevice.device.deviceId,
          ZUMO_SERVICE,
          ZUMO_CHARACTERISTIC,
          data
        );

        setLastCommand(command);
        addCommandToHistory(command);
        
        await Toast.show({ text: `Command sent: ${command}` });
      } catch (error) {
        console.error('Error sending command:', error);
        await Toast.show({ text: 'Error sending command' });
      }
    } else {
      await Toast.show({ text: 'Not connected to any device' });
    }
  };

  // Add command to history
  const addCommandToHistory = (command: string) => {
    setCommandHistory((prev) => [
      { command, timestamp: new Date() },
      ...prev.slice(0, 9), // Keep only the last 10 commands
    ]);
  };

  // Clear command history
  const clearCommandHistory = () => {
    setCommandHistory([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected && connectedDevice) {
        BleClient.disconnect(connectedDevice.device.deviceId).catch(console.error);
      }
    };
  }, [isConnected, connectedDevice]);

  const value = {
    isInitialized,
    isScanning,
    isConnected,
    connectedDevice,
    discoveredDevices,
    batteryLevel,
    lastCommand,
    commandHistory,
    initializeBluetooth,
    startScan,
    stopScan,
    connectToDevice,
    disconnectDevice,
    sendCommand,
    clearCommandHistory,
  };

  return <BluetoothContext.Provider value={value}>{children}</BluetoothContext.Provider>;
};

// Custom hook for using the Bluetooth context
export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (context === undefined) {
    throw new Error('useBluetooth must be used within a BluetoothProvider');
  }
  return context;
};