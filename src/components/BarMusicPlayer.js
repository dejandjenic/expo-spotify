import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { FontAwesome } from '@expo/vector-icons';
import { colors, device, gStyle } from '../constants';


class BarMusicPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      favorited: false,
      paused: props.screenProps.paused
    };

    this.toggleFavorite = this.toggleFavorite.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
  }

  toggleFavorite() {
    this.setState(prev => ({
      favorited: !prev.favorited
    }));
if(this.props.song){
    this.props.screenProps.onFavorite(this.props.song.id,this.state.favorited,'song',this.props.song);
}
  }

  togglePlay() {
    console.log("togglePlay")
    this.setState(prev => ({
      paused: !prev.paused
    }));
this.props.screenProps.onTogglePlay();
    // if(this.state.paused){
    //   this.fullfile = this.props.song.uri
    //   this.loadAudio()
    // }
    // else{
    //   this.state.playbackInstance.stopAsync();
    // }
  }

  render() {


    

    const callback = downloadProgress => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      console.log(progress)
      this.setState({
        downloadProgress: progress,
      });
    };


    const createTwoButtonAlert = async () =>
    {
      console.log("2 btn")

      
      var file = await FileSystem.getInfoAsync(this.fullfile);//.then(tmp => {
        console.log(file);
      if(!file.exists){
        const downloadResumable = FileSystem.createDownloadResumable(
          'https://dejanmusic.blob.core.windows.net/music/tzWd3cVNSC4.mp3',
          this.fullfile,
          {},
          callback
        );
        
        try {
          const { uri } = await downloadResumable.downloadAsync();
          console.log('Finished downloading to ', uri);
        } catch (e) {
          console.error(e);
        } 


        

      
      }
      this.loadAudio()
      
      //console.log(tmp);
      //}      );
    };


    const { navigation, song } = this.props;
    const { paused2 } = this.state;
    let favorited=this.props.song!=null?
    this.props.screenProps.favorites.find((x)=> x.id == this.props.song.id)!=null
    :false;
    const paused=this.props.screenProps.paused;

    const favoriteColor = favorited ? colors.brandPrimary : colors.white;
    const favoriteIcon = favorited ? 'heart' : 'heart-o';
    const iconPlay = paused ? 'play-circle' : 'pause-circle';
    //console.log(song)

    let fbtn =  <TouchableOpacity
          activeOpacity={gStyle.activeOpacity}
          hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
          onPress={this.toggleFavorite}
          style={styles.containerIcon}
        >
          <FontAwesome color={favoriteColor} name={favoriteIcon} size={20} />
        </TouchableOpacity>


let pbtn=<TouchableOpacity
activeOpacity={gStyle.activeOpacity}
hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
onPress={this.togglePlay}
style={styles.containerIcon}
>
<FontAwesome color={colors.white} name={iconPlay} size={28} />
</TouchableOpacity>

        if(!song){
fbtn=null;
pbtn=null;
        }
    

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => navigation.navigate('ModalMusicPlayer')}
        style={styles.container}
      >
       {fbtn}
        {song && (
          <View>
            <View style={styles.containerSong}>
              <Text style={styles.title}>{`${song.title} · `}</Text>
              <Text style={styles.artist}>{song.artist}</Text>
            </View>
            <View style={[gStyle.flexRowCenter, gStyle.mTHalf]}>
              <FontAwesome
                color={colors.brandPrimary}
                name="bluetooth-b"
                size={14}
              />
              <Text style={styles.device}>Caleb&apos;s Beatsx</Text>
            </View>
          </View>
        )}
        {pbtn}
      </TouchableOpacity>
    );
  }
}

BarMusicPlayer.defaultProps = {
  song: null
};

BarMusicPlayer.propTypes = {
  // required
  navigation: PropTypes.object.isRequired,

  // optional
  song: PropTypes.shape({
    artist: PropTypes.string,
    title: PropTypes.string
  })
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: colors.grey,
    borderBottomColor: colors.blackBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    width: '100%'
  },
  containerIcon: {
    ...gStyle.flexCenter,
    width: 50
  },
  containerSong: {
    ...gStyle.flexRowCenter,
    overflow: 'hidden',
    width: device.width - 100
  },
  title: {
    ...gStyle.textSpotify12,
    color: colors.white
  },
  artist: {
    ...gStyle.textSpotify12,
    color: colors.greyLight
  },
  device: {
    ...gStyle.textSpotify10,
    color: colors.brandPrimary,
    marginLeft: 4,
    textTransform: 'uppercase'
  }
});

export default withNavigation(BarMusicPlayer);
