import * as v from 'valibot';

export const metadataRequestSchema = v.object({
  url: v.pipe(
    v.string(),
    v.trim(),
    v.url('Enter a valid URL.'),
    v.check((value) => {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }, 'Only http:// and https:// URLs are supported.'),
  ),
});
