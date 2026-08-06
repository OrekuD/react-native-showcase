import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { PortalHost } from '@rn-primitives/portal';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RootStackParamList } from './src/navigation/types';
import { ActionSheetScreen } from './src/screens/ActionSheetScreen';
import { ButtonScreen } from './src/screens/ButtonScreen';
import { CircularProgressScreen } from './src/screens/CircularProgressScreen';
import { ConfirmationDialogScreen } from './src/screens/ConfirmationDialogScreen';
import { AnimatedCounterScreen } from './src/screens/AnimatedCounterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { InputScreen } from './src/screens/InputScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { OtpInputScreen } from './src/screens/OtpInputScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SelectScreen } from './src/screens/SelectScreen';
import { SwitchScreen } from './src/screens/SwitchScreen';
import { ToastScreen } from './src/screens/ToastScreen';
import { ConfirmationDialogHost } from './src/components/ui/confirmation-dialog/ConfirmationDialog';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <View style={styles.app}>
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={{
                  animation: 'slide_from_right',
                  contentStyle: styles.screen,
                  headerShown: false,
                }}
              >
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="ActionSheet" component={ActionSheetScreen} />
                <Stack.Screen name="Button" component={ButtonScreen} />
                <Stack.Screen name="Input" component={InputScreen} />
                <Stack.Screen name="OtpInput" component={OtpInputScreen} />
                <Stack.Screen
                  name="ConfirmationDialog"
                  component={ConfirmationDialogScreen}
                />
                <Stack.Screen name="Switch" component={SwitchScreen} />
                <Stack.Screen name="Toast" component={ToastScreen} />
                <Stack.Screen name="Progress" component={ProgressScreen} />
                <Stack.Screen
                  name="CircularProgress"
                  component={CircularProgressScreen}
                />
                <Stack.Screen name="Menu" component={MenuScreen} />
                <Stack.Screen name="Select" component={SelectScreen} />
                <Stack.Screen
                  name="AnimatedCounter"
                  component={AnimatedCounterScreen}
                />
              </Stack.Navigator>
            </NavigationContainer>
            <ConfirmationDialogHost />
            <PortalHost />
          </View>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  app: {
    flex: 1,
  },
  screen: {
    backgroundColor: '#F5F3EE',
  },
});
