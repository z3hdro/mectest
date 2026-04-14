import {FC, useCallback, useEffect} from 'react';
import {Pressable, Text} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import {colors} from '@/constants';
import {useStyles} from './LikeButton.styles';
import {LikeButtonProps} from './LikeButton.types';

export const LikeButton: FC<LikeButtonProps> = ({isLiked, likesCount, onPress}) => {
    const styles = useStyles();

    const scale = useSharedValue(1);
    const liked = useSharedValue(isLiked ? 1 : 0);
    const countTranslateY = useSharedValue(0);
    const countOpacity = useSharedValue(1);

    useEffect(() => {
        liked.value = withTiming(isLiked ? 1 : 0, {duration: 200});
    }, [isLiked, liked]);

    useEffect(() => {
        countOpacity.value = withSequence(
            withTiming(0, {duration: 100}),
            withTiming(1, {duration: 200}),
        );
        countTranslateY.value = withSequence(
            withTiming(-10, {duration: 100}),
            withTiming(10, {duration: 0}),
            withTiming(0, {duration: 200}),
        );
    }, [likesCount, countOpacity, countTranslateY]);

    const handlePress = useCallback(() => {
        scale.value = withSequence(
            withTiming(1.3, {duration: 150}),
            withTiming(1, {duration: 150}),
        );
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    }, [onPress, scale]);

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{scale: scale.value}],
    }));

    const iconColorStyle = useAnimatedStyle(() => ({
        color: interpolateColor(liked.value, [0, 1], [colors.gray, colors.red]),
    }));

    const countAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{translateY: countTranslateY.value}],
        opacity: countOpacity.value,
    }));

    return (
        <Pressable style={styles.container} onPress={handlePress}>
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                <Animated.Text style={[{fontSize: 24}, iconColorStyle]}>
                    {isLiked ? '❤️' : '🤍'}
                </Animated.Text>
            </Animated.View>
            <Animated.View style={[styles.countContainer, countAnimatedStyle]}>
                <Text style={styles.countText}>{likesCount}</Text>
            </Animated.View>
        </Pressable>
    );
};

LikeButton.displayName = 'LikeButton';
