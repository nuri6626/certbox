import { supabase } from "./supabase";
import type { Certificate } from "../types/certificate";

export const getCertificates = async (userId: string): Promise<Certificate[]> => {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((item) => ({
    id: item.id,
    title: item.title,
    issuer: item.issuer || "",
    holderName: item.holder_name || "",
    issueDate: item.issue_date || "",
    expiryDate: item.expiry_date || "",
    category: item.category || "기타",
    certificateNumber: item.certificate_number || "",
    score: item.score || "",
    grade: item.grade || "",
    imageUrl: item.image_url || "",
    extraData: item.extra_data || {},
  }));
};