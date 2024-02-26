import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Platform,
  SafeAreaView,
  StyleSheet,
  Image,
  ScrollView,
  TouchableHighlight,
  Linking,
  Animated,
} from 'react-native';
import Header from './component/Header';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import Lightbox from 'react-native-lightbox';
import { app, storage } from './firebase';

const Profile = ({ route }) => {
  const [userData, setUserData] = useState({});
  const [galleryImages, setGalleryImages] = useState([]);
  const [imageClicked, setImageClicked] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const db = getFirestore(app);
  const { itemId } = route.params;

  useEffect(() => {
    fetchData().catch(error => {
      console.error('Error in fetchData:', error);
      // Handle the error as needed
    });
  }, []);

  const fetchData = async () => {
    try {
      const userDocRef = doc(db, 'UserData', itemId);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setUserData(userData);

        const images = userData.galleryImages || [];
        const resolvedImages = await Promise.all(
          images.map(async (imageRef) => {
            try {
              const imageUrl = await getDownloadURL(ref(storage, `galleryImages/${imageRef}`));
              return imageUrl;
            } catch (imageError) {
              return null;
            }
          })
        );

        setGalleryImages(resolvedImages.filter(url => url !== null));
      } else {
        console.error('User data not found for itemId:', itemId);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
      console.error('Error code:', error.code);
      console.error('Server response:', error.serverResponse);
      console.error('Full error object:', error);
    }
  };

  const openGalleryImage = () => {
    setImageClicked(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const closeGalleryImage = () => {
    setImageClicked(false);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 0, // Set duration to 0 to reset immediately
      useNativeDriver: false,
    }).start();
  };

  const handleLinkPress = () => {
    const { link } = userData;

    if (link) {
      if (/^https?:\/\//i.test(link)) {
        Linking.openURL(link);
      } else {
        alert('Invalid link format. Please check the link and try again.');
      }
    } else {
      alert('Link not available.');
    }
  };

  const renderGalleryImages = () => {
    if (!userData || !userData.galleryImages) {
      return null;
    }

    return (
      <ScrollView horizontal contentContainerStyle={styles.galleryContainer} style={styles.horizontalScrollView}>
        {userData.galleryImages.map((image, index) => (
          <Lightbox
            key={`galleryImage_${index}`}
            onOpen={openGalleryImage}
            onClose={closeGalleryImage}
          >
            <Animated.Image
              source={{ uri: image }}
              style={[
                styles.galleryImage,
                imageClicked && styles.clickedImageStyle,
                { opacity: fadeAnim },
              ]}
              useNativeDriver={false}
              onLoad={() => {
                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: false,
                }).start();
              }}
            />
          </Lightbox>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Header />
        <ScrollView>
          <Image
            source={{ uri: userData.carImage }}
            style={styles.itemProfileImage}
          />

          <View style={styles.galleryContainer}>
            <Text style={styles.galleryTitle}>Gallery</Text>
            {renderGalleryImages()}
          </View>

          <Text style={styles.aboutCarTitle}>About Car:</Text>

          <View style={styles.carInfoContainer}>
            {['fual', 'year', 'variant', 'company_name', 'woner', 'insurence', 'loan', 'week', 'finel_offer', 'down_payment'].map((key) => (
              <Text key={key} style={{ padding: 10, fontSize: 15, fontWeight: '500' }}>
                {`${key.charAt(0).toUpperCase() + key.slice(1)}: ${userData[key]}`}
              </Text>
            ))}
          </View>

          {userData.link && (
            <TouchableHighlight
              onPress={handleLinkPress}
              underlayColor="transparent"
              style={styles.youtubeButton}
            >
              <Text style={styles.buttonText}>Youtube Video</Text>
            </TouchableHighlight>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  galleryContainer: {
    marginBottom: 50,
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  galleryImage: {
    width: 200,
    height: 150,
    marginRight: 8,
    borderRadius: 10,
  },
  clickedImageStyle: {
    width: 1000,
    height: 200,
  },
  aboutCarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  carInfoContainer: {
    padding: 10,
  },
  itemProfileImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
  horizontalScrollView: {
    flexDirection: 'row',
  },
  youtubeButton: {
    padding: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF0000',
    width: 130,
    height: 60,
    marginBottom: 100,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default Profile;
