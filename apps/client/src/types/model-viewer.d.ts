// Type declarations for model-viewer custom element
declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement> & {
                src?: string;
                alt?: string;
                ar?: boolean;
                'ar-modes'?: string;
                'camera-controls'?: boolean;
                'touch-action'?: string;
                'auto-rotate'?: boolean;
                'shadow-intensity'?: string;
                'environment-image'?: string;
                exposure?: string;
                poster?: string;
                loading?: 'auto' | 'lazy' | 'eager';
                reveal?: 'auto' | 'interaction' | 'manual';
                'auto-rotate-delay'?: string;
                'rotation-per-second'?: string;
                'interaction-prompt'?: 'auto' | 'when-focused' | 'none';
                'camera-orbit'?: string;
                'camera-target'?: string;
                'field-of-view'?: string;
                'min-camera-orbit'?: string;
                'max-camera-orbit'?: string;
                'min-field-of-view'?: string;
                'max-field-of-view'?: string;
            },
            HTMLElement
        >;
    }
}

export { };
