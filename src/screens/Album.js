import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Animated,
  Image,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors, device, gStyle, images } from '../constants';

// components
import LinearGradient from '../components/LinearGradient';
import LineItemSong from '../components/LineItemSong';
import TouchIcon from '../components/TouchIcon';
import TouchText from '../components/TouchText';

// mock data
//import albums from '../mockdata/albums';

class Album extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      album: null,
      downloaded: false,
      scrollY: new Animated.Value(0),
      song: null,
      title: null
    };

    this.toggleDownloaded = this.toggleDownloaded.bind(this);
    this.changeSong = this.changeSong.bind(this);
    this.toggleBlur = this.toggleBlur.bind(this);
    this.performTrackSearch = this.performTrackSearch.bind(this);
    this.itemDownload = this.itemDownload.bind(this);
  }

  async componentDidMount() {
    const { navigation, screenProps } = this.props;

    const { currentSongData } = screenProps;
    // const albumTitle = navigation.getParam('title', 'ALBUM NOT FOUND?!');
    const albumTitle = navigation.getParam('title', 'Extraordinary Machine');
    const albumId = navigation.getParam('id', 'Extraordinary Machine');
    const lalbum = navigation.getParam('album', 'Extraordinary Machine');

    this.setState({
      //album: albums[albumTitle] || null,
      album: lalbum,
      song: currentSongData?currentSongData.title:"",
      title: albumTitle
    });
    console.log("lalbum", lalbum)

    await this.performTrackSearch(albumId, '')
  }

  async itemDownload(id,pdownload){
    console.log("itemDownload")
    this.props.screenProps.onDownload(this.state.trackSearchResults.releases[0].media[0].tracks.filter((item)=>item.id == id),pdownload);
  }

  async performTrackSearch(id, name) {

    console.log("performTrackSearch", id)

    const getMoviesFromApiAsync = async () => {
      try {
        //'+this.state.text+'
        let response = await fetch(
          'https://musicbrainz.org/ws/2/release/?release-group=' + id + '&inc=recordings&fmt=json', {
          headers: {
            'User-Agent': 'dejan app/1.0.0 (dejandjenic@gmail.com)'
          }
        }
        );
        let json = await response.json();
        //console.log("tracks",json)
        return json;
      } catch (error) {
        console.log(error);
      }
    };
    var trackSearchResults = await getMoviesFromApiAsync();
    this.setState({ trackSearchResults })

var fromcache=     trackSearchResults.releases[0].media[0].tracks.filter((item) =>
     this.props.screenProps.localCache.find((x) => x.data.id == item.id) != null
   );

   //console.log(this.state.trackSearchResults.releases[0].media[0].tracks.map((item)=>item.id));
   //console.log(this.props.screenProps.localCache);
   //console.log(fromcache);
  //  console.log(trackSearchResults.releases[0].media[0].tracks.filter((item)=>true).length)
  //  console.log(trackSearchResults.releases[0].media[0].tracks.lenght)
  //  console.log(fromcache.length)
    if (trackSearchResults.releases[0].media[0].tracks.filter((item)=>true).length ==
      fromcache.length
    ) {
      this.setState({ downloaded: true });
    }
  }

  toggleDownloaded(val) {
    // if web
    if (device.web) {
      this.setState({
        downloaded: val
      });

      return;
    }

    // remove downloads alert
    if (val === false) {
      Alert.alert(
        'Remove from Downloads?',
        "You won't be able to play this offline.",
        [
          { text: 'Cancel' },
          {
            onPress: () => {
              this.setState({
                downloaded: false
              });
            },
            text: 'Remove'
          }
        ],
        { cancelable: false }
      );
    } else {
      this.setState({
        downloaded: val
      });
      this.props.screenProps.onDownload(this.state.trackSearchResults.releases[0].media[0].tracks,true);
    }
  }

  changeSong(songData) {
    const {
      screenProps: { changeSong }
    } = this.props;

    changeSong(songData,
      this.state.trackSearchResults.releases[0].media[0].tracks
      .map((track)=>
        ({
          album: 'album.title',
          artist: 'album.artist',
          image: 'album.image',
          length: track.length / 1000,
          title: track.title,
          uri: track.id
        })
        )
      );

    this.setState({
      song: songData.title
    });
  }

  toggleBlur() {
    const {
      screenProps: { setToggleTabBar }
    } = this.props;

    setToggleTabBar();
  }

  render() {
    const {
      navigation,
      screenProps: { toggleTabBarState, setToggleTabBar }
    } = this.props;
    const { album, downloaded, scrollY, song, title } = this.state;

    // album data not set?
    if (album === null) {
      return (
        <View style={[gStyle.container, gStyle.flexCenter]}>
          <Text style={{ color: colors.white }}>{`Album: ${title}`}</Text>
        </View>
      );
    }

    const stickyArray = device.web ? [] : [0];
    const headingRange = device.web ? [140, 200] : [230, 280];
    const shuffleRange = device.web ? [40, 80] : [40, 80];

    const opacityHeading = scrollY.interpolate({
      inputRange: headingRange,
      outputRange: [0, 1],
      extrapolate: 'clamp'
    });

    const opacityShuffle = scrollY.interpolate({
      inputRange: shuffleRange,
      outputRange: [0, 1],
      extrapolate: 'clamp'
    });

    return (
      <View style={gStyle.container}>
        {toggleTabBarState ? (
          <BlurView
            intensity={99}
            style={{ ...StyleSheet.absoluteFill, zIndex: 101 }}
            tint="dark"
          />
        ) : null}

        <View style={styles.containerHeader}>
          <Animated.View
            style={[styles.headerLinear, { opacity: opacityHeading }]}
          >
            <LinearGradient fill={album.backgroundColor} height={89} />
          </Animated.View>
          <View style={styles.header}>
            <TouchIcon
              icon={<Feather color={colors.white} name="chevron-left" />}
              onPress={() => navigation.goBack(null)}
            />
            <Animated.View style={{ opacity: opacityShuffle }}>
              <Text style={styles.headerTitle}>{album.title}</Text>
            </Animated.View>
            <TouchIcon
              icon={<Feather color={colors.white} name="more-horizontal" />}
              onPress={() => {
                setToggleTabBar();

                navigation.navigate('ModalMoreOptions', {
                  album
                });
              }}
            />
          </View>
        </View>

        <View style={styles.containerFixed}>
          <View style={styles.containerLinear}>
            <LinearGradient fill={album.backgroundColor} />
          </View>
          <View style={styles.containerImage}>
            <Image source={images[album.image]} style={styles.image} />
          </View>
          <View style={styles.containerTitle}>
            <Text ellipsizeMode="tail" numberOfLines={1} style={styles.title}>
              {album.title}
            </Text>
          </View>
          <View style={styles.containerAlbum}>
            <Text style={styles.albumInfo}>
              {`Album by ${album.artist} · ${album['first-release-date']}`}
            </Text>
          </View>
        </View>

        <Animated.ScrollView
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={stickyArray}
          style={styles.containerScroll}
        >
          <View style={styles.containerSticky}>
            <Animated.View
              style={[
                styles.containerStickyLinear,
                { opacity: opacityShuffle }
              ]}
            >
              <LinearGradient fill={colors.black20} height={50} />
            </Animated.View>
            <View style={styles.containerShuffle}>
              <TouchText
                onPress={() => null}
                style={styles.btn}
                styleText={styles.btnText}
                text="Shuffle Play"
              />
            </View>
          </View>
          <View style={styles.containerSongs}>
            <View style={styles.row}>
              <Text style={styles.downloadText}>
                {downloaded ? 'Downloaded' : 'Download'}
              </Text>
              <Switch
                trackColor={colors.greySwitchBorder}
                onValueChange={val => this.toggleDownloaded(val)}
                value={downloaded}
              />
            </View>

            {this.state.trackSearchResults
              && this.state.trackSearchResults.releases &&
              this.state.trackSearchResults.releases[0].media[0].tracks.map((track, index) => (
                <LineItemSong
                  active={song === track.title}
                  downloaded={this.props.screenProps.localCache.find((x) => x.data.id == track.id) != null}
                  key={index.toString()}
                  onPress={this.changeSong}
                  onDownload = {this.itemDownload}
                  isfavorite={this.props.screenProps.favorites.find((x)=> x == track.id)!=null}
                  onfav={this.props.screenProps.onFavorite}
                  songData={{
                    album: album.title,
                    artist: album.artist,
                    image: 'album.image',
                    length: track.length / 1000,
                    title: track.title,
                    uri: track.id
                  }}
                />
              ))}
          </View>
          <View style={gStyle.spacer16} />
        </Animated.ScrollView>
      </View>
    );
  }
}

