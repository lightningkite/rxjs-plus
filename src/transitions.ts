
export class TransitionTriple {
    public constructor(
        public readonly enter: (string | null),
        public readonly exit: (string | null)
    ) { }
}

export namespace TransitionTriple {
    export class Companion {
        private constructor() { }
        public PUSH = new TransitionTriple("stack-push-in", "stack-push-out")
        public POP = new TransitionTriple("stack-pop-in", "stack-pop-out")
        public PULL_DOWN = new TransitionTriple("stack-pull-down-in", "stack-pull-down-out")
        public PULL_UP = new TransitionTriple("stack-pull-up-in", "stack-pull-up-out")
        public FADE = new TransitionTriple("stack-fade-in", "stack-fade-out")
        public NONE = new TransitionTriple(null, null)
        public GROW_FADE = new TransitionTriple("stack-grow-fade-in", "stack-grow-fade-out")
        public SHRINK_FADE = new TransitionTriple("stack-shrink-fade-in", "stack-shrink-fade-out")
        public static INSTANCE = new Companion()
    }
}

export class StackTransition {
    public constructor(
        public readonly push: TransitionTriple,
        public readonly pop: TransitionTriple,
        public readonly neutral: TransitionTriple,
    ) { }
}

export namespace StackTransition {
    export class Companion {
        private constructor() { }
        public PUSH_POP = new StackTransition(TransitionTriple.Companion.INSTANCE.PUSH, TransitionTriple.Companion.INSTANCE.POP, TransitionTriple.Companion.INSTANCE.FADE)
        public PULL_UP = new StackTransition(TransitionTriple.Companion.INSTANCE.PULL_UP, TransitionTriple.Companion.INSTANCE.PULL_DOWN, TransitionTriple.Companion.INSTANCE.FADE)
        public FADE_IN_OUT = new StackTransition(TransitionTriple.Companion.INSTANCE.FADE, TransitionTriple.Companion.INSTANCE.FADE, TransitionTriple.Companion.INSTANCE.FADE)
        public MODAL = new StackTransition(TransitionTriple.Companion.INSTANCE.GROW_FADE, TransitionTriple.Companion.INSTANCE.SHRINK_FADE, TransitionTriple.Companion.INSTANCE.GROW_FADE)
        public NONE = new StackTransition(TransitionTriple.Companion.INSTANCE.NONE, TransitionTriple.Companion.INSTANCE.NONE, TransitionTriple.Companion.INSTANCE.NONE)
        public static INSTANCE = new Companion()
    }
}

export interface UsesCustomTransition {
    readonly transition: StackTransition
}

export function isUsesCustomTransition(object: any): object is UsesCustomTransition {
    return "transition" in object
}