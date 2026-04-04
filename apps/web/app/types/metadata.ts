export type MetadataRecord = {
  title: string | null;
  description: string | null;
  siteName: string | null;
  ogImage: string | null;
  canonical: string | null;
  favicon: string | null;
  finalUrl: string;
};

export type MetadataField = {
  key: keyof MetadataRecord;
  label: string;
};
