export interface AssetData {
  id: string;
  sys: {
    createdAt: string | null;
    createdBy: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
    publishedAt: string | null;
  };
  title: string;
  description: string;
  altText: string;
  tagIds: string[];
  file: {
    name: string;
    mimeType: string;
    src: string;
    size: number;
    width?: number | null;
    height?: number | null;
  };
}
