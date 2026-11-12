// resources/js/components/modals/school-slide-form-modal.tsx
import { useForm } from "@inertiajs/react";
import { useEffect, useRef } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import type { SchoolSlide } from "@/types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    slide: SchoolSlide | null;
}

interface FormData {
    title: string;
    description: string;
    link_url: string;
    link_text: string;
    display_order: string;
    is_active: boolean;
    start_date: string;
    end_date: string;
    image: File | null;
}

const emptyForm: FormData = {
    title: "",
    description: "",
    link_url: "",
    link_text: "",
    display_order: "0",
    is_active: true,
    start_date: "",
    end_date: "",
    image: null,
};

function toDateInput(value: string | null): string {
    if (!value) return "";
    return new Date(value).toISOString().slice(0, 10);
}

export default function SchoolSlideFormModal({
    open,
    onOpenChange,
    slide,
}: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<FormData>({ ...emptyForm });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        clearErrors();
        if (slide) {
            setData({
                title: slide.title ?? "",
                description: slide.description ?? "",
                link_url: slide.link_url ?? "",
                link_text: slide.link_text ?? "",
                display_order: String(slide.display_order ?? 0),
                is_active: slide.is_active ?? true,
                start_date: toDateInput(slide.start_date),
                end_date: toDateInput(slide.end_date),
                image: null,
            });
        } else {
            setData({ ...emptyForm });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, slide?.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                clearErrors();
                onOpenChange(false);
                toast.success(
                    slide
                        ? "Slide updated successfully."
                        : "Slide created successfully.",
                );
            },
            onError: () => toast.error("Please fix the highlighted errors."),
        };

        if (slide) {
            post(route("school-slides.update", slide.id), {
                ...options,
                method: "put" as unknown as "post",
            });
        } else {
            post(route("school-slides.store"), options);
        }
    };

    const handleOpenChange = (next: boolean) => {
        if (processing) return;
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {slide ? "Edit Slide" : "Create Slide"}
                    </DialogTitle>
                    <DialogDescription>
                        {slide
                            ? "Update the slide details below."
                            : "Add a new promotional slide."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            placeholder="e.g. Welcome to our school"
                            autoFocus
                            aria-invalid={!!errors.title}
                        />
                        {errors.title && (
                            <p className="text-xs text-destructive">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            rows={3}
                            maxLength={1000}
                            placeholder="Optional description..."
                            aria-invalid={!!errors.description}
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="image">
                            Image{" "}
                            {!slide && (
                                <span className="text-destructive">*</span>
                            )}
                        </Label>
                        <div className="flex items-center gap-3">
                            {(slide?.image_url || data.image) && (
                                <div className="relative">
                                    <img
                                        src={
                                            data.image
                                                ? URL.createObjectURL(
                                                      data.image,
                                                  )
                                                : (slide?.image_url ?? "")
                                        }
                                        alt="Preview"
                                        className="h-16 w-24 rounded-md object-cover ring-1 ring-border"
                                    />
                                </div>
                            )}
                            <label
                                htmlFor="image"
                                className="flex h-16 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-xs text-muted-foreground hover:bg-muted"
                            >
                                <ImageIcon className="h-4 w-4" />
                                Choose…
                                <input
                                    ref={fileInputRef}
                                    id="image"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={(e) =>
                                        setData(
                                            "image",
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                            </label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            JPG, PNG, or WebP up to 5MB. Recommended 1920×1080.
                        </p>
                        {errors.image && (
                            <p className="text-xs text-destructive">
                                {errors.image}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="link_url">Link URL</Label>
                            <Input
                                id="link_url"
                                type="url"
                                value={data.link_url}
                                onChange={(e) =>
                                    setData("link_url", e.target.value)
                                }
                                placeholder="https://…"
                                aria-invalid={!!errors.link_url}
                            />
                            {errors.link_url && (
                                <p className="text-xs text-destructive">
                                    {errors.link_url}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="link_text">Link text</Label>
                            <Input
                                id="link_text"
                                value={data.link_text}
                                onChange={(e) =>
                                    setData("link_text", e.target.value)
                                }
                                placeholder="e.g. Learn more"
                                maxLength={100}
                                aria-invalid={!!errors.link_text}
                            />
                            {errors.link_text && (
                                <p className="text-xs text-destructive">
                                    {errors.link_text}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="display_order">Order</Label>
                            <Input
                                id="display_order"
                                type="number"
                                min={0}
                                value={data.display_order}
                                onChange={(e) =>
                                    setData("display_order", e.target.value)
                                }
                                aria-invalid={!!errors.display_order}
                            />
                            {errors.display_order && (
                                <p className="text-xs text-destructive">
                                    {errors.display_order}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="start_date">Start</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={data.start_date}
                                onChange={(e) =>
                                    setData("start_date", e.target.value)
                                }
                            />
                            {errors.start_date && (
                                <p className="text-xs text-destructive">
                                    {errors.start_date}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="end_date">End</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={data.end_date}
                                onChange={(e) =>
                                    setData("end_date", e.target.value)
                                }
                            />
                            {errors.end_date && (
                                <p className="text-xs text-destructive">
                                    {errors.end_date}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label
                                htmlFor="is_active"
                                className="cursor-pointer"
                            >
                                Active
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Inactive slides are hidden from the landing
                                page.
                            </p>
                        </div>
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData("is_active", v)}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {slide ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
