import {useMemo} from "react";
import {StyleSheet} from "react-native";
import {colors} from "@/constants";

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                container: {
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    position: "absolute",
                    zIndex: 10,
                    justifyContent: 'center',
                    paddingHorizontal: 16,
                },
                content: {
                    width: '80%',
                    alignItems: 'center',
                    gap: 12,
                },
                iconWrapper: {
                    backgroundColor: colors.purple,
                    height: 42,
                    width: 42,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                },
                label: {
                    fontSize: 15,
                    lineHeight: 20,
                    fontFamily: 'Manrope_600SemiBold',
                    color: colors.white,
                    textAlign: 'center',
                }
            }),
        []
    );
};
