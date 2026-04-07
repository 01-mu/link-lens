import type { MetadataRecord } from '~/types/metadata';

export type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type MetadataResponse =
  | {
      ok: true;
      data: MetadataRecord;
    }
  | ApiError;
