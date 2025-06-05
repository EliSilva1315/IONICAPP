import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonRange,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonItemDivider,
  IonAlert
} from '@ionic/react';
import { 
  settings, 
  trash, 
  helpCircle, 
  informationCircle,
  bluetooth
} from 'ionicons/icons';
import { useBluetooth } from '../context/BluetoothContext';

const Settings: React.FC = () => {
  const { isConnected, clearCommandHistory } = useBluetooth();
  
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  // Default settings - these would be saved in a real app
  const [controlSettings, setControlSettings] = useState({
    invertControls: false,
    sensitivityLevel: 50,
    controlMode: 'touch',
    autoStop: true,
    stopTimeout: 3000, // ms
    vibrationFeedback: true,
    keepScreenOn: true
  });

  const handleSettingChange = (setting: string, value: any) => {
    setControlSettings({
      ...controlSettings,
      [setting]: value
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <IonIcon icon={settings} style={{ marginRight: '8px' }} />
              Settings
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItemDivider>Control Settings</IonItemDivider>
          
          <IonItem>
            <IonLabel>Invert Controls</IonLabel>
            <IonToggle
              checked={controlSettings.invertControls}
              onIonChange={e => handleSettingChange('invertControls', e.detail.checked)}
            />
          </IonItem>
          
          <IonItem>
            <IonLabel>
              <h2>Control Sensitivity</h2>
              <p>Adjust the sensitivity of controls</p>
            </IonLabel>
          </IonItem>
          <IonItem lines="none">
            <IonRange
              min={0}
              max={100}
              step={5}
              value={controlSettings.sensitivityLevel}
              onIonChange={e => handleSettingChange('sensitivityLevel', e.detail.value)}
            />
          </IonItem>
          
          <IonItem>
            <IonLabel>Control Mode</IonLabel>
            <IonSelect
              value={controlSettings.controlMode}
              onIonChange={e => handleSettingChange('controlMode', e.detail.value)}
            >
              <IonSelectOption value="touch">Touch</IonSelectOption>
              <IonSelectOption value="hold">Hold</IonSelectOption>
              <IonSelectOption value="toggle">Toggle</IonSelectOption>
            </IonSelect>
          </IonItem>
          
          <IonItem>
            <IonLabel>Auto-Stop on Disconnect</IonLabel>
            <IonToggle
              checked={controlSettings.autoStop}
              onIonChange={e => handleSettingChange('autoStop', e.detail.checked)}
            />
          </IonItem>
          
          <IonItem>
            <IonLabel>
              <h2>Stop Timeout</h2>
              <p>Timeout before auto-stop (seconds)</p>
            </IonLabel>
          </IonItem>
          <IonItem lines="none">
            <IonRange
              min={1}
              max={10}
              step={1}
              value={controlSettings.stopTimeout / 1000}
              onIonChange={e => handleSettingChange('stopTimeout', (e.detail.value as number) * 1000)}
              disabled={!controlSettings.autoStop}
            />
          </IonItem>
          
          <IonItemDivider>Device Settings</IonItemDivider>
          
          <IonItem>
            <IonLabel>Vibration Feedback</IonLabel>
            <IonToggle
              checked={controlSettings.vibrationFeedback}
              onIonChange={e => handleSettingChange('vibrationFeedback', e.detail.checked)}
            />
          </IonItem>
          
          <IonItem>
            <IonLabel>Keep Screen On</IonLabel>
            <IonToggle
              checked={controlSettings.keepScreenOn}
              onIonChange={e => handleSettingChange('keepScreenOn', e.detail.checked)}
            />
          </IonItem>
          
          <IonItemDivider>App Data</IonItemDivider>
          
          <IonItem button onClick={() => setShowConfirmReset(true)}>
            <IonIcon icon={trash} slot="start" color="danger" />
            <IonLabel>Clear Command History</IonLabel>
          </IonItem>
          
          <IonItemDivider>About</IonItemDivider>
          
          <IonItem button onClick={() => setShowAbout(true)}>
            <IonIcon icon={informationCircle} slot="start" />
            <IonLabel>About ZUMOBOT Controller</IonLabel>
          </IonItem>
          
          <IonItem button>
            <IonIcon icon={helpCircle} slot="start" />
            <IonLabel>Help & Support</IonLabel>
          </IonItem>
          
          <IonItem>
            <IonLabel>Version</IonLabel>
            <IonLabel slot="end" color="medium">1.0.0</IonLabel>
          </IonItem>
        </IonList>
        
        {!isConnected && (
          <div className="ion-padding ion-text-center">
            <IonButton
              expand="block"
              routerLink="/connect"
              color="primary"
            >
              <IonIcon icon={bluetooth} slot="start" />
              Connect to ZUMOBOT
            </IonButton>
          </div>
        )}
        
        {/* Confirm Clear History Alert */}
        <IonAlert
          isOpen={showConfirmReset}
          onDidDismiss={() => setShowConfirmReset(false)}
          header="Clear Command History"
          message="Are you sure you want to clear your command history? This action cannot be undone."
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Clear',
              role: 'destructive',
              handler: () => {
                clearCommandHistory();
              }
            }
          ]}
        />
        
        {/* About Alert */}
        <IonAlert
          isOpen={showAbout}
          onDidDismiss={() => setShowAbout(false)}
          header="ZUMOBOT Controller"
          message="ZUMOBOT Controller is an application designed to control your ZUMOBOT robot via Bluetooth. This app provides intuitive controls for movement and speed adjustments. Version 1.0.0"
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Settings;