"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {createPost} from "@/lib/post-api";

export default function PostNewPage() {
  const router = useRouter();

  useEffect(() => {
      createPost({title: "", body: "", accessLevel: "FREE", publishStatus: "DRAFT"})
          .then((res) => router.replace(`/posts/${res.id}/edit`))
          .catch(() => router.replace("/posts"));
  }, []);

  return (
      <div className="min-h-screen bg-white pt-16 flex justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"/>
    </div>
  );
}
