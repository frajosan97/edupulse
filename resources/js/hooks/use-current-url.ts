import type { InertiaLinkProps } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';

type Href = NonNullable<InertiaLinkProps['href']>;
type OptionalHref = Href | undefined;

export type IsCurrentUrlFn = (
    urlToCheck: OptionalHref,
    currentUrl?: string,
    startsWith?: boolean,
) => boolean;

export type IsCurrentOrParentUrlFn = (
    urlToCheck: OptionalHref,
    currentUrl?: string,
) => boolean;

export type WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
    urlToCheck: OptionalHref,
    ifTrue: TIfTrue,
    ifFalse?: TIfFalse,
) => TIfTrue | TIfFalse;

export type UseCurrentUrlReturn = {
    currentUrl: string;
    isCurrentUrl: IsCurrentUrlFn;
    isCurrentOrParentUrl: IsCurrentOrParentUrlFn;
    whenCurrentUrl: WhenCurrentUrlFn;
};

export function useCurrentUrl(): UseCurrentUrlReturn {
    const page = usePage();
    const currentUrlPath = new URL(
        page.url,
        typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost',
    ).pathname;

    const isCurrentUrl: IsCurrentUrlFn = (
        urlToCheck,
        currentUrl,
        startsWith = false,
    ) => {
        if (!urlToCheck) return false;

        const urlToCompare = currentUrl ?? currentUrlPath;
        const urlString = toUrl(urlToCheck);

        const comparePath = (path: string): boolean =>
            startsWith ? urlToCompare.startsWith(path) : path === urlToCompare;

        if (!urlString.startsWith('http')) {
            return comparePath(urlString);
        }

        try {
            const absoluteUrl = new URL(urlString);
            return comparePath(absoluteUrl.pathname);
        } catch {
            return false;
        }
    };

    const isCurrentOrParentUrl: IsCurrentOrParentUrlFn = (
        urlToCheck,
        currentUrl,
    ) => isCurrentUrl(urlToCheck, currentUrl, true);

    const whenCurrentUrl: WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
        urlToCheck: OptionalHref,
        ifTrue: TIfTrue,
        ifFalse: TIfFalse = null as TIfFalse,
    ): TIfTrue | TIfFalse => (isCurrentUrl(urlToCheck) ? ifTrue : ifFalse);

    return {
        currentUrl: currentUrlPath,
        isCurrentUrl,
        isCurrentOrParentUrl,
        whenCurrentUrl,
    };
}