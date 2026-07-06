import {notFound} from "next/navigation";
import {SeriesEditorClient} from "./series-editor-client";
import {getSeries, getSeriesMedia} from "@/lib/series-api";
import {resolveMediaUrl} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function SeriesEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
    const {id} = await params;

    const series = await getSeries(id).catch(() => notFound());

    let thumbnailUrl = "";
    try {
        const media = await getSeriesMedia(id);
        thumbnailUrl = resolveMediaUrl(media.url);
    } catch {
        // 썸네일 없음
  }

    return (
        <SeriesEditorClient
            initialData={{
                id,
                title: series.title,
                body: series.body,
                thumbnailUrl,
            }}
        />
    );
}
