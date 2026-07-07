import {apiDelete, apiFetch, apiPost, apiPut, apiUpload} from './api';

export interface SeriesListItem {
    id: number;
    userId: number;
    nickname: string;
    title: string;
    body: string;
    postCount: number;
    thumbnailUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SeriesDetail {
    id: number;
    userId: number;
    nickname: string;
    title: string;
    body: string;
    createdAt: string;
    updatedAt: string;
}

export interface PageResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isLast: boolean;
}

export interface SliceResponse<T> {
    content: T[];
    number: number;
    size: number;
    last: boolean;
    hasNext: boolean;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface SeriesMedia {
    id: number;
    seriesId: number;
    url: string;
    mediaType: string;
}

export interface PostListItem {
    id: number;
    userId: number | null;
    seriesId: number | null;
    title: string;
    publishStatus: string;
    accessLevel: string;
    viewCount: number;
    likeCount: number;
    bookmarkCount: number;
    isLiked: boolean;
    isBookmarked: boolean;
    createdAt: string;
}

export function getSeriesList(page = 0) {
    return apiFetch<SliceResponse<SeriesListItem>>(`/api/series?page=${page}`, {cache: 'no-store'});
}

export function searchSeries(keyword: string, page = 0) {
    return apiFetch<PageResponse<SeriesListItem>>(
        `/api/series/search?keyword=${encodeURIComponent(keyword)}&page=${page}`,
        {cache: 'no-store'}
    );
}

export function getSeries(id: number | string) {
    return apiFetch<SeriesDetail>(`/api/series/${id}`, {cache: 'no-store'});
}

export function getSeriesPosts(id: number | string) {
    return apiFetch<PostListItem[]>(`/api/series/${id}/posts`, {cache: 'no-store'});
}

export function getSeriesMedia(id: number | string) {
    return apiFetch<SeriesMedia>(`/api/series/${id}/medias`, {cache: 'no-store'});
}

export function getMySeries(page = 0) {
    return apiFetch<PageResponse<SeriesListItem>>(`/api/series/me?page=${page}`);
}

export function getUserSeries(userId: number, page = 0) {
    return apiFetch<PageResponse<SeriesListItem>>(`/api/series/users/${userId}?page=${page}`);
}

export function createSeries(title: string, body: string) {
    return apiPost<SeriesDetail>('/api/series', {title, body});
}

export function updateSeries(id: number | string, title: string, body: string) {
    return apiPut<SeriesDetail>(`/api/series/${id}`, {title, body});
}

export function deleteSeries(id: number | string) {
    return apiDelete(`/api/series/${id}`);
}

export function uploadSeriesMedia(id: number | string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiUpload<SeriesMedia>(`/api/series/${id}/medias`, formData);
}

export function deleteSeriesMedia(id: number | string) {
    return apiDelete(`/api/series/${id}/medias`);
}

export function getMyPosts() {
    return apiFetch<PageResponse<PostListItem>>('/api/posts/me?size=100', {cache: 'no-store'});
}

export function addPostToSeries(seriesId: number | string, postId: number): Promise<void> {
    return apiPost<void>(`/api/series/${seriesId}/posts/${postId}`);
}

export function removePostFromSeries(seriesId: number | string, postId: number): Promise<void> {
    return apiDelete(`/api/series/${seriesId}/posts/${postId}`);
}