Album.propTypes = {
  // required
  navigation: PropTypes.object.isRequired,
  screenProps: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  containerHeader: {
    height: 89,
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 100
  },
  headerLinear: {
    height: 89,
    width: '100%'
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: device.iPhoneX ? 48 : 24,
    position: 'absolute',
    top: 0,
    width: '100%'
  },
  headerTitle: {
    ...gStyle.textSpotifyBold16,
    color: colors.white,
    paddingHorizontal: 8,
    marginTop: 2,
    textAlign: 'center',
    width: device.width - 100
  },
  containerFixed: {
    alignItems: 'center',
    paddingTop: device.iPhoneX ? 94 : 60,
    position: 'absolute',
    width: '100%'
  },
  containerLinear: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: device.web ? 5 : 0
  },
  containerImage: {
    shadowColor: colors.black,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    zIndex: device.web ? 20 : 0
  },
  image: {
    height: 148,
    marginBottom: device.web ? 0 : 16,
    width: 148
  },
  containerTitle: {
    marginTop: device.web ? 8 : 0,
    zIndex: device.web ? 20 : 0
  },
  title: {
    ...gStyle.textSpotifyBold20,
    color: colors.white,
    paddingHorizontal: 24,
    marginBottom: 8,
    textAlign: 'center'
  },
  containerAlbum: {
    zIndex: device.web ? 20 : 0
  },
  albumInfo: {
    ...gStyle.textSpotify12,
    color: colors.greyInactive,
    marginBottom: 48
  },
  containerScroll: {
    paddingTop: 89
  },
  containerSticky: {
    marginTop: device.iPhoneX ? 238 : 194
  },
  containerShuffle: {
    alignItems: 'center',
    height: 50,
    shadowColor: colors.blackBg,
    shadowOffset: { height: -10, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20
  },
  containerStickyLinear: {
    top: 0,
    position: 'absolute',
    width: '100%'
  },
  btn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: 25,
    height: 50,
    width: 220
  },
  btnText: {
    ...gStyle.textSpotifyBold16,
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  containerSongs: {
    alignItems: 'center',
    backgroundColor: colors.blackBg,
    minHeight: 540
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    width: '100%'
  },
  downloadText: {
    ...gStyle.textSpotifyBold18,
    color: colors.white
  }
});

export default Album;
