import React, { useEffect } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonButton, 
  IonIcon, 
  IonSpinner,
  IonRefresherContent,
  IonRefresher,
  IonItemDivider,
  IonText
} from '@ionic/react';
import { bluetooth, bluetoothOutline, checkmarkCircle, alertCircle } from 'ionicons/icons';
import { useBluetooth } from '../context/BluetoothContext';
import { useHistory } from 'react-router';

const Connect: React.FC = () => {
  const history = useHistory();
  const { 
    isInitialized,
    isScanning, 
    isConnected,
    connectedDevice,
    discoveredDevices, 
    initializeBluetooth,
    startScan, 
    stopScan, 
    connectToDevice,
    disconnectDevice
  } = useBluetooth();

  // Initialize Bluetooth when the component mounts
  useEffect(() => {
    if (!isInitialized) {
      initializeBluetooth();
    }
  }, [isInitialized, initializeBluetooth]);

  // Auto navigate to control page when connected
  useEffect(() => {
    if (isConnected && connectedDevice) {
      history.push('/control');
    }
  }, [isConnected, connectedDevice, history]);

  const handleRefresh = async (event: CustomEvent) => {
    if (isScanning) {
      await stopScan();
    }
    await startScan();
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <IonIcon icon={bluetooth} 
                style={{ marginRight: '8px', color: isConnected ? 'var(--ion-color-success)' : 'var(--ion-color-medium)' }} 
              />
              ZUMOBOT Connect
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <div className="ion-padding">
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`}></div>
            <IonText color={isConnected ? 'success' : 'medium'}>
              {isConnected ? 'Connected to ' + (connectedDevice?.device.name || 'Device') : 'Disconnected'}
            </IonText>
          </div>

          <IonButton 
            expand="block" 
            onClick={isScanning ? stopScan : startScan}
            disabled={isConnected}
          >
            {isScanning ? (
              <>
                <IonSpinner name="dots\" style={{ marginRight: '8px' }} />
                Stop Scanning
              </>
            ) : (
              <>
                <IonIcon icon={bluetoothOutline} slot="start" />
                Scan for Devices
              </>
            )}
          </IonButton>

          {isConnected && (
            <IonButton 
              expand="block" 
              color="danger" 
              onClick={disconnectDevice}
              style={{ marginTop: '8px' }}
            >
              Disconnect
            </IonButton>
          )}

          {isScanning && (
            <div className="ion-text-center ion-padding">
              <IonSpinner name="dots" />
              <p>Searching for ZUMOBOT devices...</p>
            </div>
          )}

          {discoveredDevices.length > 0 && (
            <div className="device-list">
              <IonItemDivider>Available Devices</IonItemDivider>
              <IonList>
                {discoveredDevices.map((device) => (
                  <IonItem 
                    key={device.device.deviceId}
                    className="device-item"
                    onClick={() => connectToDevice(device.device.deviceId)}
                    button
                    disabled={isConnected}
                  >
                    <IonIcon 
                      icon={isConnected && connectedDevice?.device.deviceId === device.device.deviceId ? 
                        checkmarkCircle : bluetoothOutline} 
                      slot="start"
                      color={isConnected && connectedDevice?.device.deviceId === device.device.deviceId ? 
                        'success' : 'primary'}
                    />
                    <IonLabel>
                      <h2>{device.device.name || 'Unknown Device'}</h2>
                      <p>Signal: {device.rssi} dBm</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </div>
          )}

          {!isScanning && discoveredDevices.length === 0 && (
            <div className="ion-text-center ion-padding">
              <IonIcon icon={alertCircle} color="medium" style={{ fontSize: '48px' }} />
              <p>No devices found. Make sure your ZUMOBOT is powered on and in range.</p>
            </div>
          )}
          
          <div className="ion-text-center ion-padding-top">
            <p className="ion-text-small ion-color-medium">
              Pull down to refresh the device list.
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Connect;