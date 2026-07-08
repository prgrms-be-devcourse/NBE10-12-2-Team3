import {apiPost, apiPut, apiUpload} from "@/lib/api";

interface PostPayload {
    title: string;
    body: string;
    accessLevel: "FREE" | "PAID";
    publishStatus: "PUBLIC" | "PRIVATE" | "DRAFT";
    seriesId?: number | null;
}

export async function createPost(data: PostPayload): Promise<{ id: number }> {
    return apiPost<{ id: number }>("/api/posts", data);
}

export async function updatePost(id: number, data: PostPayload): Promise<void> {
    await apiPut<void>(`/api/posts/${id}`, data);
}

export async function uploadThumbnail(postId: number, file: File): Promise<void> {
    const form = new FormData();
    form.append("file", file);
    await apiUpload<void>(`/api/posts/${postId}/medias?type=THUMBNAIL`, form);
}
