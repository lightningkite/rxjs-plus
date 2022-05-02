import {from, map, mergeMap, Observable, of} from "rxjs";
import {HttpBody} from "./http";

export type StringResource = string

export type Image = ImageReference | ImageImageBitmap | ImageRaw | ImageRemoteUrl | ImageResource
export type ImageReference = { uri: File }
export type ImageImageBitmap = { bitmap: ImageBitmap }
export type ImageRaw = { raw: Blob }
export type ImageRemoteUrl = { url: string }
export type ImageResource = { name: string, file?: string }

export type Video = VideoReference | VideoRemoteUrl
export type VideoReference = { uri: File }
export type VideoRemoteUrl = { url: string }

export function imageElementSet(imageView: HTMLImageElement, image: Image | null) {
    if (image === null) {
        imageView.src = ""
    } else if ('uri' in image) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const reader = e.target;
            if (reader !== null) {
                imageView.src = reader.result as string;
            }
        }
        reader.readAsDataURL(image.uri)
    } else if ('bitmap' in image) {
        let canvasElement = document.createElement("canvas");
        canvasElement.width = image.bitmap.width;
        canvasElement.height = image.bitmap.height;
        const ctx = canvasElement.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            ctx.drawImage(image.bitmap, 0, 0);
        }
        canvasElement.toBlob((blob) => {
            if (blob === null) return
            imageView.src = URL.createObjectURL(blob);
        })
    } else if ('raw' in image) {
        imageView.src = URL.createObjectURL(new Blob([image.raw]))
    } else if ('url' in image) {
        imageView.src = image.url
    } else if ('name' in image) {
        imageView.src = image.file ?? ("drawables/" + image.name)
    }
}

export function imageToBitmap(image: Image): Observable<ImageBitmap> {
    if ('uri' in image) {
        return from(createImageBitmap(image.uri))
    } else if ('bitmap' in image) {
        return of(image.bitmap)
    } else if ('raw' in image) {
        return from(createImageBitmap(image.raw))
    } else if ('url' in image) {
        return from(fetch(image.url))
            .pipe(mergeMap((x) => {
                return x.blob()
            }))
            .pipe(mergeMap((x) => {
                return createImageBitmap(x);
            }))
    } else if ('name' in image) {
        return from(fetch(image.file ?? ("drawables/" + image.name)))
            .pipe(mergeMap((x) => {
                return x.blob()
            }))
            .pipe(mergeMap((x) => {
                return createImageBitmap(x);
            }))
    } else return fail(new Error("Type of image not recognized"))
}

export function videoElementSet(videoView: HTMLVideoElement, video: Video | null) {
    if (video === null) {
        videoView.src = ""
    } else if ('uri' in video) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const reader = e.target;
            if (reader !== null) {
                videoView.src = reader.result as string;
            }
        }
        reader.readAsDataURL(video.uri)
    } else if ('url' in video) {
        videoView.src = video.url
    }
}

//! Declares com.lightningkite.rx.android.net.toBody
export function imageToBody(this_: Image, maxDimension: number = 2048, maxBytes: number = 10_000_000): Observable<HttpBody> {
    return imageToBitmap(this_).pipe(
        mergeMap((x) => resize(x, maxDimension))
    )
}

function resize(image: ImageBitmap, maxDimension: number): Observable<Blob> {
    return new Observable((em) => {
        try {
            let canvasElement = document.createElement("canvas");
            const wide = image.width > image.height;
            const tooBig = image.width > maxDimension || image.height > maxDimension;
            canvasElement.width = !tooBig ? image.width : (
                wide ? maxDimension : image.width / image.height * maxDimension
            );
            canvasElement.height = !tooBig ? image.height : (
                wide ? image.height / image.width * maxDimension : maxDimension
            );
            const ctx = canvasElement.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                ctx.drawImage(image, 0, 0, image.width, image.height, 0,0, canvasElement.width, canvasElement.height);
            }
            canvasElement.toBlob((x) => {
                if (x) {
                    em.next(x);
                    em.complete();
                } else {
                    em.error(new Error("Unknown error rendering image"))
                }
            });
        } catch (e) {
            em.error(e)
        }
    });
}