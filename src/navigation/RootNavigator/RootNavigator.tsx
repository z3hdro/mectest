import React from 'react'
import {NavigationContainer} from '@react-navigation/native'
import {createNativeStackNavigator, NativeStackNavigationOptions} from "@react-navigation/native-stack";

import {Preloader} from '@/components'
import {FeedScreen, PostDetailScreen} from "@/screens";

import {useStyles} from './RootNavigator.styles'

import {RootStackParamList} from "@/types";

const Stack = createNativeStackNavigator<RootStackParamList>()

const customOptions: NativeStackNavigationOptions = {
    headerShown: false,
    animationTypeForReplace: 'push',
}

export const RootNavigator = () => {
    const styles = useStyles()

    return (
        <NavigationContainer fallback={<Preloader style={styles.preloader} />}>
            <Stack.Navigator screenOptions={customOptions}>
                <Stack.Screen name="FeedScreen" component={FeedScreen} />
                <Stack.Screen name="FeedDetailsScreen" component={PostDetailScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}
