import {useMemo} from "react";
import {StyleSheet} from "react-native";

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                },
                iconContainer: {
                    padding: 4,
                },
                countContainer: {
                    overflow: 'hidden',
                    height: 20,
                },
                countText: {
                    fontSize: 16,
                    lineHeight: 20,
                    fontFamily: 'Manrope_600SemiBold',
                },
            }),
        []
    );
};
