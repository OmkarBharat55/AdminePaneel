import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from './screens/Login';
import Stock from './screens/Stock';
import Profile from './Profile';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
    
        <Stack.Screen
          name="Stock"
          component={Stock}
          options={{ headerShown: false }}
        />
                <Stack.Screen name="Profile" component={Profile}   options={{ headerShown: false }} />

        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
