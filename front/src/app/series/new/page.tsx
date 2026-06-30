import { SeriesEditorClient } from "../[id]/edit/series-editor-client";

export const dynamic = "force-dynamic";

export default function SeriesNewPage() {
  const emptySeries = {
    id: "new",
    title: "",
    body: "",
  };

  return <SeriesEditorClient initialData={emptySeries} />;
}
