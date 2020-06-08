import { useFonts, Ubuntu_700Bold} from '@expo-google-fonts/ubuntu';
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import React from 'react';
import { AppLoading } from 'expo';
import { StatusBar,View } from 'react-native';




import Routes from './src/routes';

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Ubuntu_700Bold
  })

  if(!fontsLoaded) {
    return <AppLoading />
  }



  return (  
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent/>
      <Routes />
    </>
  );
}


