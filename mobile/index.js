/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Background/quit-state push handler — must be registered at module scope.
// Notification messages are rendered by the OS automatically; this keeps the
// handler present so data-only messages aren't dropped.
setBackgroundMessageHandler(getMessaging(getApp()), async () => {});

AppRegistry.registerComponent(appName, () => App);
