import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

const videoSource = require('../assets/images/vid/main.mp4');

export default function VideoSplashScreen({ onFinish }) {
    const player = useVideoPlayer(videoSource, player => {
        player.loop = false;
        player.play();
    });

    useEffect(() => {
        const subscription = player.addListener('playToEnd', () => {
            onFinish();
        });

        return () => {
            subscription.remove();
        };
    }, [player, onFinish]);

    return (
        <View style={styles.container}>
            <VideoView
                style={styles.video}
                player={player}
                allowsPictureInPicture={false}
                nativeControls={false}
                contentFit="cover"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    video: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});
