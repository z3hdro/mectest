import {FC, useCallback, useEffect} from 'react';
import {Pressable, Text} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import {Icon} from "@/components";
import {colors} from "@/constants";
import { ICON_SIZE } from "./LikeButton.constants";
import {useStyles} from './LikeButton.styles';
import {LikeButtonProps} from './LikeButton.types';

export const LikeButton: FC<LikeButtonProps> = ({isLiked, likesCount, onPress, disabled}) => {
    const styles = useStyles();

    const scale = useSharedValue(1);
    const countTranslateY = useSharedValue(0);
    const countOpacity = useSharedValue(1);

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
        if (disabled) return;
        scale.value = withSequence(
            withTiming(1.3, {duration: 150}),
            withTiming(1, {duration: 150}),
        );
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    }, [onPress, scale, disabled]);

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{scale: scale.value}],
    }));

    const countAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{translateY: countTranslateY.value}],
        opacity: countOpacity.value,
    }));

    return (
        <Pressable
            style={[styles.container, isLiked && styles.containerSelected]}
            onPress={handlePress} disabled={disabled}>
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                <Icon
                    name={isLiked ? 'likeFilled' : 'like'}
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    aria-checked={isLiked}
                    color={isLiked ? colors.selected : colors.disabledGray}
                />
            </Animated.View>
            <Animated.View style={[styles.countContainer, countAnimatedStyle]}>
                <Text style={[styles.countText, isLiked && styles.countTextSelected]}>{likesCount}</Text>
            </Animated.View>
        </Pressable>
    );
};

LikeButton.displayName = 'LikeButton';
