import {FC, memo} from "react";
import {Text} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";

import {Icon, PrimaryButton} from "@/components";
import { useStyles } from "./ErrorView.styles";
import { EDGES, ICON_SIZE } from "./ErrorView.constants";
import {ErrorViewProps} from "./ErrorView.types";

export const ErrorView: FC<ErrorViewProps> = memo(({ onRetry }) => {
    const styles = useStyles()

    return (
        <SafeAreaView style={styles.container} edges={EDGES}>
            <Icon name={"noInternet"} height={ICON_SIZE} width={ICON_SIZE} />

            <Text style={styles.label}>Не удалось загрузить публикации</Text>

            <PrimaryButton onPress={onRetry} label={'Повторить'} />
        </SafeAreaView >
    );
});

ErrorView.displayName = "ErrorView";