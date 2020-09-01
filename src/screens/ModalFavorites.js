import React from 'react';
import PropTypes from 'prop-types';
import { Animated, Image, Slider, StyleSheet, Text, View } from 'react-native';
import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { colors, device, func, gStyle, images } from '../constants';
import { withNavigation } from 'react-navigation';

// components
import ModalHeader from '../components/ModalHeader';
import TouchIcon from '../components/TouchIcon';
import LineItemFavorite from '../components/LineItemFavorite'

import {
  MenuContext,
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

import DialogInput from 'react-native-dialog-input';

class ModalFavorites extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      favorited: false,
      paused: this.props.screenProps.paused,
      scrollY: new Animated.Value(0),
      id: '',
      isDialogVisible: false
    };

    this.toggleFavorite = this.toggleFavorite.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.onSlidingComplete = this.onSlidingComplete.bind(this);

    this.showDialog = this.showDialog.bind(this);
    this.sendInput = this.sendInput.bind(this);
    this.uuidv4= this.uuidv4.bind(this);
  }

  async componentDidMount() {
    const lalbum = this.props.navigation.getParam('album', '');
    const type = this.props.navigation.getParam('type', 'Artist');
    const id = this.props.navigation.getParam('id', '');

    this.setState({
      //album: albums[albumTitle] || null,
      album: lalbum,
      type: type,
      id: id
    });
    console.log("lalbum", lalbum, type, "x" + id + "x", this.props.screenProps.favorites);
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  showDialog(e) {
    this.setState({ isDialogVisible: e })
  }

  sendInput(e) {
    console.log("send input", e);
    this.props.screenProps.onFavorite(this.uuidv4(),true,"Playlist",{title:e,data:[]})
    this.showDialog(false);
  }

  onSlidingComplete(e) {
    this.props.screenProps.onSetPos(e);
  }

  toggleFavorite() {
    this.setState(prev => ({
      favorited: !prev.favorited
    }));

    //this.props.screenProps.onFavorite(this.props.screenProps.currentSongData.id,this.state.favorited,'album');
  }

  togglePlay() {
    this.setState(prev => ({
      paused: !prev.paused
    }));
    this.props.screenProps.onTogglePlay();
  }

  render() {
    const { navigation, screenProps } = this.props;
    const { currentSongData } = screenProps;
    const { paused, scrollY } = this.state;

    const stickyArray = device.web || this.state.type == 'Artist' || true ? [] : [0];
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

    const screenData = this.props.screenProps.favorites
      .filter(x =>//(x.type==this.state.type && this.state.id=="") 
        //|| 
        (this.state.type == "album" && x.type == "album" && ((this.state.id == "") || (this.state.id != "" && this.state.id == x.data.artist)))
        || (this.state.type == "song" && x.type == "song" && ((this.state.id == "") || (this.state.id != "" && this.state.id == x.data.album.title)))
        || (this.state.type == "Artist" && x.type == "Artist")
        || (this.state.type == "Playlist" && x.type == "Playlist")
      );

    let head = null;
    if (this.state.type != "Artist" && false) {
      head = <View style={gStyle.p3}>
        <Image
      /*source={images[currentSongData.image]}*/ style={styles.image} />


      </View>
    }

    //let favorited=this.props.screenProps.favorites.find((x)=> x.id == currentSongData.id)!=null;

    // const favoriteColor = favorited ? colors.brandPrimary : colors.white;
    // const favoriteIcon = favorited ? 'heart' : 'heart-o';
    // const iconPlay = paused ? 'play-circle' : 'pause-circle';

    //console.log(screenProps)
    let title = this.state.type;
    switch (this.state.type) {
      case "album":
        title = "Albums " + this.state.id;
        break;
      case "song":
        title = "Songs " + this.state.id;
        break;
    }
    return (

      <View style={gStyle.container}>

        <DialogInput isDialogVisible={this.state.isDialogVisible}
          title={"Title"}
          message={"Enter playlist title"}
          hintInput={"red hot chili pepers"}
          submitInput={(inputText) => { this.sendInput(inputText) }}
          closeDialog={() => { this.showDialog(false) }}>
        </DialogInput>


        {/* <View style={{ position: 'absolute', top: 0, width: '100%', zIndex: 10 }}>
          <ScreenHeader title="You Library" />
        </View> */}
        <ModalHeader
          left={<Feather color={colors.greyLight} name="chevron-down" />}
          leftPress={() => navigation.goBack(null)}
          right={this.state.type == "Playlist" ? <Menu>
            <MenuTrigger>
              <Feather color={colors.greyInactive} name="more-vertical" size={24} />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={() => this.showDialog(true)} text='New' />
              <MenuOption onSelect={() => alert(`Save`)} text='Save' />
              <MenuOption onSelect={() => alert(`Delete`)} >
                <Text style={{ color: 'red' }}>Delete</Text>
              </MenuOption>
              <MenuOption onSelect={() => alert(`Not called`)} disabled={true} text='Disabled' />
              <MenuOption>
                <FontAwesome color={colors.brandPrimary} name='heart' size={20} />
              </MenuOption>
            </MenuOptions>
          </Menu> : null}
          text={title}
        />


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

          {head}

          {screenData
            .map((item) =>
              <LineItemFavorite
                type={this.state.type}
                onfav={this.props.screenProps.onFavorite}
                key={item.id}
                albumData={{ title: item.data.title, id: item.id, x: item }}
                albumId={item.data.id}
                isfavorite={true}
                count={this.state.type=="Playlist"?"("+item.data.data.length+")":null}
                onPress={() => {
                  //console.log("type",this.state.type,item.data.title);
                  //return;
                  if (this.state.type == "Artist") {
                    console.log("navigate to artist");
                    navigation.push('ModalFavorites', { type: "album", id: item.data.title })
                  }
                  else if (this.state.type == "Playlist") {
                    
                    let ff = item.data.data
                    .map(x => {return {...x,id:x.uri,data:x}})
                    console.log("onPress", item,ff, this.state.type);
                    
                    navigation.navigate('Album', {
                      title: 'item.title',
                      id: item.id,
                      artist:item.artist,
                      album: this.state.type == "album" ? item.data : { title: "Favorites "+item.data.title, artist: 'playlist' },
                      loadFromUri: false,
                      results: ff,
                      songtoplay: ""
                    })
                  }
                  else {
                    var filtered = this.props.screenProps.favorites
                      .filter(x =>
                        (this.state.type == "song" && x.type == "song" && (this.state.id == "" || (this.state.id != "" && x.data.artist == this.state.id)))
                        || (this.state.type == "album" && x.type == "song" && x.data.album == item.data.title)
                      );
                    console.log("onPress", item, filtered, this.state.type);

                    navigation.navigate('Album', {
                      title: 'item.title',
                      id: item.id,
                      album: this.state.type == "album" ? item.data : { title: "Favorites", artist: "" },
                      loadFromUri: false,
                      results: filtered
                        .map(x => x),
                      songtoplay: (this.state.type == "song" ? item.id : "")
                    })
                  }
                }}
              >
              </LineItemFavorite>
            )}

        </Animated.ScrollView>

      </View>
    );
  }
}

