import {StyleSheet, Text, View } from 'react-native';
import {Link} from 'expo-router'

export default function AboutScreen() {
  return (
    <View style={styles.container} >
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
