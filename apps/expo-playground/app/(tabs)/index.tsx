import {StyleSheet, Text, View, Image } from 'react-native';
import logo from '../../assets/images/react-logo.png';

export default function HomeScreen() {
  return (
    <View style={styles.container} >
      <Image source={logo}></Image>
      <Text style={styles.title}>The Number 1</Text>
      <Text style={{
        marginTop:10, marginBottom:30
      }}>Reading List App</Text>

      <View style={styles.card}>
        <Text>Hello, this is a  card</Text>

      </View>
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
  card:{
    backgroundColor: '#eee',
    padding:20,
    borderRadius:5,
    boxSizing: '4px 4px rgba(0,0,0,0.1',
  }
});
