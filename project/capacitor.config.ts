import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.zumobot',
  appName: 'ZUMOBOT',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: "Searching for ZUMOBOT...",
        cancel: "Cancel",
        availableDevices: "Available Robots",
        noDeviceFound: "No robots found"
      }
    }
  }
};

export default config;