ModalFavorites.propTypes = {
  // required
  navigation: PropTypes.object.isRequired,
  screenProps: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  image: {
    height: device.width - 48,
    marginVertical: device.iPhoneX ? 36 : 8,
    width: device.width - 48
  },
  containerDetails: {
    marginBottom: 16
  },
  containerSong: {
    flex: 6
  },
  song: {
    ...gStyle.textSpotifyBold24,
    color: colors.white
  },
  artist: {
    ...gStyle.textSpotify18,
    color: colors.greyInactive
  },
  containerFavorite: {
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'center'
  },
  containerTime: {
    ...gStyle.flexRowSpace
  },
  time: {
    ...gStyle.textSpotify10,
    color: colors.greyInactive
  },
  containerControls: {
    ...gStyle.flexRowSpace,
    marginTop: device.iPhoneX ? 24 : 8
  },
  containerBottom: {
    ...gStyle.flexRowSpace,
    marginTop: device.iPhoneX ? 32 : 8
  }, containerSongs: {
    alignItems: 'center',
    backgroundColor: colors.blackBg,
    minHeight: 540
  },
  containerScroll: {
    paddingTop: 89
  },
  containerSticky: {
    marginTop: device.iPhoneX ? 238 : 194
  }
});

export default withNavigation(ModalFavorites);
