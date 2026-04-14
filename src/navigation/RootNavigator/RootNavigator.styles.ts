import { StyleSheet } from 'react-native'
import { useMemo } from 'react'

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                preloader: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    zIndex: 10,
                },
            }),
        []
    )
}
