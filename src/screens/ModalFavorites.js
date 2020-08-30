import React from 'react';
import PropTypes from 'prop-types';
import { Animated,Image, Slider, StyleSheet, Text, View } from 'react-native';
import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { colors, device, func, gStyle, images } from '../constants';
import { withNavigation } from 'react-navigation';

// components
import ModalHeader from '../components/ModalHeader';
import TouchIcon from '../components/TouchIcon';
import LineItemFavorite from '../components/LineItemFavorite'

class ModalFavorites extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      favorited: false,
      paused: this.props.screenProps.paused,
      scrollY: new Animated.Value(0),
      id:''
    };

    this.toggleFavorite = this.toggleFavorite.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.onSlidingComplete = this.onSlidingComplete.bind(this);
  }

  async componentDidMount() {
    const lalbum = this.props.navigation.getParam('album', '');
    const type = this.props.navigation.getParam('type', 'Artist');
    const id = this.props.navigation.getParam('id', '');

    this.setState({
      //album: albums[albumTitle] || null,
      album: lalbum,
      type:type,
      id:id
    });
    console.log("lalbum", lalbum,type,"x"+id+"x",this.props.screenProps.favorites);
  }


  onSlidingComplete(e){
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
    const { paused,scrollY } = this.state;

    const stickyArray = device.web || this.state.type=='Artist' || true? [] : [0];
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

    const screenData=this.props.screenProps.favorites
    .filter(x=>//(x.type==this.state.type && this.state.id=="") 
    //|| 
    (this.state.type=="album" && x.type=="album" && ((this.state.id=="") || (this.state.id!="" && this.state.id==x.data.artist)))
    || (this.state.type=="song" && x.type=="song" && ((this.state.id=="") || (this.state.id!="" && this.state.id==x.data.album.title)))
    || (this.state.type=="Artist" && x.type=="Artist")
    );

    let head=null;
    if(this.state.type!="Artist" && false){
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
let title=this.state.type;
switch(this.state.type){
  case "album":
    title="Albums "+this.state.id;
    break;
    case "song":
    title="Songs "+this.state.id;
    break;
}
    return (
      
      <View style={gStyle.container}>
        <ModalHeader
          left={<Feather color={colors.greyLight} name="chevron-down" />}
          leftPress={() => navigation.goBack(null)}
          right={<Feather color={colors.greyLight} name="more-horizontal" />}
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
        .map((item)=>
        <LineItemFavorite
        
        key={item.id}
        albumData={{title:item.data.title}}
        albumId={item.data.id}
        onPress={()=> { 
          //console.log("type",this.state.type,item.data.title);
          //return;
          if(this.state.type=="Artist"){
            console.log("navigate to artist");
            navigation.push('ModalFavorites',{type:"album",id:item.data.title})
          }
          else{
          var filtered = this.props.screenProps.favorites
          .filter(x=>
            (this.state.type=="song" && x.type=="song" && (this.state.id=="" || (this.state.id!="" && x.data.artist == this.state.id)))
            || (this.state.type=="album" && x.type=="song" && x.data.album == item.data.title)
            );
          console.log("onPress",item,filtered,this.state.type);
            
          navigation.navigate('Album', {
                title: 'item.title',
                id:item.id,
                album:this.state.type=="album"?item.data:{title:"Favorites",artist:""},
                loadFromUri:false,
                results:filtered
                .map(x=>x),
                songtoplay:(this.state.type=="song"?item.id:"")
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
  },containerSongs: {
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
