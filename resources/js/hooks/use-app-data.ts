import { usePage } from '@inertiajs/react';

/* ------------------------------------------------------------------ */
/* Core context shapes                                                 */
/* ------------------------------------------------------------------ */

export interface AppContact {
    name: string;
    phone: string;
    email: string;
    address: string;
    motto: string;
    mission: string;
    vission: string;
    description: string;
}

export interface AppOtherImages {
    avatar: string;
    analytics: string;
    finance: string;
    sms: string;
    elearning: string;
    contact: string;
}

export interface AppImages {
    logo: string;
    welcome: string;
    background: string;
    stamp: string;
    signature: string;
    empty_state_img: string;
    others: AppOtherImages;
}

export interface AppTheme {
    primary_color: string;
    secondary_color: string;
}

export interface SystemPortal {
    name: string;
    url: string;
    icon: string;
}

export interface Tenant {
    id: string;
    name: string;
    [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/* Statistics                                                          */
/* ------------------------------------------------------------------ */

export interface AppStat {
    title: string;
    to: number | string;
    suffix: string;
    icon: string;
}

/* ------------------------------------------------------------------ */
/* Slides                                                              */
/* ------------------------------------------------------------------ */

export interface AppSlideStat {
    icon: string;
    label: string;
    value: string;
}

export interface AppSlide {
    id?: string;
    title: string;
    text: string;
    cta: string;
    href: string;
    image: string;
    stat?: AppSlideStat;
}

/* ------------------------------------------------------------------ */
/* Context payload                                                     */
/* ------------------------------------------------------------------ */

export interface AppContextData {
    platform_name?: string;
    platoform_name?: string; // Legacy typo
    contacts: AppContact;
    images: AppImages;
    themes: AppTheme;
    system_portals: SystemPortal[];
    stats_data?: AppStat[];
    slides?: AppSlide[];
}

export interface AppContext {
    is_landlord: boolean;
    tenant: Tenant | null;
    data: AppContextData;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    [key: string]: unknown;
}

export interface FlashMessages {
    success: string | null;
    error: string | null;
}

export interface PageProps {
    name: string;
    auth: {
        user: AuthUser | null;
    };
    sidebarOpen: boolean;
    context: AppContext;
    flash: FlashMessages;
    [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useAppData() {
    const { props } = usePage<PageProps>();

    const context = props.context;
    const data = context.data;

    const platformName =
        data.platform_name ??
        data.platoform_name ??
        props.name ??
        '';

    return {
        // Context
        context,
        isLandlord: context.is_landlord,
        tenant: context.tenant,

        // Branding
        platformName,
        contacts: data.contacts,
        images: data.images,
        themes: data.themes,

        // System portals
        systemPortals: data.system_portals ?? [],

        // Statistics
        statsData: data.stats_data ?? [],

        // Dynamic content
        slides: data.slides ?? [],

        // Auth / UI
        user: props.auth.user,
        flash: props.flash,
        sidebarOpen: props.sidebarOpen,
        props,
    };
}

export default useAppData;