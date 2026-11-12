// resources/js/types/school-slide.ts
export interface SchoolSlide {
    id: number;
    title: string;
    description: string | null;
    image_path: string | null;
    image_url: string | null;
    link_url: string | null;
    link_text: string | null;
    display_order: number;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    deleted_at: string | null;
}