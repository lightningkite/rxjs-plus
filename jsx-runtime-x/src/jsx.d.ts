export namespace JSXInternal {

    // import type { Property, MutableProperty } from "rxjs-property";
    type Property<T> = import("rxjs-property").Property<T>
    type MutableProperty<T> = import("rxjs-property").MutableProperty<T>

    type Defaultize<Props, Defaults> =
    // Distribute over unions
        Props extends any // Make any properties included in Default optional
            ? Partial<Pick<Props, Extract<keyof Props, keyof Defaults>>> &
            // Include the remaining properties from Props
            Pick<Props, Exclude<keyof Props, keyof Defaults>>
            : never;

    export type Element = HTMLElement
    export interface ElementClass {
        (): HTMLElement;
    }
    export type AttributeCollection = Record<string, any>

    type LibraryManagedAttributes<Component, Props> = Component extends {
            defaultProps: infer Defaults;
        }
        ? Defaultize<Props, Defaults>
        : Props;

    export interface IntrinsicAttributes {
        key?: any;
    }

    export interface ElementAttributesProperty {
        props: any;
    }

    export interface ElementChildrenAttribute {
        children: any;
    }

    type DOMCSSProperties = {
        [key in keyof Omit<
            CSSStyleDeclaration,
            | 'item'
            | 'setProperty'
            | 'removeProperty'
            | 'getPropertyValue'
            | 'getPropertyPriority'
            >]?: string | number | null | undefined;
    };
    type AllCSSProperties = {
        [key: string]: string | number | null | undefined;
    };
    interface CSSProperties extends AllCSSProperties, DOMCSSProperties {
        cssText?: string | null;
    }

    export interface SVGAttributes<Target extends EventTarget = SVGElement>
        extends HTMLAttributes<Target> {
        accentHeight?: number | string;
        accumulate?: 'none' | 'sum';
        additive?: 'replace' | 'sum';
        alignmentBaseline?:
            | 'auto'
            | 'baseline'
            | 'before-edge'
            | 'text-before-edge'
            | 'middle'
            | 'central'
            | 'after-edge'
            | 'text-after-edge'
            | 'ideographic'
            | 'alphabetic'
            | 'hanging'
            | 'mathematical'
            | 'inherit';
        allowReorder?: 'no' | 'yes';
        alphabetic?: number | string;
        amplitude?: number | string;
        arabicForm?: 'initial' | 'medial' | 'terminal' | 'isolated';
        ascent?: number | string;
        attributeName?: string;
        attributeType?: string;
        autoReverse?: number | string;
        azimuth?: number | string;
        baseFrequency?: number | string;
        baselineShift?: number | string;
        baseProfile?: number | string;
        bbox?: number | string;
        begin?: number | string;
        bias?: number | string;
        by?: number | string;
        calcMode?: number | string;
        capHeight?: number | string;
        clip?: number | string;
        clipPath?: string;
        clipPathUnits?: number | string;
        clipRule?: number | string;
        colorInterpolation?: number | string;
        colorInterpolationFilters?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit';
        colorProfile?: number | string;
        colorRendering?: number | string;
        contentScriptType?: number | string;
        contentStyleType?: number | string;
        cursor?: number | string;
        cx?: number | string;
        cy?: number | string;
        d?: string;
        decelerate?: number | string;
        descent?: number | string;
        diffuseConstant?: number | string;
        direction?: number | string;
        display?: number | string;
        divisor?: number | string;
        dominantBaseline?: number | string;
        dur?: number | string;
        dx?: number | string;
        dy?: number | string;
        edgeMode?: number | string;
        elevation?: number | string;
        enableBackground?: number | string;
        end?: number | string;
        exponent?: number | string;
        externalResourcesRequired?: number | string;
        fill?: string;
        fillOpacity?: number | string;
        fillRule?: 'nonzero' | 'evenodd' | 'inherit';
        filter?: string;
        filterRes?: number | string;
        filterUnits?: number | string;
        floodColor?: number | string;
        floodOpacity?: number | string;
        focusable?: number | string;
        fontFamily?: string;
        fontSize?: number | string;
        fontSizeAdjust?: number | string;
        fontStretch?: number | string;
        fontStyle?: number | string;
        fontVariant?: number | string;
        fontWeight?: number | string;
        format?: number | string;
        from?: number | string;
        fx?: number | string;
        fy?: number | string;
        g1?: number | string;
        g2?: number | string;
        glyphName?: number | string;
        glyphOrientationHorizontal?: number | string;
        glyphOrientationVertical?: number | string;
        glyphRef?: number | string;
        gradientTransform?: string;
        gradientUnits?: string;
        hanging?: number | string;
        horizAdvX?: number | string;
        horizOriginX?: number | string;
        ideographic?: number | string;
        imageRendering?: number | string;
        in2?: number | string;
        in?: string;
        intercept?: number | string;
        k1?: number | string;
        k2?: number | string;
        k3?: number | string;
        k4?: number | string;
        k?: number | string;
        kernelMatrix?: number | string;
        kernelUnitLength?: number | string;
        kerning?: number | string;
        keyPoints?: number | string;
        keySplines?: number | string;
        keyTimes?: number | string;
        lengthAdjust?: number | string;
        letterSpacing?: number | string;
        lightingColor?: number | string;
        limitingConeAngle?: number | string;
        local?: number | string;
        markerEnd?: string;
        markerHeight?: number | string;
        markerMid?: string;
        markerStart?: string;
        markerUnits?: number | string;
        markerWidth?: number | string;
        mask?: string;
        maskContentUnits?: number | string;
        maskUnits?: number | string;
        mathematical?: number | string;
        mode?: number | string;
        numOctaves?: number | string;
        offset?: number | string;
        opacity?: number | string;
        operator?: number | string;
        order?: number | string;
        orient?: number | string;
        orientation?: number | string;
        origin?: number | string;
        overflow?: number | string;
        overlinePosition?: number | string;
        overlineThickness?: number | string;
        paintOrder?: number | string;
        panose1?: number | string;
        pathLength?: number | string;
        patternContentUnits?: string;
        patternTransform?: number | string;
        patternUnits?: string;
        pointerEvents?: number | string;
        points?: string;
        pointsAtX?: number | string;
        pointsAtY?: number | string;
        pointsAtZ?: number | string;
        preserveAlpha?: number | string;
        preserveAspectRatio?: string;
        primitiveUnits?: number | string;
        r?: number | string;
        radius?: number | string;
        refX?: number | string;
        refY?: number | string;
        renderingIntent?: number | string;
        repeatCount?: number | string;
        repeatDur?: number | string;
        requiredExtensions?: number | string;
        requiredFeatures?: number | string;
        restart?: number | string;
        result?: string;
        rotate?: number | string;
        rx?: number | string;
        ry?: number | string;
        scale?: number | string;
        seed?: number | string;
        shapeRendering?: number | string;
        slope?: number | string;
        spacing?: number | string;
        specularConstant?: number | string;
        specularExponent?: number | string;
        speed?: number | string;
        spreadMethod?: string;
        startOffset?: number | string;
        stdDeviation?: number | string;
        stemh?: number | string;
        stemv?: number | string;
        stitchTiles?: number | string;
        stopColor?: string;
        stopOpacity?: number | string;
        strikethroughPosition?: number | string;
        strikethroughThickness?: number | string;
        string?: number | string;
        stroke?: string;
        strokeDasharray?: string | number;
        strokeDashoffset?: string | number;
        strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit';
        strokeLinejoin?: 'miter' | 'round' | 'bevel' | 'inherit';
        strokeMiterlimit?: string | number;
        strokeOpacity?: number | string;
        strokeWidth?: number | string;
        surfaceScale?: number | string;
        systemLanguage?: number | string;
        tableValues?: number | string;
        targetX?: number | string;
        targetY?: number | string;
        textAnchor?: string;
        textDecoration?: number | string;
        textLength?: number | string;
        textRendering?: number | string;
        to?: number | string;
        transform?: string;
        u1?: number | string;
        u2?: number | string;
        underlinePosition?: number | string;
        underlineThickness?: number | string;
        unicode?: number | string;
        unicodeBidi?: number | string;
        unicodeRange?: number | string;
        unitsPerEm?: number | string;
        vAlphabetic?: number | string;
        values?: string;
        vectorEffect?: number | string;
        version?: string;
        vertAdvY?: number | string;
        vertOriginX?: number | string;
        vertOriginY?: number | string;
        vHanging?: number | string;
        vIdeographic?: number | string;
        viewBox?: string;
        viewTarget?: number | string;
        visibility?: number | string;
        vMathematical?: number | string;
        widths?: number | string;
        wordSpacing?: number | string;
        writingMode?: number | string;
        x1?: number | string;
        x2?: number | string;
        x?: number | string;
        xChannelSelector?: string;
        xHeight?: number | string;
        xlinkActuate?: string;
        xlinkArcrole?: string;
        xlinkHref?: string;
        xlinkRole?: string;
        xlinkShow?: string;
        xlinkTitle?: string;
        xlinkType?: string;
        xmlBase?: string;
        xmlLang?: string;
        xmlns?: string;
        xmlnsXlink?: string;
        xmlSpace?: string;
        y1?: number | string;
        y2?: number | string;
        y?: number | string;
        yChannelSelector?: string;
        z?: number | string;
        zoomAndPan?: string;
    }

    interface PathAttributes {
        d: string;
    }

    type TargetedEvent<
        Target extends EventTarget = EventTarget,
        TypedEvent extends Event = Event
        > = Omit<TypedEvent, 'currentTarget'> & {
        readonly currentTarget: Target;
    };

    type TargetedAnimationEvent<Target extends EventTarget> = TargetedEvent<
        Target,
        AnimationEvent
        >;
    type TargetedClipboardEvent<Target extends EventTarget> = TargetedEvent<
        Target,
        ClipboardEvent
        >;
    type TargetedCompositionEvent<Target extends EventTarget> = TargetedEvent<
        Target,
        CompositionEvent
        >;
    type TargetedDragEvent<Target extends EventTarget> = TargetedEvent<
        Target,
        DragEvent
        >;
    type TargetedFocusEvent<Target extends EventTarget> = TargetedEvent<
        Target,
        FocusEvent
        >;
    type TargetedKeyboardEvent<Target extends EventTarget> = TargetedEvent<
        Target,
        KeyboardEvent
        >;
    type TargetedMouseEvent<Target extends EventTarget> = TargetedEvent<
        Target,
        MouseEvent
        >;
    type TargetedPointerEvent<Target extends EventTarget> = TargetedEvent<
        Target,
        PointerEvent
        >;
    type TargetedTouchEvent<Target extends EventTarget> = TargetedEvent<
        Target,
        TouchEvent
        >;
    type TargetedTransitionEvent<Target extends EventTarget> = TargetedEvent<
        Target,
        TransitionEvent
        >;
    type TargetedUIEvent<Target extends EventTarget> = TargetedEvent<
        Target,
        UIEvent
        >;
    type TargetedWheelEvent<Target extends EventTarget> = TargetedEvent<
        Target,
        WheelEvent
        >;

    interface EventHandler<E extends TargetedEvent> {
        /**
         * The `this` keyword always points to the DOM element the event handler
         * was invoked on. See: https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Event_handlers#Event_handlers_parameters_this_binding_and_the_return_value
         */
        (this: E['currentTarget'], event: E): void;
    }

    type AnimationEventHandler<Target extends EventTarget> = EventHandler<
        TargetedAnimationEvent<Target>
        >;
    type ClipboardEventHandler<Target extends EventTarget> = EventHandler<
        TargetedClipboardEvent<Target>
        >;
    type CompositionEventHandler<Target extends EventTarget> = EventHandler<
        TargetedCompositionEvent<Target>
        >;
    type DragEventHandler<Target extends EventTarget> = EventHandler<
        TargetedDragEvent<Target>
        >;
    type FocusEventHandler<Target extends EventTarget> = EventHandler<
        TargetedFocusEvent<Target>
        >;
    type GenericEventHandler<Target extends EventTarget> = EventHandler<
        TargetedEvent<Target>
        >;
    type KeyboardEventHandler<Target extends EventTarget> = EventHandler<
        TargetedKeyboardEvent<Target>
        >;
    type MouseEventHandler<Target extends EventTarget> = EventHandler<
        TargetedMouseEvent<Target>
        >;
    type PointerEventHandler<Target extends EventTarget> = EventHandler<
        TargetedPointerEvent<Target>
        >;
    type TouchEventHandler<Target extends EventTarget> = EventHandler<
        TargetedTouchEvent<Target>
        >;
    type TransitionEventHandler<Target extends EventTarget> = EventHandler<
        TargetedTransitionEvent<Target>
        >;
    type UIEventHandler<Target extends EventTarget> = EventHandler<
        TargetedUIEvent<Target>
        >;
    type WheelEventHandler<Target extends EventTarget> = EventHandler<
        TargetedWheelEvent<Target>
        >;

    export type ComponentChild =
        | HTMLElement
        | object
        | string
        | number
        | bigint
        | boolean
        | null
        | undefined;
    export type ComponentChildren = ComponentChild[] | ComponentChild;

    export interface DOMAttributes<Target extends EventTarget> {
        children?: ComponentChildren;
        dangerouslySetInnerHTML?: {
            __html: string;
        };
        // Image Events
        onLoad?: GenericEventHandler<Target>;
        onLoadCapture?: GenericEventHandler<Target>;
        onError?: GenericEventHandler<Target>;
        onErrorCapture?: GenericEventHandler<Target>;

        // Clipboard Events
        onCopy?: ClipboardEventHandler<Target>;
        onCopyCapture?: ClipboardEventHandler<Target>;
        onCut?: ClipboardEventHandler<Target>;
        onCutCapture?: ClipboardEventHandler<Target>;
        onPaste?: ClipboardEventHandler<Target>;
        onPasteCapture?: ClipboardEventHandler<Target>;

        // Composition Events
        onCompositionEnd?: CompositionEventHandler<Target>;
        onCompositionEndCapture?: CompositionEventHandler<Target>;
        onCompositionStart?: CompositionEventHandler<Target>;
        onCompositionStartCapture?: CompositionEventHandler<Target>;
        onCompositionUpdate?: CompositionEventHandler<Target>;
        onCompositionUpdateCapture?: CompositionEventHandler<Target>;

        // Details Events
        onToggle?: GenericEventHandler<Target>;

        // Focus Events
        onFocus?: FocusEventHandler<Target>;
        onFocusCapture?: FocusEventHandler<Target>;
        onBlur?: FocusEventHandler<Target>;
        onBlurCapture?: FocusEventHandler<Target>;

        // Form Events
        onChange?: GenericEventHandler<Target>;
        onChangeCapture?: GenericEventHandler<Target>;
        onInput?: GenericEventHandler<Target>;
        onInputCapture?: GenericEventHandler<Target>;
        onSearch?: GenericEventHandler<Target>;
        onSearchCapture?: GenericEventHandler<Target>;
        onSubmit?: GenericEventHandler<Target>;
        onSubmitCapture?: GenericEventHandler<Target>;
        onInvalid?: GenericEventHandler<Target>;
        onInvalidCapture?: GenericEventHandler<Target>;
        onReset?: GenericEventHandler<Target>;
        onResetCapture?: GenericEventHandler<Target>;
        onFormData?: GenericEventHandler<Target>;
        onFormDataCapture?: GenericEventHandler<Target>;

        // Keyboard Events
        onKeyDown?: KeyboardEventHandler<Target>;
        onKeyDownCapture?: KeyboardEventHandler<Target>;
        onKeyPress?: KeyboardEventHandler<Target>;
        onKeyPressCapture?: KeyboardEventHandler<Target>;
        onKeyUp?: KeyboardEventHandler<Target>;
        onKeyUpCapture?: KeyboardEventHandler<Target>;

        // Media Events
        onAbort?: GenericEventHandler<Target>;
        onAbortCapture?: GenericEventHandler<Target>;
        onCanPlay?: GenericEventHandler<Target>;
        onCanPlayCapture?: GenericEventHandler<Target>;
        onCanPlayThrough?: GenericEventHandler<Target>;
        onCanPlayThroughCapture?: GenericEventHandler<Target>;
        onDurationChange?: GenericEventHandler<Target>;
        onDurationChangeCapture?: GenericEventHandler<Target>;
        onEmptied?: GenericEventHandler<Target>;
        onEmptiedCapture?: GenericEventHandler<Target>;
        onEncrypted?: GenericEventHandler<Target>;
        onEncryptedCapture?: GenericEventHandler<Target>;
        onEnded?: GenericEventHandler<Target>;
        onEndedCapture?: GenericEventHandler<Target>;
        onLoadedData?: GenericEventHandler<Target>;
        onLoadedDataCapture?: GenericEventHandler<Target>;
        onLoadedMetadata?: GenericEventHandler<Target>;
        onLoadedMetadataCapture?: GenericEventHandler<Target>;
        onLoadStart?: GenericEventHandler<Target>;
        onLoadStartCapture?: GenericEventHandler<Target>;
        onPause?: GenericEventHandler<Target>;
        onPauseCapture?: GenericEventHandler<Target>;
        onPlay?: GenericEventHandler<Target>;
        onPlayCapture?: GenericEventHandler<Target>;
        onPlaying?: GenericEventHandler<Target>;
        onPlayingCapture?: GenericEventHandler<Target>;
        onProgress?: GenericEventHandler<Target>;
        onProgressCapture?: GenericEventHandler<Target>;
        onRateChange?: GenericEventHandler<Target>;
        onRateChangeCapture?: GenericEventHandler<Target>;
        onSeeked?: GenericEventHandler<Target>;
        onSeekedCapture?: GenericEventHandler<Target>;
        onSeeking?: GenericEventHandler<Target>;
        onSeekingCapture?: GenericEventHandler<Target>;
        onStalled?: GenericEventHandler<Target>;
        onStalledCapture?: GenericEventHandler<Target>;
        onSuspend?: GenericEventHandler<Target>;
        onSuspendCapture?: GenericEventHandler<Target>;
        onTimeUpdate?: GenericEventHandler<Target>;
        onTimeUpdateCapture?: GenericEventHandler<Target>;
        onVolumeChange?: GenericEventHandler<Target>;
        onVolumeChangeCapture?: GenericEventHandler<Target>;
        onWaiting?: GenericEventHandler<Target>;
        onWaitingCapture?: GenericEventHandler<Target>;

        // MouseEvents
        onClick?: MouseEventHandler<Target>;
        onClickCapture?: MouseEventHandler<Target>;
        onContextMenu?: MouseEventHandler<Target>;
        onContextMenuCapture?: MouseEventHandler<Target>;
        onDblClick?: MouseEventHandler<Target>;
        onDblClickCapture?: MouseEventHandler<Target>;
        onDrag?: DragEventHandler<Target>;
        onDragCapture?: DragEventHandler<Target>;
        onDragEnd?: DragEventHandler<Target>;
        onDragEndCapture?: DragEventHandler<Target>;
        onDragEnter?: DragEventHandler<Target>;
        onDragEnterCapture?: DragEventHandler<Target>;
        onDragExit?: DragEventHandler<Target>;
        onDragExitCapture?: DragEventHandler<Target>;
        onDragLeave?: DragEventHandler<Target>;
        onDragLeaveCapture?: DragEventHandler<Target>;
        onDragOver?: DragEventHandler<Target>;
        onDragOverCapture?: DragEventHandler<Target>;
        onDragStart?: DragEventHandler<Target>;
        onDragStartCapture?: DragEventHandler<Target>;
        onDrop?: DragEventHandler<Target>;
        onDropCapture?: DragEventHandler<Target>;
        onMouseDown?: MouseEventHandler<Target>;
        onMouseDownCapture?: MouseEventHandler<Target>;
        onMouseEnter?: MouseEventHandler<Target>;
        onMouseEnterCapture?: MouseEventHandler<Target>;
        onMouseLeave?: MouseEventHandler<Target>;
        onMouseLeaveCapture?: MouseEventHandler<Target>;
        onMouseMove?: MouseEventHandler<Target>;
        onMouseMoveCapture?: MouseEventHandler<Target>;
        onMouseOut?: MouseEventHandler<Target>;
        onMouseOutCapture?: MouseEventHandler<Target>;
        onMouseOver?: MouseEventHandler<Target>;
        onMouseOverCapture?: MouseEventHandler<Target>;
        onMouseUp?: MouseEventHandler<Target>;
        onMouseUpCapture?: MouseEventHandler<Target>;

        // Selection Events
        onSelect?: GenericEventHandler<Target>;
        onSelectCapture?: GenericEventHandler<Target>;

        // Touch Events
        onTouchCancel?: TouchEventHandler<Target>;
        onTouchCancelCapture?: TouchEventHandler<Target>;
        onTouchEnd?: TouchEventHandler<Target>;
        onTouchEndCapture?: TouchEventHandler<Target>;
        onTouchMove?: TouchEventHandler<Target>;
        onTouchMoveCapture?: TouchEventHandler<Target>;
        onTouchStart?: TouchEventHandler<Target>;
        onTouchStartCapture?: TouchEventHandler<Target>;

        // Pointer Events
        onPointerOver?: PointerEventHandler<Target>;
        onPointerOverCapture?: PointerEventHandler<Target>;
        onPointerEnter?: PointerEventHandler<Target>;
        onPointerEnterCapture?: PointerEventHandler<Target>;
        onPointerDown?: PointerEventHandler<Target>;
        onPointerDownCapture?: PointerEventHandler<Target>;
        onPointerMove?: PointerEventHandler<Target>;
        onPointerMoveCapture?: PointerEventHandler<Target>;
        onPointerUp?: PointerEventHandler<Target>;
        onPointerUpCapture?: PointerEventHandler<Target>;
        onPointerCancel?: PointerEventHandler<Target>;
        onPointerCancelCapture?: PointerEventHandler<Target>;
        onPointerOut?: PointerEventHandler<Target>;
        onPointerOutCapture?: PointerEventHandler<Target>;
        onPointerLeave?: PointerEventHandler<Target>;
        onPointerLeaveCapture?: PointerEventHandler<Target>;
        onGotPointerCapture?: PointerEventHandler<Target>;
        onGotPointerCaptureCapture?: PointerEventHandler<Target>;
        onLostPointerCapture?: PointerEventHandler<Target>;
        onLostPointerCaptureCapture?: PointerEventHandler<Target>;

        // UI Events
        onScroll?: UIEventHandler<Target>;
        onScrollCapture?: UIEventHandler<Target>;

        // Wheel Events
        onWheel?: WheelEventHandler<Target>;
        onWheelCapture?: WheelEventHandler<Target>;

        // Animation Events
        onAnimationStart?: AnimationEventHandler<Target>;
        onAnimationStartCapture?: AnimationEventHandler<Target>;
        onAnimationEnd?: AnimationEventHandler<Target>;
        onAnimationEndCapture?: AnimationEventHandler<Target>;
        onAnimationIteration?: AnimationEventHandler<Target>;
        onAnimationIterationCapture?: AnimationEventHandler<Target>;

        // Transition Events
        onTransitionEnd?: TransitionEventHandler<Target>;
        onTransitionEndCapture?: TransitionEventHandler<Target>;
    }

    export interface HTMLAttributes<RefType extends EventTarget = EventTarget>
        extends DOMAttributes<RefType> {
        ref?: (item: RefType)=>void;
        // Standard HTML Attributes
        accept?: string;
        acceptCharset?: string;
        accessKey?: string;
        action?: string;
        allowFullScreen?: boolean;
        allowTransparency?: boolean;
        alt?: string;
        as?: string;
        async?: boolean;
        autocomplete?: string;
        autoComplete?: string;
        autocorrect?: string;
        autoCorrect?: string;
        autofocus?: boolean;
        autoFocus?: boolean;
        autoPlay?: boolean;
        capture?: boolean | string;
        cellPadding?: number | string;
        cellSpacing?: number | string;
        charSet?: string;
        challenge?: string;
        checked?: boolean;
        class?: string;
        className?: string;
        cols?: number;
        colSpan?: number;
        content?: string;
        contentEditable?: boolean;
        contextMenu?: string;
        controls?: boolean;
        controlsList?: string;
        coords?: string;
        crossOrigin?: string;
        data?: string;
        dateTime?: string;
        default?: boolean;
        defer?: boolean;
        dir?: 'auto' | 'rtl' | 'ltr';
        disabled?: boolean;
        disableRemotePlayback?: boolean;
        download?: any;
        decoding?: 'sync' | 'async' | 'auto';
        draggable?: boolean;
        encType?: string;
        form?: string;
        formAction?: string;
        formEncType?: string;
        formMethod?: string;
        formNoValidate?: boolean;
        formTarget?: string;
        frameBorder?: number | string;
        headers?: string;
        height?: number | string;
        hidden?: boolean;
        high?: number;
        href?: string;
        hrefLang?: string;
        for?: string;
        htmlFor?: string;
        httpEquiv?: string;
        icon?: string;
        id?: string;
        inputMode?: string;
        integrity?: string;
        is?: string;
        keyParams?: string;
        keyType?: string;
        kind?: string;
        label?: string;
        lang?: string;
        list?: string;
        loading?: 'eager' | 'lazy';
        loop?: boolean;
        low?: number;
        manifest?: string;
        marginHeight?: number;
        marginWidth?: number;
        max?: number | string;
        maxLength?: number;
        media?: string;
        mediaGroup?: string;
        method?: string;
        min?: number | string;
        minLength?: number;
        multiple?: boolean;
        muted?: boolean;
        name?: string;
        nonce?: string;
        noValidate?: boolean;
        open?: boolean;
        optimum?: number;
        pattern?: string;
        placeholder?: string;
        playsInline?: boolean;
        poster?: string;
        preload?: string;
        radioGroup?: string;
        readonly?: boolean;
        readOnly?: boolean;
        rel?: string;
        required?: boolean;
        role?: string;
        rows?: number;
        rowSpan?: number;
        sandbox?: string;
        scope?: string;
        scoped?: boolean;
        scrolling?: string;
        seamless?: boolean;
        selected?: boolean;
        shape?: string;
        size?: number;
        sizes?: string;
        slot?: string;
        span?: number;
        spellcheck?: boolean;
        src?: string;
        srcset?: string;
        srcDoc?: string;
        srcLang?: string;
        srcSet?: string;
        start?: number;
        step?: number | string;
        style?: string | CSSProperties;
        summary?: string;
        tabIndex?: number;
        target?: string;
        title?: string;
        type?: string;
        useMap?: string;
        value?: string | string[] | number;
        volume?: string | number;
        width?: number | string;
        wmode?: string;
        wrap?: string;

        // RDFa Attributes
        about?: string;
        datatype?: string;
        inlist?: any;
        prefix?: string;
        property?: string;
        resource?: string;
        typeof?: string;
        vocab?: string;

        // Microdata Attributes
        itemProp?: string;
        itemScope?: boolean;
        itemType?: string;
        itemID?: string;
        itemRef?: string;

        // Standard HTML Attributes
        'bind-accept'?: Property<string>;
        'bind-acceptCharset'?: Property<string>;
        'bind-accessKey'?: Property<string>;
        'bind-action'?: Property<string>;
        'bind-allowFullScreen'?: Property<boolean>;
        'bind-allowTransparency'?: Property<boolean>;
        'bind-alt'?: Property<string>;
        'bind-as'?: Property<string>;
        'bind-async'?: Property<boolean>;
        'bind-autocomplete'?: Property<string>;
        'bind-autoComplete'?: Property<string>;
        'bind-autocorrect'?: Property<string>;
        'bind-autoCorrect'?: Property<string>;
        'bind-autofocus'?: Property<boolean>;
        'bind-autoFocus'?: Property<boolean>;
        'bind-autoPlay'?: Property<boolean>;
        'bind-capture'?: Property<boolean | string>;
        'bind-cellPadding'?: Property<number | string>;
        'bind-cellSpacing'?: Property<number | string>;
        'bind-charSet'?: Property<string>;
        'bind-challenge'?: Property<string>;
        'bind-checked'?: Property<boolean>;
        'bind-class'?: Property<string>;
        'bind-className'?: Property<string>;
        'bind-cols'?: Property<number>;
        'bind-colSpan'?: Property<number>;
        'bind-content'?: Property<string>;
        'bind-contentEditable'?: Property<boolean>;
        'bind-contextMenu'?: Property<string>;
        'bind-controls'?: Property<boolean>;
        'bind-controlsList'?: Property<string>;
        'bind-coords'?: Property<string>;
        'bind-crossOrigin'?: Property<string>;
        'bind-data'?: Property<string>;
        'bind-dateTime'?: Property<string>;
        'bind-default'?: Property<boolean>;
        'bind-defer'?: Property<boolean>;
        'bind-dir'?: Property<'auto' | 'rtl' | 'ltr'>;
        'bind-disabled'?: Property<boolean>;
        'bind-disableRemotePlayback'?: Property<boolean>;
        'bind-download'?: Property<any>;
        'bind-decoding'?: Property<'sync' | 'async' | 'auto'>;
        'bind-draggable'?: Property<boolean>;
        'bind-encType'?: Property<string>;
        'bind-form'?: Property<string>;
        'bind-formAction'?: Property<string>;
        'bind-formEncType'?: Property<string>;
        'bind-formMethod'?: Property<string>;
        'bind-formNoValidate'?: Property<boolean>;
        'bind-formTarget'?: Property<string>;
        'bind-frameBorder'?: Property<number | string>;
        'bind-headers'?: Property<string>;
        'bind-height'?: Property<number | string>;
        'bind-hidden'?: Property<boolean>;
        'bind-high'?: Property<number>;
        'bind-href'?: Property<string>;
        'bind-hrefLang'?: Property<string>;
        'bind-for'?: Property<string>;
        'bind-htmlFor'?: Property<string>;
        'bind-httpEquiv'?: Property<string>;
        'bind-icon'?: Property<string>;
        'bind-id'?: Property<string>;
        'bind-inputMode'?: Property<string>;
        'bind-integrity'?: Property<string>;
        'bind-is'?: Property<string>;
        'bind-keyParams'?: Property<string>;
        'bind-keyType'?: Property<string>;
        'bind-kind'?: Property<string>;
        'bind-label'?: Property<string>;
        'bind-lang'?: Property<string>;
        'bind-list'?: Property<string>;
        'bind-loading'?: Property<'eager' | 'lazy'>;
        'bind-loop'?: Property<boolean>;
        'bind-low'?: Property<number>;
        'bind-manifest'?: Property<string>;
        'bind-marginHeight'?: Property<number>;
        'bind-marginWidth'?: Property<number>;
        'bind-max'?: Property<number | string>;
        'bind-maxLength'?: Property<number>;
        'bind-media'?: Property<string>;
        'bind-mediaGroup'?: Property<string>;
        'bind-method'?: Property<string>;
        'bind-min'?: Property<number | string>;
        'bind-minLength'?: Property<number>;
        'bind-multiple'?: Property<boolean>;
        'bind-muted'?: Property<boolean>;
        'bind-name'?: Property<string>;
        'bind-nonce'?: Property<string>;
        'bind-noValidate'?: Property<boolean>;
        'bind-open'?: Property<boolean>;
        'bind-optimum'?: Property<number>;
        'bind-pattern'?: Property<string>;
        'bind-placeholder'?: Property<string>;
        'bind-playsInline'?: Property<boolean>;
        'bind-poster'?: Property<string>;
        'bind-preload'?: Property<string>;
        'bind-radioGroup'?: Property<string>;
        'bind-readonly'?: Property<boolean>;
        'bind-readOnly'?: Property<boolean>;
        'bind-rel'?: Property<string>;
        'bind-required'?: Property<boolean>;
        'bind-role'?: Property<string>;
        'bind-rows'?: Property<number>;
        'bind-rowSpan'?: Property<number>;
        'bind-sandbox'?: Property<string>;
        'bind-scope'?: Property<string>;
        'bind-scoped'?: Property<boolean>;
        'bind-scrolling'?: Property<string>;
        'bind-seamless'?: Property<boolean>;
        'bind-selected'?: Property<boolean>;
        'bind-shape'?: Property<string>;
        'bind-size'?: Property<number>;
        'bind-sizes'?: Property<string>;
        'bind-slot'?: Property<string>;
        'bind-span'?: Property<number>;
        'bind-spellcheck'?: Property<boolean>;
        'bind-src'?: Property<string>;
        'bind-srcset'?: Property<string>;
        'bind-srcDoc'?: Property<string>;
        'bind-srcLang'?: Property<string>;
        'bind-srcSet'?: Property<string>;
        'bind-start'?: Property<number>;
        'bind-step'?: Property<number | string>;
        'bind-style'?: Property<string | CSSProperties>;
        'bind-summary'?: Property<string>;
        'bind-tabIndex'?: Property<number>;
        'bind-target'?: Property<string>;
        'bind-title'?: Property<string>;
        'bind-type'?: Property<string>;
        'bind-useMap'?: Property<string>;
        'bind-value'?: Property<string | string[] | number>;
        'bind-volume'?: Property<string | number>;
        'bind-width'?: Property<number | string>;
        'bind-wmode'?: Property<string>;
        'bind-wrap'?: Property<string>;

        'bind-about'?: Property<string>;
        'bind-datatype'?: Property<string>;
        'bind-inlist'?: Property<any>;
        'bind-prefix'?: Property<string>;
        'bind-property'?: Property<string>;
        'bind-resource'?: Property<string>;
        'bind-typeof'?: Property<string>;
        'bind-vocab'?: Property<string>;

        'bind-itemProp'?: Property<string>;
        'bind-itemScope'?: Property<boolean>;
        'bind-itemType'?: Property<string>;
        'bind-itemID'?: Property<string>;
        'bind-itemRef'?: Property<string>;
    }

    export interface HTMLMarqueeElement extends HTMLElement {
        behavior?: 'scroll' | 'slide' | 'alternate';
        bgColor?: string;
        direction?: 'left' | 'right' | 'up' | 'down';
        height?: number | string;
        hspace?: number | string;
        loop?: number | string;
        scrollAmount?: number | string;
        scrollDelay?: number | string;
        trueSpeed?: boolean;
        vspace?: number | string;
        width?: number | string;
    }

    export interface IntrinsicElements {
        // HTML
        a: HTMLAttributes<HTMLAnchorElement>;
        abbr: HTMLAttributes<HTMLElement>;
        address: HTMLAttributes<HTMLElement>;
        area: HTMLAttributes<HTMLAreaElement>;
        article: HTMLAttributes<HTMLElement>;
        aside: HTMLAttributes<HTMLElement>;
        audio: HTMLAttributes<HTMLAudioElement>;
        b: HTMLAttributes<HTMLElement>;
        base: HTMLAttributes<HTMLBaseElement>;
        bdi: HTMLAttributes<HTMLElement>;
        bdo: HTMLAttributes<HTMLElement>;
        big: HTMLAttributes<HTMLElement>;
        blockquote: HTMLAttributes<HTMLQuoteElement>;
        body: HTMLAttributes<HTMLBodyElement>;
        br: HTMLAttributes<HTMLBRElement>;
        button: HTMLAttributes<HTMLButtonElement>;
        canvas: HTMLAttributes<HTMLCanvasElement>;
        caption: HTMLAttributes<HTMLTableCaptionElement>;
        cite: HTMLAttributes<HTMLElement>;
        code: HTMLAttributes<HTMLElement>;
        col: HTMLAttributes<HTMLTableColElement>;
        colgroup: HTMLAttributes<HTMLTableColElement>;
        data: HTMLAttributes<HTMLDataElement>;
        datalist: HTMLAttributes<HTMLDataListElement>;
        dd: HTMLAttributes<HTMLElement>;
        del: HTMLAttributes<HTMLModElement>;
        details: HTMLAttributes<HTMLDetailsElement>;
        dfn: HTMLAttributes<HTMLElement>;
        dialog: HTMLAttributes<HTMLDialogElement>;
        div: HTMLAttributes<HTMLDivElement>;
        dl: HTMLAttributes<HTMLDListElement>;
        dt: HTMLAttributes<HTMLElement>;
        em: HTMLAttributes<HTMLElement>;
        embed: HTMLAttributes<HTMLEmbedElement>;
        fieldset: HTMLAttributes<HTMLFieldSetElement>;
        figcaption: HTMLAttributes<HTMLElement>;
        figure: HTMLAttributes<HTMLElement>;
        footer: HTMLAttributes<HTMLElement>;
        form: HTMLAttributes<HTMLFormElement>;
        h1: HTMLAttributes<HTMLHeadingElement>;
        h2: HTMLAttributes<HTMLHeadingElement>;
        h3: HTMLAttributes<HTMLHeadingElement>;
        h4: HTMLAttributes<HTMLHeadingElement>;
        h5: HTMLAttributes<HTMLHeadingElement>;
        h6: HTMLAttributes<HTMLHeadingElement>;
        head: HTMLAttributes<HTMLHeadElement>;
        header: HTMLAttributes<HTMLElement>;
        hgroup: HTMLAttributes<HTMLElement>;
        hr: HTMLAttributes<HTMLHRElement>;
        html: HTMLAttributes<HTMLHtmlElement>;
        i: HTMLAttributes<HTMLElement>;
        iframe: HTMLAttributes<HTMLIFrameElement>;
        img: HTMLAttributes<HTMLImageElement>;
        input: HTMLAttributes<HTMLInputElement> & {
            'bind2-value-change'?: MutableProperty<string>
            'bind2-value-input'?: MutableProperty<string>
        };
        ins: HTMLAttributes<HTMLModElement>;
        kbd: HTMLAttributes<HTMLElement>;
        keygen: HTMLAttributes<HTMLUnknownElement>;
        label: HTMLAttributes<HTMLLabelElement>;
        legend: HTMLAttributes<HTMLLegendElement>;
        li: HTMLAttributes<HTMLLIElement>;
        link: HTMLAttributes<HTMLLinkElement>;
        main: HTMLAttributes<HTMLElement>;
        map: HTMLAttributes<HTMLMapElement>;
        mark: HTMLAttributes<HTMLElement>;
        marquee: HTMLAttributes<HTMLMarqueeElement>;
        menu: HTMLAttributes<HTMLMenuElement>;
        menuitem: HTMLAttributes<HTMLUnknownElement>;
        meta: HTMLAttributes<HTMLMetaElement>;
        meter: HTMLAttributes<HTMLMeterElement>;
        nav: HTMLAttributes<HTMLElement>;
        noscript: HTMLAttributes<HTMLElement>;
        object: HTMLAttributes<HTMLObjectElement>;
        ol: HTMLAttributes<HTMLOListElement>;
        optgroup: HTMLAttributes<HTMLOptGroupElement>;
        option: HTMLAttributes<HTMLOptionElement>;
        output: HTMLAttributes<HTMLOutputElement>;
        p: HTMLAttributes<HTMLParagraphElement>;
        param: HTMLAttributes<HTMLParamElement>;
        picture: HTMLAttributes<HTMLPictureElement>;
        pre: HTMLAttributes<HTMLPreElement>;
        progress: HTMLAttributes<HTMLProgressElement>;
        q: HTMLAttributes<HTMLQuoteElement>;
        rp: HTMLAttributes<HTMLElement>;
        rt: HTMLAttributes<HTMLElement>;
        ruby: HTMLAttributes<HTMLElement>;
        s: HTMLAttributes<HTMLElement>;
        samp: HTMLAttributes<HTMLElement>;
        script: HTMLAttributes<HTMLScriptElement>;
        section: HTMLAttributes<HTMLElement>;
        select: HTMLAttributes<HTMLSelectElement>;
        slot: HTMLAttributes<HTMLSlotElement>;
        small: HTMLAttributes<HTMLElement>;
        source: HTMLAttributes<HTMLSourceElement>;
        span: HTMLAttributes<HTMLSpanElement>;
        strong: HTMLAttributes<HTMLElement>;
        style: HTMLAttributes<HTMLStyleElement>;
        sub: HTMLAttributes<HTMLElement>;
        summary: HTMLAttributes<HTMLElement>;
        sup: HTMLAttributes<HTMLElement>;
        table: HTMLAttributes<HTMLTableElement>;
        tbody: HTMLAttributes<HTMLTableSectionElement>;
        td: HTMLAttributes<HTMLTableCellElement>;
        textarea: HTMLAttributes<HTMLTextAreaElement>;
        tfoot: HTMLAttributes<HTMLTableSectionElement>;
        th: HTMLAttributes<HTMLTableCellElement>;
        thead: HTMLAttributes<HTMLTableSectionElement>;
        time: HTMLAttributes<HTMLTimeElement>;
        title: HTMLAttributes<HTMLTitleElement>;
        tr: HTMLAttributes<HTMLTableRowElement>;
        track: HTMLAttributes<HTMLTrackElement>;
        u: HTMLAttributes<HTMLElement>;
        ul: HTMLAttributes<HTMLUListElement>;
        var: HTMLAttributes<HTMLElement>;
        video: HTMLAttributes<HTMLVideoElement>;
        wbr: HTMLAttributes<HTMLElement>;

        //SVG
        svg: SVGAttributes<SVGSVGElement>;
        animate: SVGAttributes<SVGAnimateElement>;
        circle: SVGAttributes<SVGCircleElement>;
        animateTransform: SVGAttributes<SVGAnimateElement>;
        clipPath: SVGAttributes<SVGClipPathElement>;
        defs: SVGAttributes<SVGDefsElement>;
        desc: SVGAttributes<SVGDescElement>;
        ellipse: SVGAttributes<SVGEllipseElement>;
        feBlend: SVGAttributes<SVGFEBlendElement>;
        feColorMatrix: SVGAttributes<SVGFEColorMatrixElement>;
        feComponentTransfer: SVGAttributes<SVGFEComponentTransferElement>;
        feComposite: SVGAttributes<SVGFECompositeElement>;
        feConvolveMatrix: SVGAttributes<SVGFEConvolveMatrixElement>;
        feDiffuseLighting: SVGAttributes<SVGFEDiffuseLightingElement>;
        feDisplacementMap: SVGAttributes<SVGFEDisplacementMapElement>;
        feDropShadow: SVGAttributes<SVGFEDropShadowElement>;
        feFlood: SVGAttributes<SVGFEFloodElement>;
        feFuncA: SVGAttributes<SVGFEFuncAElement>;
        feFuncB: SVGAttributes<SVGFEFuncBElement>;
        feFuncG: SVGAttributes<SVGFEFuncGElement>;
        feFuncR: SVGAttributes<SVGFEFuncRElement>;
        feGaussianBlur: SVGAttributes<SVGFEGaussianBlurElement>;
        feImage: SVGAttributes<SVGFEImageElement>;
        feMerge: SVGAttributes<SVGFEMergeElement>;
        feMergeNode: SVGAttributes<SVGFEMergeNodeElement>;
        feMorphology: SVGAttributes<SVGFEMorphologyElement>;
        feOffset: SVGAttributes<SVGFEOffsetElement>;
        feSpecularLighting: SVGAttributes<SVGFESpecularLightingElement>;
        feTile: SVGAttributes<SVGFETileElement>;
        feTurbulence: SVGAttributes<SVGFETurbulenceElement>;
        filter: SVGAttributes<SVGFilterElement>;
        foreignObject: SVGAttributes<SVGForeignObjectElement>;
        g: SVGAttributes<SVGGElement>;
        image: SVGAttributes<SVGImageElement>;
        line: SVGAttributes<SVGLineElement>;
        linearGradient: SVGAttributes<SVGLinearGradientElement>;
        marker: SVGAttributes<SVGMarkerElement>;
        mask: SVGAttributes<SVGMaskElement>;
        path: SVGAttributes<SVGPathElement>;
        pattern: SVGAttributes<SVGPatternElement>;
        polygon: SVGAttributes<SVGPolygonElement>;
        polyline: SVGAttributes<SVGPolylineElement>;
        radialGradient: SVGAttributes<SVGRadialGradientElement>;
        rect: SVGAttributes<SVGRectElement>;
        stop: SVGAttributes<SVGStopElement>;
        symbol: SVGAttributes<SVGSymbolElement>;
        text: SVGAttributes<SVGTextElement>;
        tspan: SVGAttributes<SVGTSpanElement>;
        use: SVGAttributes<SVGUseElement>;
    }
}