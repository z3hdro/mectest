import {Text, TouchableOpacity} from "react-native";
import {FC, memo} from "react";

import { useStyles } from "./PrimaryButton.styles";
import { PrimaryButtonProps } from "./PrimaryButton.types";

export const PrimaryButton: FC<PrimaryButtonProps> = memo(({ onPress, label }) => {
    const styles = useStyles()

    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>
                {label}
            </Text>
        </TouchableOpacity>
    )
})

PrimaryButton.displayName = "PrimaryButton"