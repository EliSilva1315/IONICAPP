import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { 
  IonApp, 
  IonIcon, 
  IonLabel, 
  IonRouterOutlet, 
  IonTabBar, 
  IonTabButton, 
  IonTabs, 
  setupIonicReact 
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { bluetooth, gameController, settings } from 'ionicons/icons';

// Pages
import ControlPanel from './pages/ControlPanel';
import Connect from './pages/Connect';
import Settings from './pages/Settings';

// Global state provider
import { BluetoothProvider } from './context/BluetoothContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/custom.css';

setupIonicReact();

const App: React.FC = () => (
  <BluetoothProvider>
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/connect">
              <Connect />
            </Route>
            <Route exact path="/control">
              <ControlPanel />
            </Route>
            <Route exact path="/settings">
              <Settings />
            </Route>
            <Route exact path="/">
              <Redirect to="/connect" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="connect" href="/connect">
              <IonIcon aria-hidden="true" icon={bluetooth} />
              <IonLabel>Connect</IonLabel>
            </IonTabButton>
            <IonTabButton tab="control" href="/control">
              <IonIcon aria-hidden="true" icon={gameController} />
              <IonLabel>Control</IonLabel>
            </IonTabButton>
            <IonTabButton tab="settings" href="/settings">
              <IonIcon aria-hidden="true" icon={settings} />
              <IonLabel>Settings</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  </BluetoothProvider>
);

export default App;