// Type declarations for model-viewer custom element
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': {
                ref?: any;
                src?: string;
                alt?: string;
                ar?: boolean;
                'ar-modes'?: string;
                'camera-controls'?: boolean;
                'touch-action'?: string;
                'auto-rotate'?: boolean;
                'shadow-intensity'?: string | number;
                'environment-image'?: string;
                exposure?: string | number;
                poster?: string;
                loading?: 'auto' | 'lazy' | 'eager';
                reveal?: 'auto' | 'interaction' | 'manual';
                'auto-rotate-delay'?: string | number;
                'rotation-per-second'?: string;
                'interaction-prompt'?: 'auto' | 'when-focused' | 'none';
                'camera-orbit'?: string;
                'camera-target'?: string;
                'field-of-view'?: string;
                'min-camera-orbit'?: string;
                'max-camera-orbit'?: string;
                'min-field-of-view'?: string;
                'max-field-of-view'?: string;
                className?: string;
                style?: { [key: string]: any };
                onLoad?: () => void;
                onError?: () => void;
            };
        }
    }
}

export { };
