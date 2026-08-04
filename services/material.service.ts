import { supabase } from "@/lib/supabase";

import type {
  CourseMaterial,
  MaterialType,
} from "@/types/material";

export async function getMaterialsByCourse(
  courseId: number
): Promise<CourseMaterial[]> {
  const { data, error } = await supabase
    .from("course_materials")
    .select("*")
    .eq("course_id", courseId)
    .order("position", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getMaterialsByVideo(
  videoId: number
): Promise<CourseMaterial[]> {
  const { data, error } = await supabase
    .from("course_materials")
    .select("*")
    .eq("video_id", videoId)
    .order("position", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function uploadMaterialFile(
  videoId: number,
  file: File
): Promise<string> {
  const fileExtension =
    file.name.split(".").pop() ?? "file";

  const safeFileName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-");

  const filePath =
    `${videoId}/` +
    `${Date.now()}-${crypto.randomUUID()}-` +
    `${safeFileName}.${fileExtension}`;

  const { error: uploadError } =
    await supabase.storage
      .from("course-materials")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("course-materials")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

type CreateMaterialData = {
  course_id: number;
  video_id: number;
  title: string;
  description?: string;
  material_type: MaterialType;
  file_url?: string;
  content?: string;
  position?: number;
  is_visible?: boolean;
allow_download?: boolean;
is_required?: boolean;
is_preview?: boolean;
};

export async function createMaterial(
  materialData: CreateMaterialData
): Promise<CourseMaterial> {
  const { data, error } = await supabase
    .from("course_materials")
    .insert({
      is_visible: materialData.is_visible ?? true,
allow_download: materialData.allow_download ?? true,
is_required: materialData.is_required ?? false,
is_preview: materialData.is_preview ?? false,
      course_id: materialData.course_id,
      video_id: materialData.video_id,
      title: materialData.title,
      description:
        materialData.description?.trim() || null,
      material_type: materialData.material_type,
      file_url: materialData.file_url ?? null,
      content: materialData.content?.trim() || null,
      position: materialData.position ?? 0,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as CourseMaterial;
}
export async function deleteMaterial(
  materialId: number
) {
  const { error } = await supabase
    .from("course_materials")
    .delete()
    .eq("id", materialId);

  if (error) {
    throw error;
  }
}
export async function updateMaterial(
  materialId: number,
  data: {
    title: string;
    description?: string;
    material_type: MaterialType;
    file_url?: string;
    content?: string;
    is_visible: boolean;
    allow_download: boolean;
    is_required: boolean;
    is_preview: boolean;
  }
) {
  const { error } = await supabase
    .from("course_materials")
    .update({
      title: data.title,
      description: data.description ?? null,
      material_type: data.material_type,
      file_url: data.file_url ?? null,
      content: data.content ?? null,
      is_visible: data.is_visible,
      allow_download: data.allow_download,
      is_required: data.is_required,
      is_preview: data.is_preview,
    })
    .eq("id", materialId);

  if (error) {
    throw error;
  }
}