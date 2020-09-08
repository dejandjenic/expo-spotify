import React from 'react';
import { View,StyleSheet,ActivityIndicator, StatusBar, Vibration, Platform } from 'react-native';
import { AppLoading } from 'expo';
import { func,colors } from './src/constants';
import { MenuProvider } from 'react-native-popup-menu';
// main navigation stack
import Stack from './src/navigation/Stack';

import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av'
import { throwIfAudioIsDisabled } from 'expo-av/build/Audio/AudioAvailability';


import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { Notifications as Notifications2 } from 'expo';

const cf="favorites.json";
const rs="recentsearches.json";
const ip="images.json";
const cp="cover.json";


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
      shuffle:true,
      repeat:false,
      recentseaches:[],
      imagescache:[],
      covers:[]
    };

    this.changeSong = this.changeSong.bind(this);
    this.setToggleTabBar = this.setToggleTabBar.bind(this);
    this.onTogglePlay = this.onTogglePlay.bind(this);
    this.onSetPos = this.onSetPos.bind(this);
    this.findurl = this.findurl.bind(this);
    this.onDownload = this.onDownload.bind(this);
    this.onFavorite = this.onFavorite.bind(this);
    this.setTrack = this.setTrack.bind(this);
    this.shufflePlay = this.shufflePlay.bind(this);
    this.onChangeShuffle = this.onChangeShuffle.bind(this);
    this.onChangeRepeat = this.onChangeRepeat.bind(this);
    this.nextSong = this.nextSong.bind(this);
    this.prevSong = this.prevSong.bind(this);
    this.onFavoriteapped=this.onFavoriteapped.bind(this);
    this.onaddsearch=this.onaddsearch.bind(this);
    this.getimagescache=this.getimagescache.bind(this);
    this.uuidv4 = this.uuidv4.bind(this);
    this.findimage = this.findimage.bind(this);
    this.setisloading = this.setisloading.bind(this);
    this.registerForPushNotificationsAsync = this.registerForPushNotificationsAsync.bind(this);
    this._handleNotification = this._handleNotification.bind(this);
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


      var fPath = FileSystem.documentDirectory + cf;

      var fif = await FileSystem.getInfoAsync(fPath);
      if (!fif.exists) {
        await FileSystem.writeAsStringAsync(fPath, "[]");
      }

      var f = await FileSystem.readAsStringAsync(fPath);
      var favorites = JSON.parse(f)


      this.setState({ localCache, favorites })




      //recent searches
      var rsPath = FileSystem.documentDirectory + rs;

      var firecentsearches = await FileSystem.getInfoAsync(rsPath);
      if (!firecentsearches.exists) {
        await FileSystem.writeAsStringAsync(rsPath, "[]");
      }

      var rsr=await FileSystem.readAsStringAsync(rsPath);
      var recentseaches = JSON.parse(rsr)



      var ipPath = FileSystem.documentDirectory + ip;

      var fiimagescache = await FileSystem.getInfoAsync(ipPath);
      if (!fiimagescache.exists) {
        await FileSystem.writeAsStringAsync(ipPath, "[]");
      }

      var ipr=await FileSystem.readAsStringAsync(ipPath);
      var imagescache = JSON.parse(ipr)


      


      var coPath = FileSystem.documentDirectory + cp;

      var ficover = await FileSystem.getInfoAsync(coPath);
      if (!ficover.exists) {
        await FileSystem.writeAsStringAsync(coPath, "[]");
      }

      var cor=await FileSystem.readAsStringAsync(coPath);
      var covers = JSON.parse(cor)

      this.setState({ localCache, favorites,recentseaches ,imagescache,covers})

    } catch (e) {
      console.log(e)
    }

    console.log("componentDidMount", this.state.localCache.length)

    this.fullfile = FileSystem.documentDirectory + 'tzWd3cVNSC4.mp3';

    this.registerForPushNotificationsAsync();
    this._notificationSubscription = Notifications2.addListener(this._handleNotification);
  }

  setisloading(param){
    console.log("is loading",param)
    this.setState({ isSongLoading: param });
  }

  registerForPushNotificationsAsync = async () => {
    console.log("registerForPushNotificationsAsync")
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      let token = await Notifications2.getExpoPushTokenAsync();
      console.log(token);
      this.setState({ expoPushToken: token });
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications2.createChannelAndroidAsync('default', {
        name: 'default',
        sound: true,
        priority: 'max',
        vibrate: [0, 250, 250, 250],
      });
    }
  };

  _handleNotification = notification => {
    
    console.log(notification);
    
    if(notification.data.type=="register"){
      Notifications2.dismissNotificationAsync(notification.notificationId)
    }
    else{
      Vibration.vibrate();
      this.setState({ notification: notification });
    }
  };

  async findimage(id){
    console.log("findimage",id)
    let {covers} = this.state;
    if(covers[id]!=null)
    {
      return covers[id]
    }
    const getMoviesFromApiAsync = async () => {
      try {
        //'+this.state.text+'
        let response = await fetch(
          'https://coverartarchive.org/release-group/'+id+'?fmt=json', {
          headers: {
            'User-Agent': 'dejan app/1.0.0 (dejandjenic@gmail.com)'
          }
        }
        );

        console.log("response.status",response.status)

        if(response.status!=200){
          return null;
        }
        let json = await response.json();
        
        
        console.log("image json",json)
        return json.images.find(x=>x.front).thumbnails.small;
      } catch (error) {
        console.log(error);
      }
    };
    let x = await getMoviesFromApiAsync();
    if(x!=null){
      covers[id]=x;
      await this.setState({covers})


      var coPath = FileSystem.documentDirectory + cp;

        await FileSystem.writeAsStringAsync(coPath, JSON.stringify(covers));

      return x
    }
    else{
      return null
    }
  }
  
  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async getimagescache(uri){
    let {imagescache}=this.state;
    if(uri==null){
      return null
    }
    console.log("imagescache")
if(imagescache[uri]!=null){
  return imagescache[uri]
}
else{


  const callback = downloadProgress => {
    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
    console.log(progress)
    this.setState({
      downloadProgress: progress,
    }); 
  }; 

  if (uri != null) {

    var localfile = FileSystem.documentDirectory + this.uuidv4() + ".jpg";

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



  imagescache[uri] = localfile;
  
  var coPath = FileSystem.documentDirectory + ip;

  await FileSystem.writeAsStringAsync(coPath, JSON.stringify(imagescache));

}
}
return imagescache[uri]
    
  }

  async onaddsearch(text,add,time){
    console.log("onaddsearch",text,add,time)
    if(text=="" && add){
      return;
    }
    
    let {recentseaches}=this.state;
    if(add){
    if(recentseaches.find(x=>x.text==text)==null){
      recentseaches.push({text:text,timestamp:time});
    }
    else{
      recentseaches=recentseaches.filter(x=>x.text!=text);
      recentseaches.push({text:text,timestamp:time});
    }
  }else{
    if(recentseaches.find(x=>x.text==text)!=null){
      recentseaches=recentseaches.filter(x=>x.text!=text);
    }
  }
    this.setState({recentseaches});
    var fPath = FileSystem.documentDirectory + rs;

    await FileSystem.writeAsStringAsync(fPath, JSON.stringify(recentseaches));
  }

  async onChangeRepeat(val){
    console.log("onChangeRepeat",val)
    this.setState({repeat:val})    
  }

  async onChangeShuffle(val){
console.log("onChangeShuffle",val)
this.setState({shuffle:val})
  }

  async onFavorite(id, add,type,data) {
    console.log("onFavorite", id, add,data)
    
    let { favorites } = this.state;
    //console.log("onFavorite", favorites)

    if(add){
      favorites.push({id:id,type:type,data:data});
      await this.setState({ favorites }) 
    }
    else {
      if (favorites.find((x) => x.id == id) != null) {
        favorites = favorites.filter((x) => x.id != id);
      }
    }
    //console.log("onFavorite", favorites)
this.setState({favorites})
    var fPath = FileSystem.documentDirectory + cf;

    await FileSystem.writeAsStringAsync(fPath, JSON.stringify(favorites));

  }


  async onFavoriteapped(id, add,data) { 
    console.log("onFavoritelist", id, add,data)
    
    let { favorites } = this.state;
    console.log("favorites",favorites)
    //console.log("onFavorite", favorites) 

      if (favorites.find((x) => x.id == id) != null) {
        console.log("onFavoritelist", "found")
        let thefav = favorites.find((x) => x.id == id); 
        if(add){
thefav.data.data.push(data);
        }
        else{
          console.log("onFavoritelist", "remove")
          thefav.data.data=thefav.data.data.filter(x=>x.uri!=data.uri)
        }
      }
    
    //console.log("onFavorite", favorites)
this.setState({favorites}) 
    var fPath = FileSystem.documentDirectory + cf;

    await FileSystem.writeAsStringAsync(fPath, JSON.stringify(favorites));

  }

  async onDownload(data, download,externalProgressCallback) {


    const callback = downloadProgress => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      console.log(progress)
      this.setState({
        downloadProgress: progress,
      }); 
      if(externalProgressCallback!=null){
        externalProgressCallback(progress)
      }
    }; 

    var localCache = this.state.localCache;
    this.setState({ isSongLoading: true });
    console.log("ondownload",data);

    for (let item of data) {
      //console.log(item)
      if (download) {
        if (localCache.find((x) => x.data.id == item.id) == null) {

          var uri = await this.findurl(item.id, item.title);
          if (uri != null) {

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


  async nextSong(){
    await this.setState({currentPos:0})
      this.setState({currentPos:0,maxpos:1000});
      var current = this.state.tracks.findIndex((item)=> item.uri == this.state.currentSongData.id);
      var next = current+1;
      if(next>=this.state.tracks.length)
      {
        next=0;
      }
      this.changeSong(this.state.tracks[next],this.state.tracks);
  }

  async prevSong(){
    await this.setState({currentPos:0})
      this.setState({currentPos:0,maxpos:1000});
      var current = this.state.tracks.findIndex((item)=> item.uri == this.state.currentSongData.id);
      console.log("prev.current",current)
      var next = current-1;
      if(next<0)
      {
        next=this.state.tracks.length-1;
      }
      console.log("next",next)
      console.log("this.state.tracks[next]",this.state.tracks[next])
      this.changeSong(this.state.tracks[next],this.state.tracks);
  }

  async setTrack(tracks){

    await this.setState({tracks})
    await this.shufflePlay()
  }

  async shufflePlay(){

    const getRandomInt= (max)=> {
      return Math.floor(Math.random() * Math.floor(max));
    }

    await this.setState({currentPos:0})
      this.setState({currentPos:0,maxpos:1000});

      var current = this.state.tracks.findIndex((item)=> item.uri == (this.state.currentSongData?this.state.currentSongData.id:""));

        var next = getRandomInt(this.state.tracks.length-1)
        while(next==current){
          next = getRandomInt(this.state.tracks.length-1)
        }
        console.log("next",next)
        console.log("tracks",this.state.tracks,next)
        
        this.changeSong(this.state.tracks[next],this.state.tracks);
  }
  

  onPlaybackStatusUpdate = async (status) => {

    
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
      console.log("this.state.currentSongData",this.state.currentSongData)
      console.log("this.state.tracks",this.state.tracks)
      console.log("this.state.shuffle",this.state.shuffle)
      if(this.state.repeat){
        this.state.playbackInstance.setPositionAsync(0);
      }
      else if(this.state.shuffle){
      await this.shufflePlay();
      }
      else{
          var next = this.state.tracks.findIndex((item)=> item.uri == this.state.currentSongData.id);
          console.log("next",next)
          next++;
          if(next >= this.state.tracks.length){
            next=0;
          }
          console.log("next song",this.state.tracks[next])
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
    console.log("searchResults",searchResults)
    if (searchResults!=null) {
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
      songLoading = <View style={styles.whiteOverlay}  >
      <ActivityIndicator
        size="large" color={colors.brandPrimary}
      />
    </View >
    }
    else{
      songLoading=null
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
      <MenuProvider>
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
            favorites: this.state.favorites,
            setTrack:this.setTrack,
            onChangeShuffle:this.onChangeShuffle,
            shuffle:this.state.shuffle,
            repeat:this.state.repeat,
            onChangeRepeat:this.onChangeRepeat,
            nextSong:this.nextSong,
            prevSong:this.prevSong,
            onFavoriteapped:this.onFavoriteapped,
            recentseaches:this.state.recentseaches,
            onaddsearch:this.onaddsearch,
            getimagescache:this.getimagescache,
            findimage:this.findimage,
            setisloading:this.setisloading
          }}
        />
      </React.Fragment></MenuProvider>
    );
  }
}




const styles = StyleSheet.create({
  whiteOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'  ,
    zIndex:200
 }
});