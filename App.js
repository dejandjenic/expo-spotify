import React from 'react';
import { ActivityIndicator, StatusBar } from 'react-native';
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
       currentSongData: 
       //{
      //   album: 'Swimming',
      //   artist: 'Mac Miller',
      //   image: 'swimming',
      //   length: 312,
      //   title: 'So It Goes',
      //   uri: "https://dejanmusic.blob.core.windows.net/music/tzWd3cVNSC4.mp3",
      //   id:"12"
      // }
      null,
      isLoading: true,
      toggleTabBar: false,
      playbackInstance: new Audio.Sound(),
      issoundloaded: false,
      isBuffering: false,
      ispaused: true,
      maxpos: 1000,
      currentPos: 0,
      isSongLoading: false,
      localCache: [],
      favorites: [],
      shuffle:true
    };

    this.changeSong = this.changeSong.bind(this);
    this.setToggleTabBar = this.setToggleTabBar.bind(this);
    this.onTogglePlay = this.onTogglePlay.bind(this);
    this.onSetPos = this.onSetPos.bind(this);
    this.findurl = this.findurl.bind(this);
    this.onDownload = this.onDownload.bind(this);
    this.onFavorite = this.onFavorite.bind(this);
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

      var lcsPath = FileSystem.documentDirectory + "localCache.json";

      var fi = await FileSystem.getInfoAsync(lcsPath);
      if (!fi.exists) {
        await FileSystem.writeAsStringAsync(lcsPath, "[]");
      }

      var lcs = await FileSystem.readAsStringAsync(lcsPath);
      var localCache = JSON.parse(lcs)


      var fPath = FileSystem.documentDirectory + "favorites.json";

      var fif = await FileSystem.getInfoAsync(fPath);
      if (!fif.exists) {
        await FileSystem.writeAsStringAsync(fPath, "[]");
      }

      var f = await FileSystem.readAsStringAsync(fPath);
      var favorites = JSON.parse(f)


      this.setState({ localCache, favorites })

    } catch (e) {
      console.log(e)
    }

    console.log("componentDidMount", this.state.localCache.length)

    this.fullfile = FileSystem.documentDirectory + 'tzWd3cVNSC4.mp3';
  }


  async onFavorite(id, add) {
    console.log("onFavorite", id, add)
    
    let { favorites } = this.state;
    console.log("onFavorite", favorites)

    if(add){
      favorites.push(id);
      await this.setState({ favorites }) 
    }
    else {
      if (favorites.find((x) => x == id) != null) {
        favorites = favorites.filter((x) => x != id);
      }
    }
    console.log("onFavorite", favorites)
this.setState({favorites})
    var fPath = FileSystem.documentDirectory + "favorites.json";

    await FileSystem.writeAsStringAsync(fPath, JSON.stringify(favorites));

  }

  async onDownload(data, download) {


    const callback = downloadProgress => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      console.log(progress)
      this.setState({
        downloadProgress: progress,
      }); 
    };

    var localCache = this.state.localCache;
    this.setState({ isSongLoading: true });
    console.log("ondownload",data);

    for (let item of data) {
      //console.log(item)
      if (download) {
        if (localCache.find((x) => x.data.id == item.id) == null) {

          var uri = await this.findurl(item.id, item.title);
          if (url != null) {

            var localfile = FileSystem.documentDirectory + item.id + ".mp3";

            const downloadResumable = FileSystem.createDownloadResumable(
              uri,
              localfile,
              {},
              callback
            );

            try {
              const { uri } = await downloadResumable.downloadAsync();
              console.log('Finished downloading to ', uri);
            } catch (e) {
              console.error(e);
            }



            localCache.push({ data: item, uri: uri, path: localfile })
          }
        }
      }
      else {
        if (localCache.find((x) => x.data.id == item.id) != null) {
          localCache = localCache.filter((x) => x.data.id != item.id);
        }

      }
    }

    this.setState({ isSongLoading: false, localCache: localCache });
    var lcsPath = FileSystem.documentDirectory + "localCache.json";

    await FileSystem.writeAsStringAsync(lcsPath, JSON.stringify(localCache));
    //console.log(this.state.localCache);
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
        shouldPlay: true//,//isPlaying,
        //volume
      }

      this.state.playbackInstance.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate)
      await this.state.playbackInstance.loadAsync(this.state.currentSongData, status, false)
      //this.setState({playbackInstance})
      this.setState({ issoundloaded: true,ispaused:false })
      console.log("sound loaded");
    } catch (e) {
      console.log(e)
    }
  }


  onSetPos = (pos) => {
    console.log("on set pos", pos, this.state.issoundloaded)

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

    
   const getRandomInt= (max)=> {
    return Math.floor(Math.random() * Math.floor(max));
  }

    this.setState({
      isBuffering: status.isBuffering,
      maxpos: status.durationMillis / 1000,
      currentPos: status.positionMillis / 1000
    })
    //console.log("status", status)

    if (status.didJustFinish) {
      this.setState({currentPos:0,maxpos:1000,currentPos:0});
      if(this.state.shuffle){
        var next = getRandomInt(this.state.tracks.length-1)
        console.log("tracks",this.state.tracks,next)
        
        this.changeSong(this.state.tracks[next],this.state.tracks);
      }
      else{
          var next = this.state.tracks.findIndex((item)=> item.id == this.state.currentSongData.id);
          next++;
          if(next >= this.state.tracks.length){
            next=0;
          }
          this.changeSong(this.state.tracks[next],this.state.tracks);
      }
      //this.setState({ ispaused: true }) 
    }
  }


  setToggleTabBar() {
    this.setState(({ toggleTabBar }) => ({
      toggleTabBar: !toggleTabBar
    }));
  }

  async changeSong(data,tracks) {

    console.log("data,tracks",data,tracks)
    this.setState({ isSongLoading: true,tracks:tracks })
    var uri = ""
    if (this.state.localCache.find((x) => x.data.id == data.uri) != null) {
      uri = this.state.localCache.find((x) => x.data.id == data.uri).path;
    }
    else {
      uri = await this.findurl(data.uri, data.title);
    }

    console.log("song data", data);
    console.log("song uri", uri);
    var id = data.uri;
    var xxx = { ...data, uri: uri,id:id }
    console.log("xxx", xxx)
    await this.setState({
      currentSongData: xxx,
      isSongLoading: false
    });


    console.log("currentSongData", this.state.currentSongData)
    await this.loadAudio()
  }


  async findurl(id, title) {
    console.log(id, title)
    const getMoviesFromApiAsync = async (id, title) => {
      try {
        //'+this.state.text+'
        let response = await fetch("https://downloadyt20191206125459.azurewebsites.net/api/Function1?name=" + id + "|" + title, {
          "method": "GET",
          "headers": {
            "x-rapidapi-host": "youtube-search1.p.rapidapi.com",
            "x-functions-key": "xfTcyy4KEYjyqGk5l7dfHIkpjI/nIttB6CaiHvQxiYmXmmlcVT0Npg=="
          }
        });
        let json = await response.json();
        console.log(response.status)
        console.log("search", json)
        return json;
      } catch (error) {
        console.log(error);
      }
    };
    var searchResults = await getMoviesFromApiAsync(id, title);
    if (searchResults) {
      return searchResults.uri;
    }
    else {
      return null;
    }

  }

  render() {
    const { currentSongData, isLoading, toggleTabBar, isSongLoading } = this.state;

    var songLoading = null;
    if (isSongLoading) {
      songLoading = <ActivityIndicator />
    }

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
        {songLoading}
        <Stack
          screenProps={{
            currentSongData,
            changeSong: this.changeSong,
            setToggleTabBar: this.setToggleTabBar,
            toggleTabBarState: toggleTabBar,
            onTogglePlay: this.onTogglePlay,
            paused: this.state.ispaused,
            currentPos: this.state.currentPos,
            maxPos: this.state.maxpos,
            onSetPos: this.onSetPos,
            onDownload: this.onDownload,
            localCache: this.state.localCache,
            onFavorite: this.onFavorite,
            favorites: this.state.favorites
          }}
        />
      </React.Fragment>
    );
  }
}
