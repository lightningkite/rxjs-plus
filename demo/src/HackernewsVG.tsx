import {bind, subscribeAutoDispose, ViewGenerator, forEach} from '@lightningkite/rxjs-plus'
import html from './BindTestVG.html'
import {BehaviorSubject, from, map, Observable} from "rxjs";
import {switchMap} from "rxjs/operators";
import {fromFetch} from "rxjs/fetch";

export class HackernewsVG implements ViewGenerator {
    readonly titleString: string = "Hackernews API Example"

    articles = from(fetch("https://hacker-news.firebaseio.com/v0/showstories.json?print=pretty").then(x => x.json())) as Observable<Array<number>>

    generate(window: Window): HTMLElement {
        return <div>
            <p>Here are some Hacker News articles</p>
            <div>
                {forEach(this.articles, obs => (<div><a onClick={ev => {

                }}>{
                    obs.pipe(
                        switchMap(it => from(fetch(`https://hacker-news.firebaseio.com/v0/item/${it}.json?print=pretty`).then(x => x.json()))),
                        map((x: Entry) => x.title)
                    )
                }</a></div>))}
            </div>
        </div>
    }
}

interface Entry {
    by: string
    title: string
    text: string
    kids: Array<number>
}