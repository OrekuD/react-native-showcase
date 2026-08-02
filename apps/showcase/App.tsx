import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RootStackParamList } from './src/navigation/types';
import { ButtonScreen } from './src/screens/ButtonScreen';
import { ConfirmationDialogScreen } from './src/screens/ConfirmationDialogScreen';
import { CurrencyFormattingScreen } from './src/screens/CurrencyFormattingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { InputScreen } from './src/screens/InputScreen';
import { OtpInputScreen } from './src/screens/OtpInputScreen';
import { SwitchScreen } from './src/screens/SwitchScreen';
import { ConfirmationDialogHost } from './src/components/ui/ConfirmationDialog';

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
                <Stack.Screen name="Button" component={ButtonScreen} />
                <Stack.Screen name="Input" component={InputScreen} />
                <Stack.Screen name="OtpInput" component={OtpInputScreen} />
                <Stack.Screen
                  name="ConfirmationDialog"
                  component={ConfirmationDialogScreen}
                />
                <Stack.Screen name="Switch" component={SwitchScreen} />
                <Stack.Screen
                  name="CurrencyFormatting"
                  component={CurrencyFormattingScreen}
                />
              </Stack.Navigator>
            </NavigationContainer>
            <ConfirmationDialogHost />
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
