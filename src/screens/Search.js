import React, { useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Button
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { colors, device, gStyle } from '../constants';

// components
import PlaylistItem from '../components/PlaylistItem';
import TouchIcon from '../components/TouchIcon';

// icons
import SvgSearch from '../components/icons/Svg.Search';

// mock data
import browseAll from '../mockdata/searchBrowseAll';
import topGenres from '../mockdata/searchTopGenres';

import LineItemAlbum from '../components/LineItemAlbum';
import albums from '../mockdata/albums';
import LineItemSongSearch from '../components/LineItemSongSearch';


class Search extends React.Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
    // search start (24 horizontal padding )
    const searchStart = device.width - 48;

    this.state = {
      scrollY: new Animated.Value(0),
      searchStart,
      searchEnd: searchStart - 40,
      searchResults: null,
      selectedArtist: null,
      albumSearchResults: null,
      selectedAlbum: null,
      trackSearchResults: null,
      text: "",
      textsearch: false,
      inputtext: null,
      searchfor:'artist'
    };

    this.performSearch = this.performSearch.bind(this);
    this.performAlbumSearch = this.performAlbumSearch.bind(this);
    this.performTrackSearch = this.performTrackSearch.bind(this);

    this.performArtistSearch = this.performArtistSearch.bind(this);
    this.performSimpleTrackSearch = this.performSimpleTrackSearch.bind(this);

    this.focusTextInput = this.focusTextInput.bind(this);
    this.compareValues = this.compareValues.bind(this);
    this.changeSong = this.changeSong.bind(this);
    this.itemDownload = this.itemDownload.bind(this);
  }

  async itemDownload(id, pdownload) {
    console.log("itemDownload")
    this.props.screenProps.onDownload(this.state.searchResultsTrack.recordings.filter(x=>x.releases[0]['release-group']['secondary-types']==null).filter((item) => item.id == id), pdownload);
  }

  changeSong(songData) {
    const {
      screenProps: { changeSong }
    } = this.props;

    changeSong(songData,
      [songData]
    )
        }

  compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }
  
      const varA = (typeof a[key] === 'string')
        ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string')
        ? b[key].toUpperCase() : b[key];
  
      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }

  async focusTextInput() {
    // Explicitly focus the text input using the raw DOM API
    // Note: we're accessing "current" to get the DOM node
    await this.setState({ textsearch: true});
    //this.textInput.current.focus();

  }

  async performSearch() {
    await this.performSimpleTrackSearch()
    await this.performArtistSearch()
    if(this.state.searchResults && this.state.searchResultsTrack)
    {
      console.log("compare",this.state.searchResults.artists.length,this.state.searchResultsTrack.recordings.filter(x=>x.releases[0]['release-group']['secondary-types']==null).length)
      if(this.state.searchResults.artists.length>0){//>this.state.searchResultsTrack.recordings.filter(x=>x.releases[0]['release-group']['secondary-types']==null).length){
        await this.setState({searchfor:'artist'})
      }
      else{
        await this.setState({searchfor:'song'})
      }
    }
  }

  async performArtistSearch() {
    this.setState({ selectedArtist: null, albumSearchResults: null, trackSearchResults: null, selectedAlbum: null,searchResults:null })
    console.log("performSearch", this.state.text)
    this.props.screenProps.onaddsearch(this.state.text,true,new Date().getTime());
    if (!this.state.text) {
      return;
    }

    const getMoviesFromApiAsync = async () => {
      try {
        //'+this.state.text+'
        let response = await fetch(
          'https://musicbrainz.org/ws/2/artist/?query=' + this.state.text + '&fmt=json', {
          headers: {
            'User-Agent': 'dejan app/1.0.0 (dejandjenic@gmail.com)'
          }
        }
        );
        let json = await response.json();
        //console.log(json)
        return json;
      } catch (error) {
        console.log(error);
      }
    };
    var searchResults = await getMoviesFromApiAsync();
    this.setState({ searchResults })
  }

  async performSimpleTrackSearch() {
    this.setState({ searchResultsTrack: null })
    console.log("performSearch", this.state.text)
    this.props.screenProps.onaddsearch(this.state.text,true,new Date().getTime());
    if (!this.state.text) {
      return;
    }

    const getMoviesFromApiAsync = async () => {
      try {
        //'+this.state.text+'
        let response = await fetch(
          'https://musicbrainz.org/ws/2/recording/?query=' + this.state.text + '&fmt=json', {
          headers: {
            'User-Agent': 'dejan app/1.0.0 (dejandjenic@gmail.com)'
          }
        }
        );
        let json = await response.json();
        //console.log(json)
        return json;
      } catch (error) {
        console.log(error);
      }
    };
    var searchResultsTrack = await getMoviesFromApiAsync();
    console.log("track search results",searchResultsTrack.recordings.filter(x=>x.releases[0]['release-group']['secondary-types']==null))

    const res = searchResultsTrack.recordings//.filter(x=>x.releases[0]['release-group']['secondary-types']==null)
     .reduce((acc, curr) => {
       if(curr!=null && curr.releases.length>0 && curr.releases[0]['release-group']!=null && !acc[curr.releases[0]['release-group'].id]) acc[curr.releases[0]['release-group'].id] = curr; //If this type wasn't previously stored
       //acc[curr.releases[0]['release-group']].push(curr);
       return acc; 
     },{})
    ;

    
    console.log("res",res)
    console.log("searchResultsTrack",searchResultsTrack)
    console.log("res2",Object.keys(res).map((k) => res[k]))
    searchResultsTrack.recordings=Object.keys(res).map((k) => res[k]);
    this.setState({ searchResultsTrack })
  }

  async performAlbumSearch(id, name) {
    this.setState({ selectedArtist: { id: id, name: name } })
    console.log("performAlbumSearch")

    const getMoviesFromApiAsync = async () => {
      try {
        //'+this.state.text+'
        let response = await fetch(
          'https://musicbrainz.org//ws/2/release-group?artist=' + id + '&type=album&fmt=json', {
          headers: {
            'User-Agent': 'dejan app/1.0.0 (dejandjenic@gmail.com)'
          }
        }
        );
        let json = await response.json();
        //console.log("albums",json)
        return json;
      } catch (error) {
        console.log(error);
      }
    };
    var albumSearchResults = await getMoviesFromApiAsync();
    this.setState({ albumSearchResults })
  }


  async performTrackSearch(id, name) {

    console.log("performTrackSearch")
    this.setState({ selectedAlbum: { id: id, name: name }, albumSearchResults: null })


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
        console.log("tracks", json)
        return json;
      } catch (error) {
        console.log(error);
      }
    };
    var trackSearchResults = await getMoviesFromApiAsync();
    this.setState({ trackSearchResults })
  }


  render() {

    const { scrollY, searchStart, searchEnd, text } = this.state;

    const opacity = scrollY.interpolate({
      inputRange: [0, 48],
      outputRange: [searchStart, searchEnd],
      extrapolate: 'clamp'
    });

    let tracksearch = null;
    if (this.state.searchResultsTrack) {
      tracksearch = this.state.searchResultsTrack.recordings.filter(x=>x.releases[0]['release-group']['secondary-types']==null).map((track,index)=>
      <LineItemSongSearch
      style={{color:colors.white}} 
      key={index.toString()}  

      active={this.props.screenProps.currentSongData && this.props.screenProps.currentSongData.title === track.title && this.props.screenProps.currentSongData.album === track.releases[0]['release-group'].title}
                  downloaded={this.props.screenProps.localCache.find((x) => x.data.id == track.id) != null}
                  key={index.toString()}
                  onPress={this.changeSong}
                  onDownload={this.itemDownload}
                  isfavorite={this.props.screenProps.favorites.find((x) => x.id == track.id) != null}
                  onfav={this.props.screenProps.onFavorite}
                  songData={{
                    album: track.releases[0]['release-group'].title,
                    albumid: track.releases[0]['release-group'].id,
                    artist: track['artist-credit'][0].artist.name,
                    image: 'album.image',
                    length: track.length / 1000,
                    title: track.title,
                    uri: track.id
                  }}
                  favorites={this.props.screenProps.favorites.filter(f=>f.type=="Playlist")}
                  onfavlist={(id,add,data)=> this.props.screenProps.onFavoriteapped(id,add,data)}
                  isinplaylist={this.props.screenProps.favorites.filter(f=>f.type=="Playlist").flatMap(x=>x.data.data).find(x=>x.uri == track.id)!=null}
                  findimage={this.props.screenProps.findimage}
                  getimagescache={this.props.screenProps.getimagescache}
    />
    // {item.title} {item['artist-credit'][0].artist.name} {item.releases[0]['release-group'].title}</Text>
      )
    }


    let searchs = null;
    //console.log(this.state.searchResults)
    if (this.state.searchResults && !this.state.selectedArtist) {
      searchs = <View style={styles.containerRow}>
        {this.state.searchResults.artists.map(index => {
          const item = index;

          return (
            <View key={item.id} style={styles.containerColumn}>
              <PlaylistItem
                bgColor={colors.grey}
                onPress={() => this.performAlbumSearch(item.id, item.name)}
                title={item.name}
                area={item.area ? item.area.name : (item["begin-area"] ? item["begin-area"].name : "")}
                isfavorite={this.props.screenProps.favorites.find((x) => x.id == item.id) != null}
                onfav={this.props.screenProps.onFavorite}
                xid={item.id}
              />
            </View>
          );
        })}
      </View>
    }
    else if (this.state.selectedArtist) {
      searchs = <View style={styles.container}>
        <TouchableOpacity
          onPress={() => console.log("on artist")}
        >

          <Text
            style={{ color: colors.white }}
          >{this.state.selectedArtist.name}
          </Text>
        </TouchableOpacity>
      </View>

    }



    let aalbums = null;
    if (this.state.albumSearchResults) {
      aalbums = <View style={styles.containerRow}>
        {this.state.albumSearchResults['release-groups'].map(index => {
          const item = index;

          return (
            <LineItemAlbum
              active={false}
              downloaded={false}
              key={index.id}
              onPress={() => this.performTrackSearch(item.id, item.title)}
              onPress2={() => console.log("sdf")}
              albumData={{ ...item, artist: this.state.selectedArtist.name }}
              isfavorite={this.props.screenProps.favorites.find((x) => x.id == item.id) != null}
              onfav={this.props.screenProps.onFavorite}
            />
          );
        })}
      </View>;
    }
    else if (this.state.selectedAlbum) {
      aalbums = <View

        style={styles.container}
      >
        <TouchableOpacity
          onPress={() => console.log("on selectedAlbum")}
        >

          <Text
            style={{ color: colors.white }}
          >{this.state.selectedAlbum.name}
          </Text>
        </TouchableOpacity>
      </View>
    }


    let tracks = null;
    if (this.state.trackSearchResults) {
      tracks = <View style={styles.containerRow}>
        {this.state.trackSearchResults.releases[0].media[0].tracks.map(index => {
          const item = index;

          return (
            <LineItemAlbum
              active={false}
              downloaded={false}
              key={index.id}
              onPress={() => null}
              albumData={item}
              onPress2={() => console.log("xxx")}
            />
          );
        })}
      </View>;
    }
    return (
      <React.Fragment>
        <Animated.ScrollView
          onScroll={Animated.event([
            { nativeEvent: { contentOffset: { y: scrollY } } }
          ])}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
          style={gStyle.container}
        >

          <View style={gStyle.spacer11} />
          <View style={styles.containerSearchBar}>
            <Animated.View style={{ width: opacity }}>
              {!this.state.textsearch ?
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={this.focusTextInput}
                  style={styles.searchPlaceholder}
                >
                  <View style={gStyle.mR1}>
                    <SvgSearch />
                  </View>
                  <Text style={styles.searchPlaceholderText}>
                    Artists, songs or podcasts
                </Text>
                </TouchableOpacity> : null
              }
              {this.state.textsearch ?
                <View><TouchableOpacity
                  activeOpacity={1}
                  onPress={() => null}
                  style={styles.searchPlaceholder}
                >
                  <View style={gStyle.mR1}>
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={async ()=>
                        {
                          await this.setState({text:"",searchResults:null});
                          this.performSearch();
                        }
                        }
                    >
                      <SvgSearch />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.searchPlaceholderText}
                    placeholder="Type here to search!"
                    onChangeText={text => this.setState({ text })}
                    defaultValue={text}
                    onSubmitEditing={this.performSearch}
                    ref={this.textInput}
                  >
                  </TextInput>
                </TouchableOpacity>
                {searchs==null?
                this.props.screenProps.recentseaches.sort(this.compareValues('timestamp','desc')).map((search,index)=>
                  <View
                  key={index.toString()}
                  style={styles.container}
                  >
                    
                    <TouchableOpacity
                  onPress={async ()=>{
                    await this.setState({text:search.text})
                    this.performSearch();
                  }}
                  >
                    <Text style={{color:colors.white,fontSize:22,padding:5}}>{search.text}</Text>
                  </TouchableOpacity>
                  
                  
                  <View  style={styles.containerRight}>
                  <TouchableOpacity 
                  onPress={()=>this.props.screenProps.onaddsearch(search.text,false)}
                  >
                    <FontAwesome color={colors.red} name='remove' size={20} />
                  </TouchableOpacity>
                  </View>
                  </View>
                  ):null
              }
                
                </View> : null
              }

              

            </Animated.View>
          </View>

          {/* <View style={styles.containerSearchBar2}>

            <TextInput
              style={styles.searchPlaceholder}
              placeholder="Type here to translate!"
              onChangeText={text => this.setState({ text })}
              defaultValue={text}
            />
            <Button style={gStyle.mR1} title="search"
              onPress={this.performSearch}
            />
          </View> */}

          {this.state.searchResults?
          <View style={styles.containerRow}>
<View
 style={{
  borderRadius: 6,
  height: 98,
  flex: 1,
  marginBottom: 24,
  marginRight: 24,
  width: '50%',
  backgroundColor:colors.grey,
  justifyContent: "center",
  alignItems:"center"
}}>
          <TouchableOpacity
          onPress={()=>this.setState({searchfor:'artist'})}
          >
            <Text style={{color:this.state.searchfor=="artist"?colors.brandPrimary:colors.white,fontSize:26}}>Artist</Text>
          </TouchableOpacity>
          </View>

          <View
 style={{
  borderRadius: 6,
  height: 98,
  flex: 1,
  marginBottom: 24,
  marginRight: 24,
  width: '50%',
  backgroundColor:colors.grey,
  justifyContent: "center",
  alignItems:"center"
}}>
          <TouchableOpacity
onPress={()=>this.setState({searchfor:'song'})}
>
  <Text style={{color:this.state.searchfor!="artist"?colors.brandPrimary:colors.white,fontSize:26}}>Song</Text>
</TouchableOpacity>
</View>
</View>
:null}
          {
this.state.searchfor=="artist"?

          
          <View>

          {searchs}

          {aalbums}

          {tracks}
</View>:null}

{
this.state.searchfor!="artist"?

          
          <View>

          {tracksearch}
</View>:null}

          {/* <Text style={styles.sectionHeading}>Your top genres</Text>
          <View style={styles.containerRow}>
            {Object.keys(topGenres).map(index => {
              const item = topGenres[index];

              return (
                <View key={item.id} style={styles.containerColumn}>
                  <PlaylistItem
                    bgColor={item.color}
                    onPress={() => null}
                    title={item.title}
                  />
                </View>
              );
            })}
          </View>

          <Text style={styles.sectionHeading}>Browse all</Text>
          <View style={styles.containerRow}>
            {Object.keys(browseAll).map(index => {
              const item = browseAll[index];

              return (
                <View key={item.id} style={styles.containerColumn}>
                  <PlaylistItem
                    bgColor={item.color}
                    onPress={() => null}
                    title={item.title}
                  />
                </View>
              );
            })}
          </View> */}
        </Animated.ScrollView>

        {/* <View style={styles.iconRight}>
          <TouchIcon
            icon={<FontAwesome color={colors.white} name="microphone" />}
            onPress={() => null}
          />
        </View> */}
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  containerSearchBar: {
    ...gStyle.pH3,
    backgroundColor: colors.blackBg,
    paddingBottom: 16,
    paddingTop: device.iPhoneX ? 64 : 24
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    width: '100%'
  },
  containerSearchBar2: {
    ...gStyle.pH3,
    color: colors.blackBg,
    paddingBottom: 16,
    paddingTop: device.iPhoneX ? 64 : 24
  },
  searchPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 6,
    flexDirection: 'row',
    paddingLeft: 16,
    paddingVertical: 16
  },
  searchPlaceholderText: {
    ...gStyle.textSpotify16,
    color: colors.blackBg,
    width:'100%'
  },
  sectionHeading: {
    ...gStyle.textSpotifyBold18,
    color: colors.white,
    marginBottom: 24,
    marginLeft: 24,
    marginTop: 16
  },
  containerRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 24
  },
  containerColumn: {
    width: '50%'
  },
  iconRight: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    top: device.web ? 40 : 78,
    width: 28
  },containerRight: {
    alignItems: 'flex-end',
    flex: 1
  }
});

export default Search;
