declare module '*.svg' {
    const content: React.FC<
        SvgProps & {
        fill1?: string;
        fill2?: string;
        fill3?: string;
    }
    >;
    export default content;
}

declare module '*.jpg' {
    import {ImageSourcePropType} from 'react-native';
    const content: ImageSourcePropType;
    export default content;
}

declare module '*.png' {
    import {ImageSourcePropType} from 'react-native';
    const content: ImageSourcePropType;
    export default content;
}