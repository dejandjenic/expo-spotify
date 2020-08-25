import React from 'react';
import { StatusBar } from 'react-native';
import { AppLoading } from 'expo';
import { func } from './src/constants';

// main navigation stack
import Stack from './src/navigation/Stack';


import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av'


export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSongData: {
        album: 'Swimming',
        artist: 'Mac Miller',
        image: 'swimming',
        length: 312,
        title: 'So It Goes',
        uri: "https://dejanmusic.blob.core.windows.net/music/tzWd3cVNSC4.mp3"
      },
      isLoading: true,
      toggleTabBar: false,
      playbackInstance: new Audio.Sound(),
      issoundloaded: false,
      isBuffering: false,
      ispaused: true,
      maxpos: 1000,
      currentPos: 0
    };

    this.changeSong = this.changeSong.bind(this);
    this.setToggleTabBar = this.setToggleTabBar.bind(this);
    this.onTogglePlay = this.onTogglePlay.bind(this);
    this.onSetPos = this.onSetPos.bind(this);
  }

  async componentDidMount() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: true
      })


    } catch (e) {
      console.log(e)
    }

    this.fullfile = FileSystem.documentDirectory + 'tzWd3cVNSC4.mp3';
  }

  componentWillUnmount() {
    if (this.state.playbackInstance && this.state.issoundloaded) {
      this.state.playbackInstance.stopAsync();
      this.state.playbackInstance.unloadAsync();
    }
  }


  async loadAudio() {
    console.log("load audio");
    if (this.state.isBuffering) {
      return;
    }
    try {
      if (this.state.playbackInstance && this.state.issoundloaded) {
        this.state.playbackInstance.stopAsync();
        this.state.playbackInstance.unloadAsync();
      }
      console.log(this.state.currentSongData)

      console.log(this.state.currentSongData.uri)
      const source = {
        uri: this.state.currentSongData.uri//audioBookPlaylist[currentIndex].uri
      }

      const status = {
        shouldPlay: false//,//isPlaying,
        //volume
      }

      this.state.playbackInstance.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate)
      await this.state.playbackInstance.loadAsync(this.state.currentSongData, status, false)
      //this.setState({playbackInstance})
      this.setState({ issoundloaded: true })
      console.log("sound loaded");
    } catch (e) {
      console.log(e)
    }
  }


  onSetPos = (pos) => {
    console.log("on set pos",pos,this.state.issoundloaded)

    if (this.state.playbackInstance && this.state.issoundloaded) {
      this.state.playbackInstance.setPositionAsync(pos * 1000);
    }
  }

  onTogglePlay = () => {
    console.log("onTogglePlay", this.state.ispaused)
    const ispaused = !this.state.ispaused;
    this.setState({ ispaused })

    if (this.state.playbackInstance && this.state.issoundloaded) {

      if (ispaused) {
        this.state.playbackInstance.pauseAsync();

      }
      else {
        this.state.playbackInstance.playAsync();
      }

    }
  }

  onPlaybackStatusUpdate = status => {
    this.setState({
      isBuffering: status.isBuffering,
      maxpos: status.durationMillis / 1000,
      currentPos: status.positionMillis / 1000
    })
    //console.log("status", status)

    if(status.didJustFinish)
    {
      this.setState({ ispaused:true })
    }
  }


  setToggleTabBar() {
    this.setState(({ toggleTabBar }) => ({
      toggleTabBar: !toggleTabBar
    }));
  }

  changeSong(data) {
    this.setState({
      currentSongData: data
    });

    this.loadAudio()
  }

  render() {
    const { currentSongData, isLoading, toggleTabBar } = this.state;

    if (isLoading) {
      return (
        <AppLoading
          onFinish={() => this.setState({ isLoading: false })}
          startAsync={func.loadAssetsAsync}
        />
      );
    }

    return (
      <React.Fragment>
        <StatusBar barStyle="light-content" />

        <Stack
          screenProps={{
            currentSongData,
            changeSong: this.changeSong,
            setToggleTabBar: this.setToggleTabBar,
            toggleTabBarState: toggleTabBar,
            onTogglePlay: this.onTogglePlay,
            paused: this.state.ispaused,
            currentPos: this.state.currentPos,
            maxPos : this.state.maxpos,
            onSetPos: this.onSetPos
          }}
        />
      </React.Fragment>
    );
  }
}
