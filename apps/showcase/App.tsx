import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RootStackParamList } from './src/navigation/types';
import { ButtonScreen } from './src/screens/ButtonScreen';
import { CurrencyFormattingScreen } from './src/screens/CurrencyFormattingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { InputScreen } from './src/screens/InputScreen';
import { SwitchScreen } from './src/screens/SwitchScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <SafeAreaProvider>
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
              <Stack.Screen name="Switch" component={SwitchScreen} />
              <Stack.Screen
                name="CurrencyFormatting"
                component={CurrencyFormattingScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screen: {
    backgroundColor: '#F5F3EE',
  },
});
