import {StyleSheet, Text, useColorScheme, View } from 'react-native';
import {Link} from 'expo-router'
import { Colors } from '@/constants/Colors';

export default function AboutScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme] ?? Colors.light
  return (
    <View style={[styles.container, {backgroundColor:theme.background}]} >
      <Text style={styles.title}>About Us</Text>
      <Text style={{
        marginTop:10, marginBottom:30
      }}>About Page details</Text>

      <Link href={'/'} >Back home</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },

});
