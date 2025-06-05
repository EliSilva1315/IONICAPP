import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonRange,
  IonLabel,
  IonItem,
  IonBadge,
  IonText,
  IonFooter
} from '@ionic/react';
import {
  chevronUp,
  chevronDown,
  chevronBack,
  chevronForward,
  stop,
  flash,
  speedometer,
  bluetooth
} from 'ionicons/icons';
import { useBluetooth } from '../context/BluetoothContext';
import { useHistory } from 'react-router';

const ControlPanel: React.FC = () => {
  const history = useHistory();
  const {
    isConnected,
    connectedDevice,
    batteryLevel,
    sendCommand,
    lastCommand,
    commandHistory
  } = useBluetooth();

  const [speed, setSpeed] = useState(50); // 0-100 speed value
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const [isStopped, setIsStopped] = useState(true);

  // Redirect to connect page if not connected
  useEffect(() => {
    if (!isConnected) {
      history.replace('/connect');
    }
  }, [isConnected, history]);

  // Handle direction button press
  const handleDirectionPress = (direction: string) => {
    setActiveDirection(direction);
    setIsStopped(false);

    // Format the command with the current speed
    const speedCommand = `S${speed}`; // S50 for 50% speed
    let directionCommand = '';

    switch (direction) {
      case 'forward':
        directionCommand = 'F';
        break;
      case 'backward':
        directionCommand = 'B';
        break;
      case 'left':
        directionCommand = 'L';
        break;
      case 'right':
        directionCommand = 'R';
        break;
      default:
        directionCommand = '';
    }

    sendCommand(`${speedCommand}${directionCommand}`);
  };

  // Handle stop button press
  const handleStop = () => {
    setActiveDirection(null);
    setIsStopped(true);
    sendCommand('X'); // X for stop command
  };

  // Handle emergency stop
  const handleEmergencyStop = () => {
    setActiveDirection(null);
    setIsStopped(true);
    sendCommand('E'); // E for emergency stop
  };

  // Handle speed change
  const handleSpeedChange = (value: number) => {
    setSpeed(value);
    
    // If a direction is active, update the speed in real-time
    if (activeDirection) {
      const speedCommand = `S${value}`;
      let directionCommand = '';

      switch (activeDirection) {
        case 'forward':
          directionCommand = 'F';
          break;
        case 'backward':
          directionCommand = 'B';
          break;
        case 'left':
          directionCommand = 'L';
          break;
        case 'right':
          directionCommand = 'R';
          break;
        default:
          directionCommand = '';
      }

      sendCommand(`${speedCommand}${directionCommand}`);
    }
  };

  // Get dynamic color based on speed
  const getSpeedColor = () => {
    if (speed < 30) return 'success';
    if (speed < 70) return 'warning';
    return 'danger';
  };

  // Format timestamp for command history
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <IonIcon icon={speedometer} style={{ marginRight: '8px' }} />
              ZUMOBOT Control
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="control-panel">
          {isConnected && (
            <>
              <div className="connection-status">
                <div className="status-indicator status-connected"></div>
                <IonText color="success">
                  Connected to {connectedDevice?.device.name || 'ZUMOBOT'}
                </IonText>
                <div className="battery-indicator" style={{ marginLeft: '16px' }}>
                  <IonIcon icon={flash} color={batteryLevel > 20 ? 'success' : 'danger'} />
                  <div className="battery-level">
                    <div 
                      className="battery-fill" 
                      style={{ 
                        width: `${batteryLevel}%`,
                        backgroundColor: batteryLevel > 20 ? 'var(--ion-color-success)' : 'var(--ion-color-danger)'
                      }}
                    ></div>
                  </div>
                  <IonText color="medium" style={{ marginLeft: '8px' }}>
                    {batteryLevel}%
                  </IonText>
                </div>
              </div>

              <IonItem lines="none" className="ion-margin-bottom">
                <IonLabel>Speed Control</IonLabel>
                <IonBadge color={getSpeedColor()} slot="end">{speed}%</IonBadge>
              </IonItem>

              <IonRange 
                className="speed-control"
                min={0} 
                max={100} 
                step={5} 
                value={speed}
                onIonChange={(e) => handleSpeedChange(e.detail.value as number)}
                color={getSpeedColor()}
              />

              <div className="control-grid">
                <IonButton 
                  className={`control-btn up-btn ${activeDirection === 'forward' ? 'active pulse' : ''}`}
                  onTouchStart={() => handleDirectionPress('forward')}
                  onTouchEnd={handleStop}
                  onMouseDown={() => handleDirectionPress('forward')}
                  onMouseUp={handleStop}
                >
                  <IonIcon icon={chevronUp} />
                </IonButton>

                <IonButton 
                  className={`control-btn left-btn ${activeDirection === 'left' ? 'active pulse' : ''}`}
                  onTouchStart={() => handleDirectionPress('left')}
                  onTouchEnd={handleStop}
                  onMouseDown={() => handleDirectionPress('left')}
                  onMouseUp={handleStop}
                >
                  <IonIcon icon={chevronBack} />
                </IonButton>

                <IonButton 
                  className="control-btn stop-btn"
                  onClick={handleStop}
                  color={isStopped ? 'medium' : 'danger'}
                >
                  <IonIcon icon={stop} />
                </IonButton>

                <IonButton 
                  className={`control-btn right-btn ${activeDirection === 'right' ? 'active pulse' : ''}`}
                  onTouchStart={() => handleDirectionPress('right')}
                  onTouchEnd={handleStop}
                  onMouseDown={() => handleDirectionPress('right')}
                  onMouseUp={handleStop}
                >
                  <IonIcon icon={chevronForward} />
                </IonButton>

                <IonButton 
                  className={`control-btn down-btn ${activeDirection === 'backward' ? 'active pulse' : ''}`}
                  onTouchStart={() => handleDirectionPress('backward')}
                  onTouchEnd={handleStop}
                  onMouseDown={() => handleDirectionPress('backward')}
                  onMouseUp={handleStop}
                >
                  <IonIcon icon={chevronDown} />
                </IonButton>
              </div>

              <IonButton 
                className="control-btn-emergency"
                expand="block"
                color="danger"
                onClick={handleEmergencyStop}
              >
                EMERGENCY STOP
              </IonButton>

              {commandHistory.length > 0 && (
                <div className="command-log">
                  <div className="ion-text-center ion-margin-bottom">
                    <IonText color="medium">Command History</IonText>
                  </div>
                  {commandHistory.map((entry, index) => (
                    <div key={index} className="log-entry">
                      <span className="log-timestamp">{formatTime(entry.timestamp)}</span>
                      <span>{entry.command}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!isConnected && (
            <div className="ion-text-center ion-padding">
              <IonIcon icon={bluetooth} color="medium" style={{ fontSize: '48px' }} />
              <p>Not connected to any device.</p>
              <IonButton onClick={() => history.replace('/connect')}>
                Connect to ZUMOBOT
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <div className="ion-text-center">
            <IonText color="medium">Last Command: {lastCommand || 'None'}</IonText>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default ControlPanel;