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

class Search extends React.Component {
  constructor(props) {
    super(props);

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
      text: "riblja"
    };

    this.performSearch = this.performSearch.bind(this);
    this.performAlbumSearch = this.performAlbumSearch.bind(this);
    this.performTrackSearch = this.performTrackSearch.bind(this);
  }

  async performSearch() {
    this.setState({ selectedArtist: null, albumSearchResults: null, trackSearchResults: null, selectedAlbum: null })
    console.log("performSearch", this.state.text)
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
                isfavorite={this.props.screenProps.favorites.find((x) => x == item.id) != null}
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
              isfavorite={this.props.screenProps.favorites.find((x) => x == item.id) != null}
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
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => null}
                style={styles.searchPlaceholder}
              >
                <View style={gStyle.mR1}>
                  <SvgSearch />
                </View>
                <Text style={styles.searchPlaceholderText}>
                  Artists, songs or podcasts
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.containerSearchBar2}>

            <TextInput
              style={styles.searchPlaceholder}
              placeholder="Type here to translate!"
              onChangeText={text => this.setState({ text })}
              defaultValue={text}
            />
            <Button style={gStyle.mR1} title="search"
              onPress={this.performSearch}
            />
          </View>

          {searchs}

          {aalbums}

          {tracks}

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

        <View style={styles.iconRight}>
          <TouchIcon
            icon={<FontAwesome color={colors.white} name="microphone" />}
            onPress={() => null}
          />
        </View>
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
    color: colors.blackBg
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
  }
});

export default Search;
