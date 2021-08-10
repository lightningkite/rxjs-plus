export type DisposeCondition = (subscription: {unsubscribe: ()=>void}) => void

export function disposeOr(...conditions: Array<DisposeCondition>): DisposeCondition {
    return x => {
        for (const c of conditions) c(x)
    }
}

export function disposeAnd(...conditions: Array<DisposeCondition>): DisposeCondition {
    return sub => {
        let count = conditions.length
        for (const c of conditions) {
            c({
                unsubscribe() {
                    count--
                    if (count === 0) sub.unsubscribe()
                }
            })
        }
    }
}

// export function until(condition: DisposeCondition): (s:Subscription) => void {
//     return condition
// }